# Was uns noch fehlt

Stand: 2026-08-15 · Bestandsaufnahme nach Sichtung des Website-Codes

> **Update 02.09.2026.** Die Website ist nach der Preisnennung zurückgestellt; die
> Reha-Plattform hat Vorrang. Damit rutscht alles unter **P0** (Website-Go-live) hinter
> die Plattform-Punkte. Tech-Stack (4.3) ist entschieden:
> [ADR 0008](decisions/0008-tech-stack-reha-plattform.md). Neu offen: DNS-Zugang für
> `portal.akphysiotherapie.de` wird jetzt vor dem Website-Zugang gebraucht, und die
> Punkte aus [`legal/checkliste.md`](legal/checkliste.md) zur Ampel (ADR 0011) und
> zu den Wissensinhalten (ADR 0009).
>
> **Update 15.08.2026.** Drei Blöcke haben sich verschoben:
> Das PVS ist bekannt (**thevea**) — Auswertung in [`pvs-thevea.md`](pvs-thevea.md).
> Der Abgleich mit der alten Website liegt vor — [`marketing/alte-website-abgleich.md`](marketing/alte-website-abgleich.md).
> Das Rehabilitationstagebuch des Physios liegt vor und ist faktisch die Spezifikation
> für das Portal — Bewertung in [`portal-konzept.md`](portal-konzept.md). Beides
> beantwortet Punkte unten und wirft neue auf (fehlende AGB, fehlende Preise,
> MDR-Abgrenzung bei der Schmerzampel).

Diese Liste ist nach **Herkunft** sortiert (wer muss liefern) und am Ende nach
**Phase** priorisiert (wann blockiert es). Ein Punkt, der hier steht, ist nicht
zwingend Arbeit — vieles ist eine Frage, die in fünf Minuten beantwortet ist.
Aber unbeantwortet blockiert sie später Tage.

---

## 0. Kritische Unbekannte

Drei Fragen, deren Antwort das Projekt **umformen** kann. Die gehören zuerst geklärt,
bevor irgendetwas an Phase 3 geplant wird.

### 0.1 Ist sein PVS TI-fähig? — weitgehend entschärft

Ab **01.10.2027** gilt die TI-Anschlusspflicht für Heilmittelerbringer. Das betrifft
**sein** PVS, nicht unseres — aber es betrifft uns mittelbar: Wenn sein aktuelles
System nicht gematik-zugelassen ist, muss er bis dahin wechseln. Ein PVS-Wechsel
mitten in unserem Projekt würde alle Integrationsannahmen entwerten.

→ **thevea wirbt mit TI-Anschluss und E-Verordnung.** Ein Wechsel vor 10/2027 ist
damit unwahrscheinlich. Rest: den Zulassungsstatus schriftlich bestätigen lassen,
„TI-ready" ist keine Zusage. Siehe [`pvs-thevea.md`](pvs-thevea.md).

### 0.2 Hat sein PVS einen Datenexport? — weiter offen, aber präziser

Wenn nein, bedeutet unser System **dauerhafte Doppelpflege** — er trägt jeden
Patienten zweimal ein. Das ist kein technisches Problem, sondern ein
Akzeptanzproblem: Systeme mit Doppelpflege werden nach drei Monaten nicht mehr
benutzt.

→ Für thevea belegt sind nur DATEV-Export und Abrechnungsschnittstellen; ein Export
von **Patientenstammdaten** ist nicht dokumentiert. Konkrete Frage an ihn: „Kannst du
deine Patientendaten aus thevea selbst exportieren, in welchem Format?"

→ Entwarnung an anderer Stelle: thevea hat **kein Patientenportal und keine
Trainingsplan-Funktion**. Termine und Terminerinnerung liegen dagegen bereits dort —
den Kalender bauen wir nicht nach. Damit ist die Doppelpflege auf Stammdaten begrenzt,
nicht auf den Alltagsbetrieb.

→ Das muss er wissen und akzeptieren, **bevor** er den Auftrag erteilt. Sonst bauen
wir etwas, das im Alltag scheitert.

### 0.3 Wie kommuniziert er heute mit Patienten?

Konkret: Läuft heute Patientenkommunikation über WhatsApp, private E-Mail oder einen
Freemail-Anbieter? Werden Behandlungspläne als PDF-Anhang verschickt?

