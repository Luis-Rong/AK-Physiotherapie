# AK Physio

Website und ergänzendes Praxissystem für eine physiotherapeutische Praxis.

## Worum es geht

- **Neue öffentliche Website** – ersetzt die veraltete bestehende Seite
- **Interne Praxisoberfläche** – Termine, Stammdaten, Behandlungsdokumentation
- **Patientenportal** – digitale Einsicht in Behandlungs- und Trainingspläne
- **Laufendes Marketing** – Kampagnen, Landingpages, Ads

Das System **ergänzt** das vorhandene, zugelassene PVS. Es ersetzt es nicht.
Warum, steht in [ADR 0001](docs/decisions/0001-scope-kein-zugelassenes-pvs.md).

## Bevor du hier etwas änderst

**Lies [CLAUDE.md](CLAUDE.md).** Dort stehen fünf Regeln, die nicht verhandelbar sind –
sie ergeben sich aus DSGVO Art. 9, § 203 StGB, § 630f BGB und der MDR. Ein Verstoß ist
kein Stilproblem.

Die wichtigste in einem Satz: **Niemals echte Patientendaten außerhalb der Produktion –
und schon gar nicht in einen KI-Prompt.**

## Struktur

```
apps/            Anwendungen (website, portal, praxis, api)
packages/        geteilter Code (ui, testdata)
docs/decisions/  Architecture Decision Records
docs/legal/      Verträge, Datenschutz, Checklisten
docs/marketing/  Kampagnen, Tracking-Konzept
```

## Was als Nächstes fehlt

[docs/offene-punkte.md](docs/offene-punkte.md) — alles, was wir noch vom Physio
brauchen und was wir selbst klären müssen, priorisiert nach Phase. Enthält am Ende
einen kompakten Fragenkatalog fürs erste Gespräch.

Der Anwendungscode kommt noch – das hier ist zunächst das Gerüst mit den Leitplanken.

## Setup

Wird ergänzt, sobald das Grundgerüst der Anwendung eingecheckt ist.
