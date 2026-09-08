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
apps/website     öffentlich, Marketing – Tracking nach Consent erlaubt (statisches HTML)
apps/reha        Reha-Plattform – geschützt, keine Drittanbieter
                   /app     Patientenbereich
                   /praxis  Physio/Admin-Bereich
packages/ui      geteilte Design-Tokens (erdige Farbwelt) und Komponenten
packages/testdata synthetische Testdaten – die einzigen, die außerhalb Prod existieren
docs/            Entscheidungen, rechtliche Unterlagen, Marketing
```

Patient und Praxis sind **eine** App mit Rollentrennung, keine zwei Deployments –
Begründung in [ADR 0008](docs/decisions/0008-tech-stack-reha-plattform.md). Stack:
Next.js + TypeScript, PostgreSQL + Drizzle, better-auth, Hetzner.

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

---

## Arbeitsstand und Vorhaben

**Update 2026-09-07:** Geschäftsrahmen entschieden in
[ADR 0012](docs/decisions/0012-geschaeftsrahmen-start.md): zwei Einzelgewerbe, Code
bleibt bei uns, nur AK Physio, E-Mail-Benachrichtigung, Verträge ohne Anwalt. Regel 5
gilt unverändert – auch für den Mailversender. Gestaltungsauftrag: wärmer und bunter,
eigene Piktogramme, keine Emojis.

**Update 2026-09-02:** Die Website wurde dem Physio gezeigt und nach der Preisnennung
zurückgestellt. **Die Reha-Plattform hat jetzt Vorrang.** Grundlage ist
`Rehabilitationstagebuch_ohne_logo.pdf`; Stack und Zuschnitt stehen in
[ADR 0008](docs/decisions/0008-tech-stack-reha-plattform.md), Wissensinhalte in
[ADR 0009](docs/decisions/0009-wissensinhalte-editierbar.md), Ruheumsatz-Rechner in
[ADR 0010](docs/decisions/0010-ruheumsatz-rechner.md), Schmerzampel-Bau in
[ADR 0011](docs/decisions/0011-schmerzampel-bau-freigegeben.md). **Farbwelt ab jetzt
braun/erdig**, Tokens in `packages/ui`; die Website übernimmt sie, sobald sie wieder
aktiv wird. Der Rest dieses Abschnitts ist der Stand vom 12.08. und gilt weiter, soweit
nicht durch die ADRs überholt.

Stand: 2026-08-12. Die Gliederung stammt aus der Projektübersicht von Luis.
**⚠ = kollidiert mit einer der Regeln oben und braucht eine Entscheidung (ADR),
bevor es gebaut wird.** Die Punkte sind nicht verboten – sie sind ungeklärt.

### Website — so gut wie fertig

- Google-Rezensionen einbinden
- Google Maps einbinden

⚠ Beides sind **Drittanbieter-Einbindungen** und damit consent-pflichtig (TDDDG,
Art. 6 DSGVO). Maps lädt beim Einbetten Daten zu Google, bevor der Nutzer etwas
tut – also erst nach aktivem Consent laden, davor eine statische Vorschau.
Rezensionen zusätzlich unter dem Blickwinkel **§ 11 HWG** (Werbung mit Äußerungen
Dritter): Rezensionen anzeigen ist üblich, aber die Auswahl darf keine
Behandlungserfolge bewerben. Gilt nur für `apps/website` – im geschützten Bereich
bleibt es bei null Drittanbietern ([ADR 0003](docs/decisions/0003-kein-tracking-im-portal.md)).

### PVS-Einbindung — teilweise geklärt

**Das PVS ist bekannt: [thevea](docs/pvs-thevea.md)** (Cloud-Anwendung, ein Unternehmen
der opta data, TI-Anschluss vorhanden, kein Patientenportal und keine
Trainingsplan-Funktion). Das entschärft das Wechselrisiko vor der TI-Pflicht 10/2027 und
grenzt unser Portal sauber ab: Verwaltung, Termine und Abrechnung bleiben in thevea, wir
bauen die Patientenschnittstelle davor.

Zu beantworten, bevor irgendetwas gebaut wird:

- Wie arbeitet er aktuell? (Papier, Software, Mischform — konkreter Tagesablauf)
- Gibt es aus thevea ein **Exportformat** für Patientenstammdaten (CSV, GDT, BDT)?
- Wo liegen Web-Domain und **E-Mail**? Bei welchem Anbieter, in welchem Land?
- Rechtliche Lage zu Patientenakten, Überweisungen, Verschreibungen

⚠ Zur E-Mail: Falls die Praxis-Kommunikation heute über einen Freemail-Anbieter
läuft, ist das bereits ohne unser Zutun ein **§ 203-Problem**. Nicht unser Fehler,
aber sobald wir Mail anfassen, unsere Verantwortung. Vor jeder Mail-Funktion klären.

⚠ „PVS-Einbindung" heißt **Datenübernahme, nicht Anbindung an die TI**. Verordnungen
werden erfasst oder importiert; das Papier-Original bleibt beim Kunden
aufbewahrungspflichtig ([ADR 0001](docs/decisions/0001-scope-kein-zugelassenes-pvs.md)).

### Patientenportal

Kein reines Einsichtsportal — **bidirektional**. Aktueller Stand: Physio erstellt
Pläne als PDF, druckt sie aus oder verschickt sie per Mail.

Geplant:
- Behandlungsplan mit Übungen/Hausaufgaben, digitalisiert statt PDF/Ausdruck
- Übungen vom Patienten abhakbar (Fortschritt)
- Schmerzlevel durch den Patienten selbst erfasst
- Supplement-Plan, vom Physio empfohlen
- Physio kann Dateien/Inhalte für den Patienten hochladen
- Follow-up-Mail

**Weil der Patient selbst schreibt (Fortschritt, Schmerzlevel), gilt
[ADR 0002](docs/decisions/0002-behandlungsdaten-append-only.md) — append-only,
versioniert, mit Audit-Log — für **beide Richtungen**, nicht nur für das, was
der Physio einträgt. Ein Patienteneintrag wird Teil der Behandlungsdokumentation,
sobald der Physio ihn sieht.**

**Schmerzangabe:** Erfassen, speichern und als Verlauf anzeigen ist Dokumentation
und unkritisch — auch als Diagramm, solange die **Interpretation beim Physio
bleibt**. Kritisch würde es erst, wenn die Software selbst bewertet: Trend-Pfeil,
Ampel, automatische Warnung „Ihre Werte verschlechtern sich". Das wäre
MDR Regel 11 ([ADR 0004](docs/decisions/0004-kein-medizinprodukt.md)). Die Grenze
liegt zwischen „Diagramm der eingegebenen Werte" und „Bewertung dieser Werte" durch
das System.

**Ausnahme, bewusst entschieden:** Die Schmerzampel aus dem Rehabilitationstagebuch
des Physios (Grün/Gelb/Rot nach NPRS) bleibt automatisiert, nur die Formulierung wird
abgeschwächt — [ADR 0007](docs/decisions/0007-schmerzampel-mdr-abgrenzung.md) dazu
ausdrücklich: Das löst die MDR-Frage **nicht** auf, es ist ein akzeptiertes Risiko mit
Fachanwalts-Vorbehalt vor dem Bau, keine Klarstellung, dass es unkritisch wäre.

**Supplement-Plan:** Da die Empfehlung vom Physio selbst kommt und die Software nur
anzeigt, was er einträgt, ist das architektonisch unproblematisch — genau das
Muster aus Regel 4 (anzeigen, nicht generieren/bewerten). Offen bleibt eine
**inhaltliche**, keine technische Frage:

⚠ Sobald der Text konkrete Produktnamen oder gesundheitsbezogene Aussagen enthält
("unterstützt die Regeneration"), greift die **Health-Claims-Verordnung
(EU 1924/2006)** — nur zugelassene Claims sind zulässig. Betrifft den Inhalt, den
der Physio schreibt, nicht das System — aber die Redaktion sollte das wissen, bevor
der erste Plan digitalisiert wird. Falls je ein Verkaufslink oder eine Provision
dazukommt (Affiliate, eigener Shop), ändert das die rechtliche Kategorie nochmals
und gehört vorher geklärt.

⚠ **Follow-up-Mail:** Standard-E-Mail ist unverschlüsselt. Es darf daher **kein
Gesundheitsdatum in die Mail** – kein Behandlungsinhalt, keine Diagnose, keine
Übung, nicht einmal im Betreff. Zulässiges Muster: neutrale Benachrichtigung
(„Es gibt eine Neuigkeit in Ihrem Portal") plus Login-Link. Zusätzlich zu prüfen:
Einwilligung nach § 7 UWG, sobald die Mail auch nur am Rand werblich wird, und
ein Mail-Versender mit EU-Hosting, AV-Vertrag und § 203-Verpflichtung.

### Tech-Stack erweitern

Hosting, Datenbanken, Cloud-Dienste.

⚠ **Google Cloud steht im Konflikt mit Regel 5.** Nicht wegen der Technik –
GCP hat EU-Regionen und einen EU-AV-Vertrag – sondern wegen der Kombination aus
**§ 203 StGB** und einem Anbieter mit US-Mutterkonzern. Deutsche Aufsichtsbehörden
sind bei Gesundheitsdaten auf US-Hyperscalern zurückhaltend, und die nach
§ 203 Abs. 3 nötige Verschwiegenheitsverpflichtung eines Subunternehmers ist bei
einem Hyperscaler praktisch nicht individuell verhandelbar.

Das heißt nicht „unmöglich", aber es ist eine **bewusste Entscheidung mit
Begründung**, keine Nebensache beim Aufsetzen. Zulässige Auflösung: GCP für die
öffentliche Website (dort keine Gesundheitsdaten), EU-Anbieter für den
geschützten Bereich.

→ **Entschieden am 2026-09-02** ([ADR 0008](docs/decisions/0008-tech-stack-reha-plattform.md)):
geschützter Bereich auf Hetzner Cloud, Staging auf einem vorhandenen eigenen Server mit
ausschließlich synthetischen Daten. Kein Google Cloud im geschützten Bereich.