Das ist verbreitet und in aller Regel bereits ein **§ 203-Problem** — unabhängig von
uns. Es ist nicht unser Fehler, aber sobald wir Kommunikation anfassen, wird es unsere
Verantwortung. Und es ist das stärkste Verkaufsargument für das Portal.

→ Ehrlich fragen, nicht vorwurfsvoll. Wir brauchen den Ist-Zustand, nicht den
Soll-Zustand.

---

## 1. Vom Physio — Betrieb & Technik

### 1.1 Praxisverwaltungssystem

- [x] **Welches Produkt?** → **thevea**, ein Unternehmen der opta data. Auswertung in
      [`pvs-thevea.md`](pvs-thevea.md)
- [x] Läuft es **lokal** oder als Cloud-Dienst? → **Cloud** (Web-App, `mein.thevea.de`).
      Auf dem Praxisrechner liegt nichts, was wir anfassen könnten
- [ ] Vertragslaufzeit, monatliche Kosten (Starter 39,90 € / Pro 69,90 € netto),
      Kündigungsfrist
- [ ] **Kopie des AV-Vertrags** Praxis ↔ thevea/opta data — Vorlage und Präzedenzfall
      für unsere eigene Vertragsgestaltung
- [ ] Was steht in der automatischen Terminerinnerungs-Mail? (Gesundheitsdaten? siehe 0.3)
- [ ] Wer hat Administratorzugang? Gibt es einen Wartungsvertrag/Ansprechpartner?
- [ ] **Export möglich?** CSV, GDT, BDT, PDF — und kann er das selbst auslösen oder
      braucht es den Hersteller (ggf. kostenpflichtig)?
- [ ] Gibt es eine dokumentierte Schnittstelle/API?
- [ ] Werden **Termine** dort verwaltet oder separat (Papierkalender, Google Calendar,
      Doctolib)?
- [ ] Ist das System **gematik-zugelassen / TI-fähig**? (siehe 0.1)
- [ ] Was stört ihn am aktuellen System am meisten? *(Die Antwort sagt uns, wo unser
      Nutzen liegt.)*

### 1.2 Domain & Website

Aus `PRODUCT.md` gibt es einen Hinweis, dass die bestehende Seite auf **Wix** läuft
(Bilder werden clientseitig lazy-geladen, typisches Wix-Verhalten). Zu bestätigen.

- [ ] Wo ist **akphysiotherapie.de** registriert? (Registrar: Strato, IONOS, United
      Domains, Wix, GoDaddy …)
- [ ] **Wer hat die Zugangsdaten?** Er selbst, ein früherer Dienstleister, ein
      Familienmitglied? *(Häufigster Projektstopper überhaupt.)*
- [ ] Läuft aktuell ein Wix-Vertrag? Laufzeit, Kündigungsfrist, Kosten
- [ ] Wo liegen die **Nameserver** / wer verwaltet DNS?
- [ ] Gibt es Subdomains oder weitere Domains (Tippfehler-Domains, `.com`)?
- [ ] Soll die alte Seite abgeschaltet oder umgeleitet werden? Gibt es URLs mit
      Rankings, die wir per Redirect erhalten sollten?

### 1.3 E-Mail

- [ ] Wo liegt das Postfach **info@akphysiotherapie.de**? Bei Wix, beim Registrar,
      Google Workspace, Microsoft 365?
- [ ] Wie viele Postfächer/Adressen gibt es?
- [ ] Wird geschäftlich und privat gemischt (Gmail, GMX, web.de)?
- [ ] **Wird über E-Mail heute Patientenkommunikation geführt?** Befunde, Pläne,
      Verordnungen als Anhang? (siehe 0.3)
- [ ] Muss bei einem Umzug die bestehende Mail-Historie migriert werden?

### 1.4 Aktueller Arbeitsablauf

Der wichtigste und am häufigsten übersprungene Block. Am besten **einmal danebensitzen**
statt abfragen — eine Stunde Beobachtung ersetzt zehn Rückfragen.

- [ ] Wie kommt ein neuer Patient herein? (Anruf, Mail, Empfehlung, Google)
- [ ] Wie wird ein Termin vereinbart und **wo notiert**?
- [ ] Was passiert im Erstgespräch? Was dokumentiert er, worauf (Papier, PVS, Word)?
- [ ] Wie entsteht ein **Behandlungs-/Trainingsplan**? Word-Vorlage, PDF, handschriftlich?
- [ ] Wie kommt der Plan zum Patienten? (Ausdruck, Mail, WhatsApp)
- [ ] Wie dokumentiert er den **Verlauf** über mehrere Sitzungen?
- [ ] Wie oft sieht er einen Patienten, wie lang ist eine typische Behandlungsserie?
- [ ] Wie **rechnet** er ab? Selbstzahler-Rechnung selbst geschrieben? Über ein
      Abrechnungszentrum? Welches?
