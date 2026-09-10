# ADR 0015: Reha-Staging hinter dem bestehenden Nginx auf Rokos Server

- **Status:** akzeptiert
- **Datum:** 2026-09-10
- **Beteiligte:** Roko, Claude

## Kontext

Staging der Reha-Plattform soll laut [ADR 0008](0008-tech-stack-reha-plattform.md) auf
dem „vorhandenen eigenen Server" mit ausschließlich synthetischen Daten laufen. Dieser
Server ist Rokos Hetzner-VPS (CX23, 4 GB RAM), auf dem bereits eine produktive
Laravel-Anwendung liegt: Nginx auf Port 80/443, PHP-FPM, MySQL, Certbot, zwei vhosts
(`rokoskaric.de`, `staging.rokoskaric.de`).

`compose.staging.yml` bringt einen eigenen Caddy mit, der die Host-Ports 80 und 443
exklusiv belegt. Auf diesem Server hält die schon der vorhandene Nginx – der Caddy
könnte nicht binden, und ein zweiter ACME-Client neben Certbot ist unnötig.

## Entscheidung

Für diesen Server läuft die Reha-App **ohne den gebündelten Caddy**:

- Neue Datei `apps/reha/docker/compose.staging-shared.yml`: wie `compose.staging.yml`,
  aber ohne den `caddy`-Dienst; `app` veröffentlicht auf `127.0.0.1:3000`.
- Der vorhandene Nginx bekommt einen vhost `reha.rokoskaric.de`, der per
  `proxy_pass` an `127.0.0.1:3000` weiterleitet. TLS über Certbot wie die anderen vhosts.
- `ufw` aus `betrieb.md` wird auf diesem Server **nicht** aktiviert – das bestehende
  Setup läuft ohne Host-Firewall, und ein nachträgliches `ufw --force enable` mit nur
  22/80/443 würde bestehende Dienste abschneiden.
- 2 GB Swap, weil 4 GB RAM mit MySQL + PHP-FPM + Postgres-Container + Next.js knapp sind.

Das Docker-Image wird **nicht auf dem Server gebaut** (RAM), sondern von GitHub Actions
gebaut und aus `ghcr.io` gezogen.

## Begründung

- Nur eine Komponente terminiert TLS und belegt 80/443. Zwei ACME-Clients auf einem
  Host sind eine Fehlerquelle ohne Nutzen.
- Die App an den Loopback zu binden statt an `0.0.0.0` heißt: sie ist von außen nur über
  den Nginx-vhost erreichbar, nie direkt auf `:3000`. Ersetzt hier die Firewall-Regel.
- Produktion bleibt unberührt: dort gilt weiter `compose.prod.yml` mit Caddy auf einem
  dedizierten Hetzner-Server (ADR 0008), inklusive Backup-Dienst.

## Konsequenzen

- Zusätzlicher Pfad, der gepflegt werden muss: `compose.staging-shared.yml` und
  `compose.staging.yml` müssen bei Änderungen an Umgebung/Diensten parallel nachgezogen
  werden. Gemeinsame Teile sind bewusst dupliziert statt über `extends` verschachtelt,
  weil Compose-`extends` `depends_on` nicht überträgt.
- Der Deploy-Workflow (`.github/workflows/deploy.yml`) zielt weiter auf
  `compose.$TARGET.yml`. Auf Rokos Server wird **manuell** deployt (per SSH
  `docker compose -f compose.staging-shared.yml … up -d`), bis wir den Workflow um ein
  drittes Target erweitern.
- Nginx-Reload und Certbot-Renewal des bestehenden Servers betreffen jetzt auch die
  Reha-Subdomain.
- Fehlender `docker/init/`-Ordner (Rollen-Skript) wird in diesem Zug ergänzt – er fehlte
  im Repo und hätte jeden Compose-Deploy (auch Produktion) scheitern lassen.

## Verworfene Alternativen

- **Gebündelten Caddy auf anderen Ports (8080/8443) laufen lassen, Nginx davor:** zwei
  Reverse Proxies hintereinander, doppelte Header-Behandlung, kein Gewinn.
- **Bestehenden Nginx durch Caddy ersetzen und beide Sites über Caddy ausliefern:**
  großer Eingriff in ein laufendes Produktivsystem, das nicht Teil dieses Projekts ist.
- **Eigener kleiner VPS nur für Reha-Staging:** sauberer, aber zusätzliche Kosten und
  Betrieb für eine reine Testumgebung. Für Produktion ist der dedizierte Server ohnehin
  gesetzt (ADR 0008).
- **Image auf dem Server bauen:** ein Next.js-Build zieht kurzzeitig 1–2 GB und würde
  neben MySQL/PHP-FPM den OOM-Killer riskieren.
