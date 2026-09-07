# Rechtliche Checkliste

**Kein Rechtsrat.** Das ist eine Arbeitsliste für uns, keine juristische Prüfung. Vor
dem Produktivbetrieb mit echten Patientendaten braucht es einen Fachanwalt für
IT-/Medizinrecht; der Kunde braucht einen (externen) Datenschutzbeauftragten.

Stand: 2026-08-12

> **Update 2026-09-07 – [ADR 0012](../decisions/0012-geschaeftsrahmen-start.md).**
> Kein Fachanwalt, keine Gesellschaft: zwei Einzelgewerbe, Verträge schreiben wir
> selbst. Damit ändern sich unten die Zuständigkeiten, nicht die Pflichten:
> AV-Vertrag und § 203-Verpflichtung laufen als **zwei Ketten** (AK Physio ↔ Roko,
> Roko ↔ Luis als Unterauftragnehmer). MDR-Prüfung der Ampel bewusst verschoben,
> Risiko im Vertrag. Health-Claims-Verantwortung beim Physio als Autor, im Vertrag
> festgehalten, Autor sichtbar im Wissensbereich. Benachrichtigung per E-Mail →
> Mailversender vorher nach Regel 5 prüfen. UG/GmbH und Versicherung bleiben
> Empfehlung, sind kein Blocker mehr.
>
> **Entwürfe liegen vor (2026-09-07, ohne Anwalt):** Vertragspaket in
> [`vertraege/`](vertraege/README.md) (Kundenvertrag, AV-Vertrag in zwei Varianten,
> § 203-Verpflichtung, interne Zusammenarbeit) und Betriebsprozesse in
> [`prozesse/`](prozesse/) (Incident-Prozess, VVT-Zuarbeit, Löschkonzept, TOM). Damit sind
> die Punkte AV-Vertrag, § 203, Löschkonzept, Incident-Prozess und VVT unten **vorbereitet**,
> abgehakt werden sie erst mit Unterschrift bzw. Umsetzung.

---

## Vor Phase 3 (interne Praxisoberfläche) – blockierend

Ohne diese Punkte werden keine echten Patientendaten verarbeitet.

- [ ] **AV-Vertrag nach Art. 28 DSGVO** zwischen Praxis (Verantwortlicher) und uns
      (Auftragsverarbeiter), inkl. TOM-Anlage und Liste der Unterauftragnehmer
- [ ] **Verschwiegenheitsverpflichtung nach § 203 Abs. 3 StGB** – schriftlich, für uns
      beide persönlich **und** für jeden Subunternehmer (Hoster, Backup, Monitoring, Mail)
- [ ] **Hosting-Entscheidung**: EU-Anbieter, EU-Rechenzentrum, AV-Vertrag vorhanden,
      § 203-Verpflichtung möglich
- [ ] **DSFA nach Art. 35 DSGVO** – verantwortet der Kunde, technische Zuarbeit von uns.
      Gesundheitsdaten mit Online-Zugang stehen auf der Muss-Liste der Aufsichtsbehörden
- [ ] **Löschkonzept** unter Berücksichtigung der 10-Jahres-Frist aus § 630f BGB
- [ ] **Incident-Prozess** für die 72-Stunden-Meldefrist nach Art. 33 DSGVO – wer meldet,
      an wen, mit welchen Angaben. Vorher festlegen, nicht im Ernstfall
- [ ] **Verzeichnis von Verarbeitungstätigkeiten** (Art. 30) – Zuarbeit für den Kunden
- [ ] **Berechtigungskonzept** – wer sieht was, 2FA für Praxiszugänge

## Vor Phase 4 (Patientenportal) – zusätzlich

Portal ist bidirektional: Patient trägt Fortschritt/Schmerzlevel ein, Physio lädt
Pläne/Dateien hoch. Append-only-Pflicht ([ADR 0002](../decisions/0002-behandlungsdaten-append-only.md))
gilt für beide Richtungen.

- [ ] Einwilligung für die Online-Einsicht **und** -Eingabe: freiwillig, widerrufbar, dokumentiert
- [ ] Die Praxis muss ohne Portal vollständig funktionieren – kein faktischer Zwang
- [ ] Auth-Konzept: sichere Erstregistrierung, Identitätsprüfung bei Portalzugang,
      Umgang mit Passwort-Reset
- [ ] Umsetzung der Betroffenenrechte: Auskunft (Art. 15), Berichtigung (Art. 16),
      Datenübertragbarkeit (Art. 20)
- [ ] **Supplement-Plan-Inhalte gegen Health-Claims-VO (EU 1924/2006) prüfen**, sobald
      Produktnamen oder gesundheitsbezogene Aussagen enthalten sind – Redaktionsfrage,
      keine Softwarefrage. Sobald ein Verkaufslink oder eine Provision dazukommt
      (Affiliate, eigener Shop), zusätzlich klären: Fernabsatzrecht, Kennzeichnungspflicht
- [ ] Klären, ob Supplement-Empfehlungen zum Berufsbild des Physiotherapeuten zählen
      oder eine Grenze zur Heilpraktiker-/Ernährungsberatungstätigkeit berühren
