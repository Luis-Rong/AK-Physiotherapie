# AK Physio

Website und Reha-Plattform für eine physiotherapeutische Praxis.

## Worum es geht

- **Reha-Plattform** (`apps/reha`, in Arbeit, hat Vorrang): Digitalisierung des
  Rehabilitationstagebuchs. Patientenbereich (Trainingsplan, Tagebuch mit Schmerzampel,
  Supplemente, Wissen) und Praxisbereich (Konten, Pläne, Inhalte, Zugang).
- **Öffentliche Website** (`apps/website`, statisch, zurückgestellt seit 2026-09-02).

Das System **ergänzt** das vorhandene, zugelassene PVS (thevea). Es ersetzt es nicht.
Warum, steht in [ADR 0001](docs/decisions/0001-scope-kein-zugelassenes-pvs.md).

## Bevor du hier etwas änderst

**Lies [CLAUDE.md](CLAUDE.md).** Dort stehen fünf Regeln, die nicht verhandelbar sind –
sie ergeben sich aus DSGVO Art. 9, § 203 StGB, § 630f BGB und der MDR. Ein Verstoß ist
kein Stilproblem.

Die wichtigste in einem Satz: **Niemals echte Patientendaten außerhalb der Produktion –
und schon gar nicht in einen KI-Prompt.**

## Struktur

```
apps/reha/         Next.js-App: /app Patient, /praxis Praxis, Postgres + Drizzle, better-auth
apps/website/      statische Marketing-Website
packages/ui/       Design-Tokens (erdige Farbwelt)
packages/testdata/ synthetische Testdaten
docs/decisions/    Architecture Decision Records (0001–0011)
docs/legal/        Checklisten, rechtliche Unterlagen
docs/betrieb.md    Setup, Deploy, Backup, Restore
```

## Setup

Siehe [docs/betrieb.md](docs/betrieb.md). Kurzfassung:

```bash
pnpm install
cd apps/reha && cp .env.example .env.local
pnpm db:local   # Terminal 1
pnpm db:seed    # Terminal 2, dann: pnpm dev
```

## Was als Nächstes fehlt

[docs/offene-punkte.md](docs/offene-punkte.md) und die Blocker vor Produktivbetrieb in
[docs/legal/checkliste.md](docs/legal/checkliste.md).
