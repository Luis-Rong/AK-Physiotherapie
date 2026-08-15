# PVS: thevea

Stand: 2026-08-15 · Auslöser: Der Physio nennt **thevea** als eingesetztes
Praxisverwaltungssystem.

**Vorbehalt:** Die Angaben unten stammen aus der Herstellerseite und einem
Vergleichsportal, nicht aus einer Auskunft an uns. Die vier fett markierten Punkte
in Abschnitt 3 müssen **schriftlich bestätigt** werden, bevor wir darauf planen.

Quellen: [thevea.de](https://thevea.de/), [Praxissoftware Physiotherapie](https://thevea.de/loesungen/praxissoftware-physiotherapie/),
[physiosoftware-vergleich.de](https://physiosoftware-vergleich.de/thevea/), [physio.de Produktprofil](https://physio.de/produkte/p/software/thevea/212699)

---

## 1. Was thevea ist

- **Web-Anwendung** (Login über `mein.thevea.de`), keine lokale Installation, Nutzung
  auf beliebig vielen Geräten inkl. Smartphone. Also **Cloud**, nicht Praxisrechner.
- Hersteller: **thevea, ein Unternehmen der opta data** — die opta data Gruppe ist ein
  großes deutsches Abrechnungszentrum für Heilmittelerbringer.
- Laut Vergleichsportal liegen die Daten **verschlüsselt in deutschen zertifizierten
  Rechenzentren**.
- Preis: ca. 39,90 € netto/Monat (Starter) bzw. 69,90 € netto/Monat (Pro).

## 2. Welche offenen Fragen das beantwortet

### 0.1 „Ist sein PVS TI-fähig?" — voraussichtlich ja, entschärft

thevea wirbt mit TI-Anschluss und behandelt E-Verordnung/E-Rezept als eigenes Thema;
das Vergleichsportal nennt es „TI-Ready" mit bestehendem TI-Anschluss.

→ Ein **PVS-Wechsel vor dem 01.10.2027 ist damit unwahrscheinlich**. Das größte Risiko
für Phase 3 — dass er mitten im Projekt das System tauscht — ist weitgehend vom Tisch.
Achtung auf die Wortwahl: „TI-ready" ist Marketing, nicht dasselbe wie eine
Zulassungsbestätigung. Einmal schriftlich bestätigen lassen.

### 0.2 „Hat sein PVS einen Datenexport?" — bleibt offen, aber präzise stellbar

Belegt sind: **DATEV-Export** für den Steuerberater, **Schnittstellen zu vier
Abrechnungszentren** (opta data, AS Bremen, AS Berlin, Severins), und ein
**Patientendaten-Import nach Rücksprache** mit dem Support. Ein dokumentierter offener
Export oder eine API für Patientenstammdaten ist **nicht belegt**.

→ Die Frage an ihn wird konkreter: *„Kannst du in thevea deine Patientenstammdaten selbst
exportieren — und in welchem Format?"* Wenn nur Import unterstützt wird und kein Export,
heißt das für uns: Datenübernahme aus thevea heraus ist unklar, Doppelpflege bleibt ein
reales Risiko (siehe `offene-punkte.md` 0.2).

### 1.1 „Läuft es lokal oder als Cloud-Dienst?" — Cloud

→ Konsequenz: Auf dem Praxisrechner liegt **nichts**, was wir anfassen könnten. Jede
Datenübernahme läuft über thevea oder über Abtippen. Und: Er hat bereits einen
**Auftragsverarbeitungsvertrag** mit thevea/opta data — den sollten wir uns zeigen lassen.
Er ist Vorlage und Präzedenzfall zugleich: Cloud-Verarbeitung von Gesundheitsdaten ist bei
ihm bereits akzeptierte Praxis, was unsere Regel-5-Argumentation (EU-Anbieter,
AV-Vertrag, § 203-Verpflichtung) deutlich einfacher macht als bei einer Papierpraxis.

### Termine — liegen in thevea

thevea hat einen Terminplaner inkl. **automatischer E-Mail-Erinnerung 24 Stunden vor dem
Termin** und Videotherapie-Links.

→ **Wir bauen keinen Kalender.** Terminverwaltung bleibt in thevea; unser System darf sie
höchstens lesen, wenn es je eine Schnittstelle gibt. Das schneidet einen ganzen
Funktionsblock aus Phase 3 heraus.

→ Und eine neue Prüffrage: Was steht in dieser Erinnerungsmail? Wenn dort Heilmittel,
Diagnose oder Behandlungsart im Klartext oder im Betreff auftaucht, ist das **heute schon**
das § 203-Problem aus `offene-punkte.md` 0.3 — nur eben über die Praxissoftware statt
über WhatsApp. Einmal eine echte Erinnerungsmail zeigen lassen.

## 3. Was das für unser Portal bedeutet — die eigentliche Nachricht

Laut Vergleichsportal hat thevea **kein Patientenportal, keine Patienten-App, keine
Übungsbibliothek und keine Trainingsplan-Funktion**.

→ Genau das, was das Patientenportal aus `CLAUDE.md` leisten soll — digitalisierter
Behandlungsplan, abhakbare Übungen, Schmerzverlauf, Supplement-Plan, Datei-Upload —
**ist in thevea nicht vorhanden**. Wir konkurrieren nicht mit seinem PVS, wir ergänzen es
an genau der Stelle, an der es aufhört.

Das ist gleichzeitig die saubere Leistungsabgrenzung, die ADR 0001 fordert: thevea bleibt
das führende System für Verwaltung, Termine, Verordnung und Abrechnung. Unser System ist
die Patientenschnittstelle davor. Kein Ersatz, keine Überschneidung, keine
Doppelpflege bei Terminen.

Offen bleibt die Doppelpflege bei **Stammdaten** (Name, Kontakt) — dafür brauchen wir die
Antwort auf 0.2.

## 4. Vor Phase 3 schriftlich bestätigen lassen

- [ ] **Serverstandort und Rechenzentrum** — von thevea bestätigen lassen, nicht aus dem
      Vergleichsportal übernehmen
- [ ] **Kopie des AV-Vertrags** Praxis ↔ thevea/opta data, insbesondere ob eine
      Verschwiegenheitsverpflichtung nach § 203 Abs. 3 StGB enthalten ist
- [ ] **Export von Patientenstammdaten** — möglich? Format? Selbst auslösbar oder
      kostenpflichtig über den Support?
- [ ] **gematik-Zulassungsstatus** und Fahrplan für die Fachanwendungen (ePA, KIM,
      eVerordnung) — „TI-ready" reicht als Auskunft nicht
- [ ] Inhalt der automatischen Terminerinnerungs-Mail (Gesundheitsdaten enthalten?)
- [ ] Vertragslaufzeit und Tarif (Starter oder Pro) — geht in die Gesamtkostenrechnung ein
