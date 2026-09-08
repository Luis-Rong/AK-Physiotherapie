# Betrieb der Reha-Plattform

Stand: 2026-09-02 · gilt für Staging (eigener Server, nur Testdaten) und Produktion
(Hetzner, ADR 0008). Alles hier ist Teil der monatlichen Betriebspauschale
(`docs/legal/checkliste.md`, Kundenvertrag).

## Lokale Entwicklung

```bash
pnpm install
cd apps/reha && cp .env.example .env.local   # BETTER_AUTH_SECRET setzen
pnpm dev             # Postgres (:5433) + Migrationen + Seed + Next (http://localhost:3000)
```

`pnpm dev` startet das eingebettete Postgres, wendet Migrationen an, seedet bei leerer
Datenbank die synthetischen Konten und startet dann Next – ein Terminal, ein Befehl.
Die Zugänge stehen beim Start in der Konsole. Das Praxis-Konto `physio@example.test`
hat einen festen Test-TOTP-Schlüssel: `pnpm totp` zeigt den aktuellen Code, oder den
Base32-Schlüssel aus der Startausgabe einmalig in eine Authenticator-App eintragen.

**Uploads:** `UPLOAD_DIR` enthält Bilder für Wissensinhalte (direkt) und Patientendateien
unter `patienten/<id>/`. Beides gehört ins Backup; Patientendateien unterliegen dem
Löschkonzept (`docs/legal/prozesse/loeschkonzept.md`).

**Erstes Praxiskonto auf einem frischen System:** `pnpm praxis:konto --name "Vorname
Nachname" --email name@praxis.example` (mit den Umgebungsvariablen des Zielsystems).
Gibt ein temporäres Passwort aus, das persönlich übergeben wird; beim ersten Login
folgen Passwortwechsel und 2FA-Einrichtung. Kein SQL von Hand nötig.

Weitere Skripte: `pnpm dev:next` (nur Next, wenn Postgres schon läuft), `pnpm db:local`
(nur Postgres), `pnpm db:seed`, `pnpm test` (Vitest inkl. DB-Test gegen echtes Postgres),
`pnpm test:e2e` (Playwright gegen Produktions-Build auf :3100 mit eigenem Postgres auf :5455;
vorher einmalig `pnpm exec playwright install chromium`),
`pnpm lint`, `pnpm typecheck`, `pnpm db:reset` (leert alle Tabellen, nie in Prod),
`pnpm db:migrate` (gegen `DATABASE_URL_OWNER`).

Seed-Konten stehen in `packages/testdata`. Es gibt keine echten Daten außerhalb der
Produktion (Regel 1).

## Server und Domain live schalten (Anleitung für Roko)

Ziel: dein Server unter deiner (Sub-)Domain erreichbar, GitHub deployt automatisch bei
jedem Push auf `main`. Staging läuft ausschließlich mit synthetischen Daten (Regel 1) –
für Produktion gilt derselbe Ablauf auf dem Hetzner-Server, zusätzlich Backup (Schritt 4).

**Voraussetzung:** ein Server mit Root- oder Sudo-Zugriff und öffentlicher IPv4-Adresse,
eine (Sub-)Domain, die du auf diesen Server zeigen lassen kannst.

**0. DNS.** Bei deinem Domain-Anbieter einen **A-Record** der (Sub-)Domain (z. B.
`staging.deine-domain.de`) auf die Server-IP setzen. Nichts weiter konfigurieren – Caddy
im Compose-Stack holt sich das TLS-Zertifikat beim ersten Start selbst (Let's Encrypt,
einzige ausgehende Verbindung des Servers, keine Patientendaten). DNS-Änderungen
brauchen oft ein paar Minuten bis Stunden, bis sie überall ankommen.

**1. Server vorbereiten** (einmalig, per SSH auf dem Server):

```bash
apt update && apt install -y docker.io docker-compose-plugin ufw
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable
mkdir -p /opt/reha /etc/reha
```

**2. Eigenen SSH-Schlüssel für GitHub Actions erzeugen** (auf deinem eigenen Rechner,
**nicht** auf dem Server – dieser Schlüssel gehört gleich als Secret zu GitHub):

```bash
ssh-keygen -t ed25519 -f deploy_reha -N ""
ssh-copy-id -i deploy_reha.pub DEIN_USER@DEIN_SERVER
```

Kein `ssh-copy-id` zur Hand? Inhalt von `deploy_reha.pub` per Hand ans Ende von
`~/.ssh/authorized_keys` auf dem Server anhängen.

