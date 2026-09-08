# ADR 0008: Tech-Stack und Zuschnitt der Reha-Plattform

- **Status:** akzeptiert
- **Datum:** 2026-09-02
- **Beteiligte:** Luis, Claude

## Kontext

Die Website ist zurückgestellt, die Reha-Plattform (Digitalisierung des
Rehabilitationstagebuchs) hat Vorrang. Sie verarbeitet Gesundheitsdaten (Art. 9 DSGVO,
§ 203 StGB) und muss ADR 0002 (append-only), ADR 0003 (null Drittanbieter), ADR 0005
(provisionierte Konten) und Regel 5 (EU-Hosting) erfüllen. Das Team besteht aus zwei
Personen; Betriebsaufwand ist ein echter Kostenfaktor.

## Entscheidung

| Baustein | Wahl |
|---|---|
| Hosting | **Hetzner Cloud** (DE, RZ Falkenstein/Nürnberg), ein VPS mit Docker Compose, Backups verschlüsselt auf Hetzner Storage Box |
| Anwendung | **Next.js (App Router) + TypeScript**, Server Actions, Tailwind, shadcn/ui; alle Assets gebündelt und selbst ausgeliefert |
| Zuschnitt | **Eine App `apps/reha`** mit zwei Bereichen: `/app` (Patient) und `/praxis` (Physio/Admin), Trennung über Rollen. Abweichung von `apps/portal` + `apps/praxis` in CLAUDE.md |
| Datenbank | **PostgreSQL 16 + Drizzle ORM**, Migrationen als SQL-Dateien, in denen Rollen, GRANTs und Trigger für ADR 0002 stehen |
| Auth | **better-auth**, selbst gehostet im App-Prozess: E-Mail + Passwort, Sessions in Postgres, TOTP-2FA (Pflicht für Praxis-Rolle), Admin-Plugin, Rate-Limit |
| E-Mail | **Kein Mailversand im ersten Release.** Link und temporäres Passwort übergibt der Physio selbst (ADR 0005). Benachrichtigungen später mit EU-Versender |
| Umgebungen | Lokal (eingebettetes Postgres), Staging auf vorhandenem eigenem Server mit **ausschließlich synthetischen Daten**, Produktion auf Hetzner |

## Begründung

- Hetzner: deutscher Anbieter, AV-Vertrag standardmäßig, § 203-Verpflichtung möglich,
  bei Aufsicht und Physio leicht zu erklären; günstig genug für eine Praxis.
- Next.js: größtes Ökosystem, Formulare und Auth im selben Prozess, Claude Design
  liefert React, `packages/ui` bleibt gemeinsame Basis mit der Website.
- Eine App statt zwei: Patient und Praxis arbeiten auf denselben Daten (Pläne,
  Protokolle). Zwei Deployments würden Infrastruktur verdoppeln, ohne die Datenbank
  zu trennen. Die für ADR 0003 wichtige Trennung ist die zwischen Website und
  geschütztem Bereich, und die bleibt.
- Drizzle: nah an SQL, Migrationen sind echte SQL-Dateien. Append-only muss auf
  Datenbankebene erzwungen werden, nicht nur im ORM.
- better-auth statt Eigenbau: Sessions, 2FA, Lockout und Rate-Limit selbst korrekt zu
  bauen ist bei Gesundheitsdaten ein reales Risiko; die Bibliothek läuft ohne externe
  Requests. Auth-SaaS (Auth0, Clerk, Supabase) scheidet nach ADR 0003 aus.
- Kein Mailversand: Jeder Versender ist ein weiterer Dienst mit AV-Vertrag und
  § 203-Frage; der Login-Link enthält kein Geheimnis, also braucht es ihn nicht.

## Konsequenzen

- CLAUDE.md-Zielbild wird auf `apps/reha` angepasst.
- Wir betreiben Postgres selbst: Backups, Restore-Test und Updates sind unsere Aufgabe
  und gehören in die monatliche Betriebspauschale.
- Rollen im Auth sind die einzige Trennlinie zwischen Patient und Praxis. Jeder
  Zugriffspfad in `/praxis` prüft die Rolle serverseitig; Tests decken das ab.
- Ohne Mail gibt es keinen Passwort-Reset-Link; Reset läuft über den Physio (ADR 0005).
- Alle drei Admin-Personen (Physio, zwei Entwickler) brauchen die § 203-Verpflichtung,
  ein persönliches Konto und 2FA.

## Verworfene Alternativen

- **IONOS, Scaleway, OVH**: EU-tauglich, aber teurer oder weniger vertraut.
- **SvelteKit**: schlanker, aber kleineres Ökosystem; Claude-Design-Output müsste
  übersetzt werden.
- **Django**: Admin geschenkt, aber zweite Sprache und weniger interaktive Patientenseite.
- **Zwei Apps mit geteilter DB**: mehr Trennung, doppelte Pipeline, kein Sicherheitsgewinn
  bei gemeinsamer Datenbank.
- **Prisma**: komfortabel, aber Rollen/Trigger müssten daneben gepflegt werden.
- **Auth.js**: Credentials-Login dort zweitklassig, 2FA und Admin selbst zu bauen.