- [ ] **Fachanwaltliche Prüfung der automatischen Schmerzampel** (MDR Regel 11) vor
      Produktivbetrieb. Sie wird nach [ADR 0011](../decisions/0011-schmerzampel-bau-freigegeben.md)
      ohne vorherige Bestätigung gebaut; fällt die Prüfung negativ aus, wird
      `PAIN_TRAFFIC_LIGHT=off` gesetzt. Das Risiko muss im Kundenvertrag benannt sein
- [ ] Health-Claims-Redaktion der Wissensinhalte liegt beim Physio als Autor
      ([ADR 0009](../decisions/0009-wissensinhalte-editierbar.md)); Erstinhalte aus dem
      PDF bleiben Entwurf, bis er sie geprüft hat. Ins Onboarding aufnehmen

## Uns betreffend – Rechtsform und Haftung

Zu zweit gegen Entgelt zu arbeiten begründet **automatisch eine GbR** (§ 705 BGB) mit
**persönlicher, unbeschränkter, gesamtschuldnerischer Haftung**. Bei Gesundheitsdaten
ist das ein reales Risiko, kein theoretisches.

- [ ] **Rechtsform klären** – UG (haftungsbeschränkt) oder GmbH erwägen, mindestens aber
      ein schriftlicher GbR-Vertrag
- [ ] **GbR-/Gesellschaftsvertrag**: Einlagen, Verteilung, Ausstieg eines Partners,
      wem gehört der Code
- [ ] **Vermögensschadenhaftpflicht für IT-Dienstleister** mit Datenschutz-/Cyberbaustein
- [ ] Gewerbeanmeldung, steuerliche Anmeldung
- [ ] Hinweis: § 203 StGB trifft uns **persönlich und strafrechtlich** – dagegen schützt
      keine Rechtsform und keine Versicherung

## Kundenvertrag

- [ ] **Leistungsabgrenzung** inkl. der Negativliste aus [ADR 0001](../decisions/0001-scope-kein-zugelassenes-pvs.md)
      und [ADR 0004](../decisions/0004-kein-medizinprodukt.md) – wörtlich, nicht sinngemäß
- [ ] **Nutzungsrechte am Code**: einfaches statt ausschließliches Nutzungsrecht, damit
      Bausteine für weitere Praxen wiederverwendbar bleiben
- [ ] **Haftungsbegrenzung** der Höhe nach, soweit AGB-rechtlich zulässig
- [ ] **Exit-Klausel**: vollständiger, lesbarer Datenexport garantiert – auch bei Streit.
      Der Kunde hat eine gesetzliche 10-Jahres-Aufbewahrungspflicht
- [ ] **Preismodell**: Website und Entwicklung als Festpreis; **Hosting, Wartung und
      Security-Updates verpflichtend monatlich**. Der Betrieb eines Systems mit
      Patientendaten ist eine Dauerverpflichtung mit Haftung – unbepreist arbeiten wir
      in zwei Jahren gratis und haften trotzdem
- [ ] **Realistisches SLA.** Wir sind zu zweit. Lieber „Reaktion innerhalb eines
      Werktags" zusagen und halten, als 24/7 versprechen
- [ ] **Wer haftet bei einer werberechtlichen Abmahnung** – wir schreiben den Text,
      er verantwortet ihn als Werbender

## Öffentliche Website

- [ ] **Korrektur 2026-08-12:** Der erste Eintrag hier war zu scharf formuliert –
      `index.html` (Abschnitt „Was Patienten berichten") trägt bereits einen
      sichtbaren Disclaimer („Sinngemäße Beispielstimmen — reale, freigegebene
      Patientenzitate folgen.", Zeile 195, normal gerenderter Text, keine
      versteckte Klasse). Damit kein Blocker mehr. Zwei Dinge trotzdem vor
      Go-live: (1) die drei Zitate durch echte, schriftlich freigegebene
      Patientenstimmen ersetzen, (2) erwägen, den Disclaimer direkt über statt
      unter den Zitaten zu platzieren – aktuell liest man erst die als Zitat
      gesetzten Aussagen mit Attribution („Patientin, Reha nach OP") und erst danach
      den Hinweis, dass sie beispielhaft sind.
- [ ] Impressum nach § 5 DDG
- [ ] Datenschutzerklärung
- [ ] Consent nach TDDDG – keine Google Fonts vom CDN, kein Analytics vor Einwilligung
- [ ] **BFSG** (Barrierefreiheit, seit 28.06.2025): Online-Terminbuchung kann als
      Dienstleistung im elektronischen Geschäftsverkehr darunterfallen.
      Kleinstunternehmen-Ausnahme prüfen – barrierefrei bauen ist ohnehin billiger als
      nachrüsten

## Marketing – siehe [Tracking-Konzept](../marketing/tracking-konzept.md)

- [ ] **HWG-Prüfung der Werbetexte**: keine Heilversprechen, keine Angstwerbung,
      Vorsicht bei Testimonials (§ 11 HWG) und Vorher-Nachher-Darstellungen
- [ ] Abmahnrisiko durch Wettbewerber ist in diesem Feld real – Texte gegenlesen
- [ ] Keine themenspezifischen Conversion-Events (siehe [ADR 0003](../decisions/0003-kein-tracking-im-portal.md))

---

## Offene Fragen

- Welches PVS setzt der Kunde ein? Gibt es ein Exportformat (CSV, GDT, BDT)?
- Berufsrechtliche Vorgaben des Bundeslands für Werbung durch Heilmittelerbringer?
