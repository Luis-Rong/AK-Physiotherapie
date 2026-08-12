# AK Physio – Leitplanken für die Arbeit in diesem Repo

Dieses Dokument gilt für **alle** Beteiligten – Menschen wie KI-Assistenten. Wer hier
etwas ändert, ändert es per PR und begründet es in einer ADR unter `docs/decisions/`.

Hintergrund: Dieses Projekt verarbeitet **Gesundheitsdaten** (Art. 9 DSGVO) für einen
Berufsträger, der der **Schweigepflicht nach § 203 StGB** unterliegt. Fehler sind hier
nicht nur Bugs, sondern potenziell Bußgelder und Straftatbestände – auch für uns als
Dienstleister persönlich.

---

## Die fünf harten Regeln

### 1. Niemals echte Patientendaten außerhalb der Produktion

- Keine echten Daten in Dev, Staging, Tests, Fixtures oder Seeds.
- **Keine echten Daten in einen LLM-Kontext** – nicht in Claude Code, nicht in Claude
  Design, nicht in einen Prompt zum Debuggen, nicht in einen Stacktrace, den man
  irgendwo einfügt.
- Produktionsdatenbank ist strikt getrennt. Kein Dump auf einen Entwicklerrechner.
- Nur synthetische Testdaten (siehe `packages/testdata`, sobald angelegt).

Begründung: Eine Weitergabe an einen nicht nach § 203 StGB verpflichteten Dritten ist
eine Straftat, unabhängig von der Absicht.

### 2. Behandlungsdaten sind append-only

§ 630f BGB verlangt, dass nachträgliche Änderungen an der Behandlungsdokumentation
erkennbar bleiben und der ursprüngliche Inhalt weiter lesbar ist. Daraus folgt:

- **Kein `UPDATE`, kein `DELETE`** auf Behandlungsdokumentation, Verordnungsbezüge und
  Trainingsplan-Versionen.
- Korrekturen entstehen als neue Version mit Verweis auf die vorherige.
- Jeder Schreibvorgang erzeugt einen Audit-Log-Eintrag: wer, wann, was, von wo.
- Aufbewahrung 10 Jahre. Löschkonzept berücksichtigt diese Frist.

Siehe [ADR 0002](docs/decisions/0002-behandlungsdaten-append-only.md).

### 3. Kein Drittanbieter-Code im geschützten Bereich

Im Patientenportal und in der Praxisoberfläche: **null** externe Requests.

- Kein Meta Pixel, kein Google Ads/Analytics, kein Tag Manager.
- Keine Fonts, Icons oder Skripte von einem CDN – alles selbst ausgeliefert.
- Kein Error-Tracking mit Backend außerhalb der EU und ohne AV-Vertrag.
- Content-Security-Policy im Portal erlaubt ausschließlich `self`.

Siehe [ADR 0003](docs/decisions/0003-kein-tracking-im-portal.md).

### 4. Kein Medizinprodukt

Die Software **zeigt an, was der Therapeut eingetragen hat** – mehr nicht.

Verboten, weil es die MDR-Klassifizierung (Regel 11) auslösen würde:

- Automatische Erstellung oder Anpassung von Trainings-/Behandlungsplänen
- Therapieempfehlungen, Vorschläge, „ähnliche Patienten hatten Erfolg mit …"
- Auswertung von Messwerten mit therapeutischer Aussage
- Warnungen oder Scores mit medizinischer Bedeutung
- KI-Features, die einen dieser Punkte berühren

Reine Verwaltung, Terminplanung, Dokumentation und Anzeige sind unkritisch.
Im Zweifel: nicht bauen, sondern ADR schreiben und klären.

Siehe [ADR 0004](docs/decisions/0004-kein-medizinprodukt.md).

### 5. EU-Hosting, EU-Dienstleister

Jeder Dienst in der Kette – Hosting, Datenbank, Backup, Mail, Monitoring – muss:

- in der EU betrieben werden,
- einen AV-Vertrag nach Art. 28 DSGVO haben,
- nach § 203 Abs. 3 StGB zur Verschwiegenheit verpflichtet sein.

**Ein neuer Dienst wird nicht eingebunden, bevor diese drei Punkte geklärt sind.**
Das gilt auch für „nur kurz zum Testen".

---

## Was dieses Projekt ausdrücklich NICHT ist

Diese Negativliste ist Teil der Leistungsabgrenzung gegenüber dem Kunden:

- **Kein zugelassenes PVS-Ersatzsystem.** Das bestehende PVS bleibt im Einsatz.
- **Keine TI-Anbindung** (ePA, KIM, eVerordnung) – erfordert gematik-Zulassung.
- **Keine Kassenabrechnung nach § 302 SGB V.**
- **Kein Ersatz für die Papier-Verordnung (Muster 13).** Das Original bleibt
  aufbewahrungspflichtig beim Kunden.

Siehe [ADR 0001](docs/decisions/0001-scope-kein-zugelassenes-pvs.md).

---

## Repo-Struktur (Zielbild)

```
apps/website     öffentlich, Marketing – Tracking nach Consent erlaubt
apps/portal      Patientenportal – geschützt, keine Drittanbieter
apps/praxis      interne Oberfläche für den Therapeuten
apps/api         Backend
packages/ui      geteilte Komponenten & Design-Tokens (Quelle: Claude Design)
docs/            Entscheidungen, rechtliche Unterlagen, Marketing
```

Öffentliche Website und geschützter Bereich haben **getrennte Deployments und getrennte
Datenbanken**. Eine Lücke in der Marketingseite darf die Patientenakte nicht erreichen.

## Arbeitsweise

- `main` ist geschützt. Änderungen über kurzlebige Feature-Branches und PR.
- **Jeder PR wird vom jeweils anderen angesehen.** Bei Gesundheitsdaten ist das
  Vier-Augen-Prinzip auch gegenüber der Aufsichtsbehörde ein Argument.
- Architekturentscheidungen kommen als ADR nach `docs/decisions/` – kurz, fünf Zeilen
  reichen. Wichtig ist die Nachvollziehbarkeit, nicht die Länge.
- Claude Design bleibt das Werkzeug für die Design-Phase. Das Ergebnis wird nach
  `packages/ui` committet; ab dann ist das Repo die Wahrheit.

## Phasenplan

| Phase | Inhalt | Risiko | Voraussetzung |
|---|---|---|---|
| 1 | Öffentliche Website | niedrig | – |
| 2 | Kontakt / Terminanfrage | mittel | Datenschutzerklärung, Consent |
| 3 | Interne Praxisoberfläche | hoch | AV-Vertrag, § 203-Verpflichtung, Hosting, DSFA |
| 4 | Patientenportal | hoch | zusätzlich: Auth-Konzept, Einwilligung |

Phase 3 startet nicht, bevor die Punkte in `docs/legal/checkliste.md` abgehakt sind.
