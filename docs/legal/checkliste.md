# Rechtliche Checkliste

**Kein Rechtsrat.** Das ist eine Arbeitsliste für uns, keine juristische Prüfung. Vor
dem Produktivbetrieb mit echten Patientendaten braucht es einen Fachanwalt für
IT-/Medizinrecht; der Kunde braucht einen (externen) Datenschutzbeauftragten.

Stand: 2026-08-12

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

- [ ] Einwilligung für die Online-Einsicht: freiwillig, widerrufbar, dokumentiert
- [ ] Die Praxis muss ohne Portal vollständig funktionieren – kein faktischer Zwang
- [ ] Auth-Konzept: sichere Erstregistrierung, Identitätsprüfung bei Portalzugang,
      Umgang mit Passwort-Reset
- [ ] Umsetzung der Betroffenenrechte: Auskunft (Art. 15), Berichtigung (Art. 16),
      Datenübertragbarkeit (Art. 20)

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