- [ ] Wo liegen die **Verordnungen** physisch? Wie werden sie archiviert?
- [ ] Wie erinnert er an Termine? Erinnert er überhaupt?

### 1.5 Volumen (für Dimensionierung und Preisgestaltung)

- [ ] Wie viele **aktive Patienten** ungefähr?
- [ ] Wie viele **Behandlungen pro Woche**?
- [ ] Wie viele **Trainingspläne** pro Woche oder Monat?
- [ ] Arbeitet er allein oder gibt es Angestellte / weitere Therapeuten?
- [ ] Plant er zu wachsen? *(Entscheidet, ob wir Mehrbenutzerfähigkeit brauchen.)*

---

## 2. Vom Physio — Inhalte für die Website

Diese Punkte blockieren **Phase 1 Go-live** konkret. Die Platzhalter stehen wörtlich
im Code.

### 2.1 Rechtspflichtige Angaben (Impressum & Datenschutz)

Aus dem alten Impressum liegen mehrere Angaben inzwischen vor — **vor Übernahme
gegenlesen und bestätigen lassen**, Details in
[`marketing/alte-website-abgleich.md`](marketing/alte-website-abgleich.md) Abschnitt 3.

- [~] **Vollständiger Name** → laut altem Impressum **Alexander Koetter**, bestätigen
      lassen → `impressum.html:29`, `datenschutz.html:28`
- [ ] **Umsatzsteuer-IdNr.** — fehlt auch auf der alten Seite → `impressum.html:46`
- [~] **Zuständige Aufsichtsbehörde** → altes Impressum nennt **Regierungspräsidium
      Darmstadt**, nicht das Gesundheitsamt Frankfurt wie hier vermutet →
      `impressum.html:43`
- [~] Verantwortlicher nach § 18 Abs. 2 MStV → Alexander Koetter → `impressum.html:49`
- [ ] **Welche Anschrift gehört ins Impressum?** Das alte Impressum nennt
      Wiesenstraße 5, 64546 Mörfelden-Walldorf — nicht die Praxisadresse in Frankfurt
