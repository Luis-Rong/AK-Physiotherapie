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

## Server vorbereiten (Staging wie Prod)

1. Docker Engine + Compose-Plugin, `ufw` mit nur 22/80/443, SSH nur mit Schlüssel.
2. `/opt/reha` anlegen; die Deploy-Pipeline kopiert `apps/reha/docker/*` dorthin.
3. `/etc/reha/<staging|prod>.env` mit `chmod 600` und den Werten:

```
PORTAL_HOST=portal.akphysiotherapie.de
POSTGRES_PASSWORD=…            # Superuser des Containers, nur für Backups
REHA_OWNER_PASSWORD=…          # Migrationen
REHA_APP_PASSWORD=…            # Anwendung (eingeschränkte Rolle, ADR 0002)
BETTER_AUTH_SECRET=…           # openssl rand -base64 48
BACKUP_PASSPHRASE=…            # nur Prod; Verlust = Backups wertlos, im Tresor ablegen
PAIN_TRAFFIC_LIGHT=on          # off = Rückfall nach ADR 0007
```

4. DNS: A/AAAA-Record der Subdomain auf den Server. Caddy holt das TLS-Zertifikat
   selbst (einzige ausgehende Verbindung, keine Patientendaten).
5. GitHub-Environment `staging` bzw. `prod` mit Secrets `DEPLOY_HOST`, `DEPLOY_USER`,
   `DEPLOY_SSH_KEY`. Produktion nur per manuellem Workflow-Start nach Abnahme.

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
