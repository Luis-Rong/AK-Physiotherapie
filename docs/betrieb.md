# Betrieb der Reha-Plattform

Stand: 2026-09-02 · gilt für Staging (eigener Server, nur Testdaten) und Produktion
(Hetzner, ADR 0008). Alles hier ist Teil der monatlichen Betriebspauschale
(`docs/legal/checkliste.md`, Kundenvertrag).

## Lokale Entwicklung

```bash
pnpm install
cd apps/reha && cp .env.example .env.local   # BETTER_AUTH_SECRET setzen
pnpm db:local        # eingebettetes Postgres auf :5433, Rollen, Migrationen; läuft weiter
pnpm db:seed         # synthetische Konten und Inhalte (in zweitem Terminal)
pnpm dev             # http://localhost:3000
```

Weitere Skripte: `pnpm test` (Vitest inkl. DB-Test gegen echtes Postgres),
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