**3. Geheimnisse erzeugen und in `/etc/reha/staging.env` eintragen** (auf dem Server,
danach `chmod 600 /etc/reha/staging.env`):

```bash
openssl rand -base64 24   # → POSTGRES_PASSWORD
openssl rand -base64 24   # → REHA_OWNER_PASSWORD
openssl rand -base64 24   # → REHA_APP_PASSWORD
openssl rand -base64 48   # → BETTER_AUTH_SECRET
```

Datei-Inhalt (jeweils den erzeugten Wert einsetzen):

```
PORTAL_HOST=staging.deine-domain.de
POSTGRES_PASSWORD=…
REHA_OWNER_PASSWORD=…
REHA_APP_PASSWORD=…
BETTER_AUTH_SECRET=…
PAIN_TRAFFIC_LIGHT=on
```

**4. Nur für Produktion zusätzlich:** `BACKUP_PASSPHRASE` (`openssl rand -base64 48`) in
`/etc/reha/prod.env` – Verlust dieser Passphrase macht alle Backups wertlos, also an
einem zweiten Ort sicher ablegen (Passwort-Manager, Tresor), nicht nur auf dem Server.

**5. Secrets in GitHub hinterlegen:** Repo auf github.com → **Settings → Environments →
New environment**, Name exakt `staging` (für Produktion später zusätzlich `prod`).
Darin unter „Environment secrets" drei Secrets anlegen:

| Name | Wert |
|---|---|
| `DEPLOY_HOST` | Server-IP oder Domain des Servers |
| `DEPLOY_USER` | dein SSH-Benutzername auf dem Server |
| `DEPLOY_SSH_KEY` | kompletter Inhalt von `deploy_reha` (der **private** Schlüssel aus Schritt 2, nicht `.pub`) |

**6. Fertig.** Der nächste Push auf `main` baut das Image und deployt automatisch auf
Staging (Workflow „Deploy" unter dem Actions-Tab des Repos). Für einen manuellen Lauf:
Actions → Deploy → „Run workflow" → `target: staging`. Produktion läuft **nie**
automatisch, sondern nur über denselben manuellen Start mit `target: prod`, nach
Abnahme auf Staging.

**Fehlersuche:** Schlägt der `deploy`-Job mit „can't connect without a private SSH key
or password" fehl, fehlt eines der drei Secrets oder der öffentliche Schlüssel steht
nicht auf dem Server. Log steht unter Actions → der fehlgeschlagene Lauf → Job `deploy`.

Erster Start legt über `docker/init/01-roles.sql` Rollen und Datenbank an; der
Dienst `migrate` wendet die SQL-Migrationen an, danach startet `app`.

Erstes Praxiskonto: `docker compose exec app node -e` ist bewusst nicht vorgesehen.
Stattdessen einmalig ein Konto per SQL-Skript anlegen (Owner-Rolle), Passwort mit
`mustChangePassword = true`; danach legt die Praxis alle weiteren Konten im Portal an.

## Backup und Wiederherstellung (nur Prod)

- Der Dienst `backup` erzeugt täglich `reha-db-<Zeit>.dump.gpg` und
  `reha-uploads-<Zeit>.tar.gpg` im Volume `backups`, symmetrisch verschlüsselt.
- Host-Cronjob (täglich 03:30): `rclone sync /var/lib/docker/volumes/reha-prod_backups/_data
  storagebox:reha-backups` auf die Hetzner Storage Box (gleicher Anbieter, EU).
- **Restore-Test vor dem ersten echten Patienten und danach vierteljährlich:**

```bash
gpg --decrypt reha-db-XXXX.dump.gpg > reha.dump
docker compose -f compose.staging.yml exec -T db pg_restore -U postgres -d reha --clean --if-exists < reha.dump
```

  Danach Login mit einem Testkonto prüfen und das Ergebnis mit Datum in dieser Datei
  vermerken.

## Was bei einem Vorfall zu tun ist

Meldefrist 72 Stunden (Art. 33 DSGVO). Der Ablauf steht in `docs/legal/checkliste.md`
(Incident-Prozess) und muss vor Produktivbetrieb mit dem Physio festgelegt sein.
Sofortmaßnahmen: betroffene Konten sperren (Praxis → Zugang → Sperren), Sitzungen
beenden, `login_events` und `audit_log` sichern, nicht löschen.

## Restore-Tests

| Datum | Wer | Ergebnis |
|---|---|---|
| – | – | noch nicht durchgeführt |