- [ ] Rechtsform der Praxis (Einzelunternehmen, GbR, GmbH?) — beeinflusst Impressum
- [ ] Entscheidung zur EU-Streitschlichtungsklausel → `impressum.html:52`
- [x] **AGB-Seite** angelegt am 15.08.2026 (`agb.html`, im Footer aller Seiten
      verlinkt). Regelungen aus dem Bestandstext übernommen, die reinen
      Formularsätze („Bitte bestätigen Sie …") entfallen — die alte Fassung war ein
      Einwilligungsformular, keine AGB
- [ ] **AGB anwaltlich prüfen und von der Praxis freigeben lassen.** Drei Punkte
      konkret ansehen: das pauschale Ausfallhonorar von 100 € zzgl. MwSt. bei
      Behandlungspreisen von 41–90 €; die Beschränkung von Absagen auf
      ausschließlich E-Mail (§ 309 Nr. 13 BGB lässt Textform zu, der Ausschluss
      aller anderen Textform-Wege ist angreifbar); die im Bestandstext genannte
      Anspruchsgrundlage § 252 BGB — für ein Ausfallhonorar wird üblicherweise
      § 615 BGB herangezogen. Im Zweifel Formulierung der Praxis belassen und
      anwaltlich klären, nicht eigenmächtig ändern

### 2.2 Fachliche Angaben

- [ ] **Fortbildungen / Zertifikate** mit Jahren → `ueber-uns.html:138`
- [ ] **Berufserfahrung**: Jahre und Schwerpunkte → `ueber-uns.html:139`
- [ ] **Mitgliedschaften** in Fachverbänden → `ueber-uns.html:140`
- [ ] **Parken / ÖPNV-Anbindung** → `ueber-uns.html:168`
- [ ] **Öffnungszeiten** — laut `PRODUCT.md` auf der alten Seite nicht veröffentlicht.
      Will er welche nennen oder bewusst auf Kontaktaufnahme lenken?
- [ ] **Preise** — Korrektur: Die alte Seite **hat** eine vollständige Preisliste
      (41–90 € je Leistung, 3er-Pakete mit ~10 % Rabatt). `PRODUCT.md` hielt fest, es
      gebe keine — das war ein 404 beim damaligen Abruf. Entscheidung nötig: übernehmen
      oder bewusst weglassen. Liste in
      [`marketing/alte-website-abgleich.md`](marketing/alte-website-abgleich.md) 2.1
- [ ] **Widerspruch klären:** Die neue Seite verspricht durchgängig „45–60 Minuten",
      die alte Preisliste führt „Physiotherapie 30'" als reguläres Angebot. Solange das
      ungeklärt ist, ist das zentrale Versprechen der Seite nicht belegt
- [ ] **Fachlicher Schwerpunkt** — die alte Seite nennt orthopädische, chirurgische und
      traumatische Beschwerden. Auf der neuen Seite steht nirgends, *was* er behandelt

### 2.3 Medien

- [ ] **Echte Praxis- und Behandlungsfotografie** — aktuell sind zwei Bilder im
      Einsatz, laut Code-Kommentaren als Platzhalter markiert
      (`index.html:57`, `ueber-uns.html:50`)
- [ ] **Logo als Vektor (SVG)** — aktuell nur `logo.png`
- [ ] **Weiße/invertierte Logo-Variante** für dunkle Flächen (in `PRODUCT.md` als
      Bedarf notiert)
- [ ] Portraitfoto des Therapeuten für „Über uns"

### 2.4 Texte & Testimonials

- [x] **Fiktive Testimonials entfernt** am 15.08.2026. Der Abschnitt `#stimmen` ist
      durch `#rezensionen` ersetzt — Struktur für echte Google-Rezensionen, bewusst
      mit leeren Platzhaltern statt Beispieltexten. Damit ist der Go-live-Blocker
      aus `legal/checkliste.md` entschärft
- [ ] **Google-Rezensionen: Zugang zum Google-Business-Profil.** Korrektur zur
      bisherigen Annahme — auf der **alten Website stehen keine Rezensionen**
      (komplette Seite geprüft, kein Treffer). Sie liegen nur im Google-Profil.
      Ohne Zugang bleibt der Abschnitt leer; erfundene Bewertungen kommen nicht in
      Frage (§ 5 UWG, Anhang zu § 3 Abs. 3 Nr. 23b UWG)
- [ ] **Auswahl der Rezensionen unter § 11 HWG prüfen.** Bewertungen anzeigen ist
      üblich; die Auswahl darf aber keine Behandlungserfolge bewerben. Neutral
      übernehmen, nicht nach Wirkungsaussagen kuratieren
- [x] **Blog-Texte**: erledigt am 15.08.2026 — die vier bestehenden Beiträge sind im
      Originalwortlaut übernommen (`blog-ernaehrung-operation.html`,
      `blog-nahinfrarot-therapie.html`, `blog-koerper-anpassung.html`,
      `blog-halswirbelsaeule.html`), der erfundene Redaktionsplan ist raus
- [ ] **Fachliche Freigabe der Blogtexte durch den Autor (HWG).** Besonders der
      Nahinfrarot-Beitrag: Er bewirbt eine Leistung, die die Praxis verkauft, mit
      Wirkaussagen. § 3 HWG verbietet irreführende Angaben über die therapeutische
      Wirkung — der Text war vorher schon online, aber beim Neubau ist der richtige
      Zeitpunkt, ihn einmal prüfen zu lassen
- [ ] **Veröffentlichungsdaten** von zwei Beiträgen bestätigen: „Ernährung vor und nach
      einer Operation" und „Nahinfrarot-Therapie" sind auf der alten Seite ohne
      Jahresangabe ausgewiesen. Steht als Platzhalter im Code
- [ ] **Instagram-Profil** — auf der alten Seite verlinkt, im neuen Footer nicht
- [ ] Freigabe der bestehenden Website-Texte durch ihn (Tonalität, fachliche Richtigkeit)

---

## 3. Vom Physio — Rechtliches & Organisatorisches

- [ ] Hat er einen **Datenschutzbeauftragten**? Bei Gesundheitsdaten und geplantem
      Online-Portal dringend anzuraten, auch wenn die Benennungspflicht nach § 38 BDSG
      bei einer kleinen Praxis strittig ist
- [ ] Existiert ein **Verzeichnis von Verarbeitungstätigkeiten** (Art. 30)?
- [ ] Gibt es bestehende **Patienteneinwilligungen** und eine Datenschutzerklärung
      für die Praxis (offline)?
- [ ] Hat er eine **Berufshaftpflicht**? Deckt sie digitale Angebote ab?
- [ ] Hat er einen **Anwalt** für Medizin-/IT-Recht — oder brauchen wir eine Empfehlung?
- [ ] Wer ist **entscheidungsbefugt** und unterschreibt? Er allein?
- [ ] **Budget** und **Wunschtermin** für Phase 1 Go-live
- [ ] Bereitschaft zu **laufenden Kosten** (Hosting, Wartung, Domain) — die Höhe hängt
      von der Hosting-Entscheidung ab, die Bereitschaft muss aber vorher da sein

---

## 4. Von uns zu klären (nicht vom Physio)

Diese Punkte hängen nicht an ihm, sondern an uns. Sie stehen ausführlicher in
`legal/checkliste.md`.

### 4.1 Geschäftlich

- [ ] **Rechtsform**: GbR entsteht automatisch mit persönlicher Haftung — UG erwägen
- [ ] Gesellschaftsvertrag zwischen Luis und Roko
- [ ] **Vermögensschadenhaftpflicht** mit Cyber-/Datenschutzbaustein
- [ ] Kundenvertrag inkl. Leistungsabgrenzung, Nutzungsrechte, Exit-Klausel
- [ ] **Preismodell**, besonders die monatliche Betriebspauschale

### 4.2 Technisch — Phase 1/2 (Website)

- [ ] **Hosting-Entscheidung** für die Website (EU-Anbieter)
      → füllt auch den Platzhalter in `datenschutz.html:31`
- [ ] **Consent-Lösung** für Google Maps — aktuell lädt der iFrame ungefragt
      (`index.html:212–217`). Empfehlung: Klick-zum-Laden statt Cookie-Banner
- [ ] **Formular-Backend**: `mailto:` ist eine Übergangslösung und schlägt auf vielen
      Geräten still fehl (`script.js:157–171`). Für eine conversion-orientierte Seite
      ein echtes Leck
- [ ] **Buchungstool**: ja/nein, welches? Platz ist im Code vorgesehen
      (`index.html:224`). Bei Gesundheitsdaten AV-Vertrag zwingend
- [ ] Deployment-Weg und Domain-Umschaltung planen (inkl. Redirects von der alten Seite)

### 4.3 Technisch — Phase 3/4 (Portal)

Ausführlich in [`portal-konzept.md`](portal-konzept.md). Zugangs-, Namens- und
Ampel-Frage sind inzwischen als [ADR 0005](decisions/0005-zugangskonzept-portal.md),
[0006](decisions/0006-echte-namen-im-portal.md) und
[0007](decisions/0007-schmerzampel-mdr-abgrenzung.md) entschieden. Offen:

- [ ] **Steht bei thevea/opta data ein Patientenportal auf der Roadmap?** Kostet eine
      E-Mail und entscheidet über die Wirtschaftlichkeit des ganzen Vorhabens
- [ ] **Fachanwaltliche Bestätigung zu ADR 0007** vor dem Bau der Schmerzampel — das ADR
      akzeptiert das MDR-Risiko bewusst, löst es aber nicht ab
- [ ] KRS-Stufensystem: dieselbe Abwägung wie bei der Ampel, noch nicht entschieden

- [ ] **Tech-Stack-Entscheidung**: Die Website ist statisches HTML/CSS/JS. Für das
      Portal brauchen wir Backend, Datenbank, Auth — das ist eine eigene Anwendung,
      keine Erweiterung
- [ ] **Auth-Konzept**: Erstregistrierung, Identitätsprüfung, Passwort-Reset, 2FA
      für die Praxisseite
- [ ] **Datenmodell** mit Append-only und Audit-Log von Anfang an (ADR 0002)
- [ ] **PDF-Import**: Wie kommen die bestehenden Pläne ins System? Manuell abtippen,
      als PDF anhängen, oder strukturiert erfassen?
- [ ] Backup- und Wiederherstellungskonzept, dokumentiert und **getestet**

---

## 5. Extern benötigt

- [ ] **Fachanwalt für IT-/Medizinrecht** — Prüfung von AV-Vertrag,
      Verschwiegenheitsverpflichtung, Kundenvertrag, Impressum, Datenschutzerklärung
- [ ] Ggf. **externer Datenschutzbeauftragter** für die Praxis
- [ ] **Steuerberater** — Rechtsformwahl und Gründung
- [ ] **Fotograf** für Praxis-/Behandlungsbilder

---

## 6. Priorisierung nach Phase

| Prio | Blockiert | Punkte |
|---|---|---|
| **P0** | Phase 1 Go-live (Website) | Impressum-Daten (2.1), **AGB-Seite (2.1)**, **Preis-Entscheidung (2.2)**, **Widerspruch 45–60 Min. (2.2)**, echte Fotos (2.3), Testimonial-Entscheidung (2.4), Domain-Zugang (1.2), Hosting-Entscheidung (4.2), Maps-Consent (4.2), Formular-Backend (4.2) |
| **P1** | Planung Phase 3 | Export-Frage (0.2), AV-Vertrag thevea (1.1), Arbeitsablauf (1.4), Ist-Kommunikation (0.3), Volumen (1.5) |
| **P2** | Bau Phase 3 | AV-Vertrag, § 203-Verpflichtung, DSFA, Hosting geschützter Bereich, Rechtsform (4.1), Tech-Stack (4.3) |
| **P3** | Phase 4 (Portal) | Patienteneinwilligungen, Auth-Konzept, PDF-Import-Weg |

**P0 ist realistisch in ein bis zwei Gesprächen erledigt** — das meiste sind Angaben,
die er im Kopf oder in einer Schublade hat. Damit kann die Website live gehen, während
Phase 3 noch geklärt wird.

---

## 7. Fragenkatalog zum Weitergeben

Kompakte Fassung für ein erstes Gespräch — bewusst ohne Fachjargon.

**Zur aktuellen Software** *(1, 2 und 4 sind beantwortet: thevea, Cloud, TI-fähig)*
1. ~~Welches Programm nutzt du für Patientenverwaltung und Dokumentation?~~ → thevea
2. ~~Läuft das auf einem Rechner bei dir in der Praxis oder im Internet?~~ → Cloud
3. Kannst du aus thevea deine **Patientendaten exportieren** — und in welchem Format?
4. ~~Ist dein Programm für die TI vorbereitet?~~ → ja laut Hersteller, bestätigen lassen
4a. Hast du den **Vertrag mit thevea/opta data** greifbar (Auftragsverarbeitung)?
4b. Kannst du mir mal eine **Terminerinnerungs-Mail** zeigen, die thevea verschickt?
4c. Nutzt du Starter oder Pro, und wie lange läuft der Vertrag?

**Zu Website und E-Mail**
5. Wo ist deine Domain akphysiotherapie.de registriert, und wer hat die Zugangsdaten?
6. Läuft die aktuelle Seite bei Wix? Wie lange läuft der Vertrag noch?
7. Wo liegt dein E-Mail-Postfach info@akphysiotherapie.de?
8. Schickst du Patienten heute schon Pläne oder Befunde per E-Mail oder WhatsApp?

**Zum Arbeitsalltag**
9. Wie läuft ein typischer Erstkontakt bis zum ersten Termin ab?
10. Wie erstellst du einen Trainingsplan, und wie bekommt der Patient ihn?
11. Wie viele Patienten betreust du aktuell ungefähr, wie viele Termine pro Woche?
12. Was nervt dich an deinem jetzigen Ablauf am meisten?

**Für die Website**
13. USt-IdNr., Rechtsform — und welche Anschrift gehört ins Impressum, Frankfurt oder
    Mörfelden-Walldorf? *(Name und Aufsichtsbehörde stehen im alten Impressum,
    nur bestätigen lassen.)*
13a. Sollen die Preise von der alten Seite mit rüber? Sind sie noch aktuell?
13b. Gibt es die 30-Minuten-Einheit noch? *(Widerspruch zum 45–60-Minuten-Versprechen.)*
13c. Deine vier Blogbeiträge — sollen wir die übernehmen?
14. Deine Fortbildungen, Berufserfahrung, Fachverbandsmitgliedschaften
15. Sollen Öffnungszeiten und Preise auf die Seite?
16. Haben wir echte Fotos aus der Praxis — oder sollen wir einen Fotografen anfragen?
17. Gibt es Patienten, die schriftlich einer Nennung als Referenz zustimmen würden?
18. Bekommen wir Zugang zu deinem Google-Business-Profil (für Bewertungen und Karte)?

**Organisatorisch**
19. Hast du einen Datenschutzbeauftragten oder einen Anwalt, mit dem du arbeitest?
20. Bis wann soll die neue Seite live sein?
