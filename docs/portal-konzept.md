# Patientenportal: Bewertung der Idee und offene Entscheidungen

Stand: 2026-08-15 · Anlass: Vorschlag, dem Patienten einen Link auf eine Subdomain zu
schicken, hinter der seine Dokumente zu Regeneration, Training und Ernährung liegen.
Grundlage: `Rehabilitationstagebuch_ohne_logo.pdf` (37 Seiten, leere Vorlage, keine
echten Patientendaten enthalten) und [`pvs-thevea.md`](pvs-thevea.md).

---

## 1. Kurzbewertung

**Die Idee ist richtig, und das PDF ist bereits die Spezifikation.** Das
Rehabilitationstagebuch enthält exakt die Struktur, die ein Portal braucht: Stammangaben,
Supplemente-Plan mit Einnahmekalender, Schmerz- und Trainingsprotokoll, Assessments,
zwölf Wochenpläne. Er hat den Inhalt und die Didaktik schon durchdacht — es fehlt nur die
digitale Form. Das ist die günstigste Ausgangslage, die ein Softwareprojekt haben kann.

**Der schwache Punkt ist nicht das Portal, sondern der Link.** Ein Link, der ohne weitere
Prüfung Gesundheitsdaten freigibt, ist funktional ein Passwort — nur eines, das
unverschlüsselt per E-Mail verschickt wird und danach dauerhaft im Postfach liegt.
Details in Abschnitt 3.

**Zwei Inhalte des PDF berühren die MDR-Grenze** und entscheiden darüber, ob wir ein
Medizinprodukt bauen oder nicht. Das ist die folgenreichste Frage im ganzen Vorhaben und
steht in Abschnitt 5.

---

## 2. Gibt es das bei thevea schon? — Nein

Nach derzeitiger Recherche hat thevea **kein Patientenportal, keine Patienten-App, keine
Übungsbibliothek und keine Trainingsplan-Funktion**. Was thevea in Richtung Patient
bietet, ist:

- automatische Terminerinnerung per E-Mail oder SMS, auch Absagen
- Links zur Videotherapie
- Behandlungsdokumentation durch den Therapeuten, u. a. über iPad

Das heißt: **keine Doppelung.** Unser Portal setzt genau dort an, wo thevea aufhört, und
das ist gleichzeitig die saubere Leistungsabgrenzung, die
[ADR 0001](decisions/0001-scope-kein-zugelassenes-pvs.md) verlangt.

⚠ **Die wichtigste kommerzielle Frage ist trotzdem offen:** Steht ein Patientenportal bei
thevea/opta data auf der Roadmap? opta data ist ein Konzern mit Entwicklungsbudget. Wenn
dort in zwölf Monaten ein Patientenportal erscheint, das im 69,90-€-Tarif enthalten ist,
ist unser Produkt wirtschaftlich tot — unabhängig davon, wie gut es ist. **Vor Angebot
direkt bei thevea erfragen.** Das kostet eine E-Mail und entscheidet über das Projekt.

---

## 3. Der Zugangslink — so nicht, aber so schon

### Was am „einfachen Link" nicht funktioniert

Ein dauerhaft gültiger Link auf die Dokumente hat sechs Probleme, die alle unabhängig
voneinander auftreten:

1. **Transport:** Standard-E-Mail ist unverschlüsselt. Wer die Mail sieht, hat den Zugang.
2. **Verweildauer:** Der Link bleibt im Postfach, im Archiv, im Backup des Mailanbieters.
3. **Streuung:** Browserverlauf, Verlaufssynchronisierung über mehrere Geräte, geteilte
   Familiengeräte, Weiterleitung, Screenshot.
4. **Kein Widerruf:** Ohne eigene Mechanik lässt sich ein einmal verschickter Link nicht
   entziehen — auch nicht, wenn die Behandlung endet.
5. **Keine Identität:** Wir wissen nicht, *wer* geöffnet hat.
   [ADR 0002](decisions/0002-behandlungsdaten-append-only.md) verlangt aber ein Audit-Log
   mit „wer, wann, was, von wo". Ohne Authentifizierung gibt es kein „wer".
6. **Falscher Empfänger:** Landet der Link im falschen Postfach, ist das eine Offenbarung
   im Sinne von **§ 203 StGB** — nicht bloß ein Datenschutzverstoß.

Art. 32 DSGVO verlangt Maßnahmen, die dem Risiko angemessen sind. Bei Gesundheitsdaten
ist die Messlatte hoch, und ein teilbarer Dauerlink ist gegenüber einer Aufsichtsbehörde
schwer zu verteidigen.

### Was funktioniert und die Idee trotzdem rettet

Der Reiz des Vorschlags ist die Niedrigschwelligkeit — kein Registrierungsformular, kein
vergessenes Passwort. Das lässt sich erhalten:

- **Magic Link nur als Erstzugang.** Einmalig verwendbar, kurze Gültigkeit (15–30 Minuten),
  verbraucht sich beim ersten Klick.
- **Zweiter Faktor beim Erstzugang.** Ein kurzer Code, den der Physio in der Praxis
  mündlich mitgibt oder auf den Ausdruck schreibt. Wer die Mail abfängt, hat den Code nicht.
- **Danach eine echte Sitzung.** Der Patient hinterlegt Passkey oder Passwort. Ab dann
  normaler Login, kein Link mehr nötig.
- **Die Mail enthält null Gesundheitsdaten** — nicht im Betreff, nicht im Text, kein
  Dateiname, der etwas verrät. Zulässiges Muster: „Es gibt eine Neuigkeit in Ihrem
  Portal" plus Link. Das steht bereits so in `CLAUDE.md`.
- **Dokumente nie über Dauerlinks.** Dateien nur innerhalb der Sitzung, über kurzlebige
  signierte URLs, die sich nicht weitergeben lassen.
- **Widerruf und Übersicht:** Sitzungsablauf, aktive Geräte einsehbar, Zugang durch den
  Physio jederzeit sperrbar.

→ Entschieden als [ADR 0005](decisions/0005-zugangskonzept-portal.md): Link **und**
temporäres Passwort statt reinem Magic Link, Konten werden ausschließlich vom Physio
angelegt und verwaltet, erste Anmeldung erzwingt Passwortänderung.

---

## 4. Datenschutz: die Frage ist nicht „außerhalb thevea"

Die Sorge ist berechtigt, zielt aber leicht daneben. Entscheidend ist nicht, *wo* die
Daten liegen, sondern *wer wofür verantwortlich ist*.

### 4.1 Ein zweiter Verarbeiter ist kein Tabubruch

**Verantwortlicher bleibt die Praxis** (Art. 4 Nr. 7 DSGVO) — für thevea genauso wie für
uns. Ein zweiter Auftragsverarbeiter neben thevea ist rechtlich nichts Ungewöhnliches; er
ist ein zweiter Vertrag mit denselben Anforderungen. Der Physio hat mit thevea bereits
einen solchen Vertrag geschlossen, das Muster ist ihm also vertraut.

### 4.2 Was wir dafür brauchen

- **AV-Vertrag nach Art. 28** zwischen Praxis und uns, inkl. dokumentierter TOM
- **EU-Hosting** und eine vollständige, ebenfalls EU-ansässige Unterauftragnehmerkette
  (Regel 5 in `CLAUDE.md`)
- **Verpflichtung nach § 203 Abs. 3 StGB** — schriftlich, namentlich, für **jede** Person
  mit Zugriffsmöglichkeit, uns beide eingeschlossen, und für jeden Subunternehmer.
  Das ist Strafrecht. Ein Verstoß ist kein Bußgeld, sondern eine Straftat, und zwar
  persönlich.
- **Verzeichnis von Verarbeitungstätigkeiten** (Art. 30) auf beiden Seiten
- **Löschkonzept**, das die 10-Jahres-Frist aus § 630f BGB berücksichtigt

### 4.3 Rechtsgrundlage

Die Behandlungsdokumentation selbst trägt **Art. 9 Abs. 2 lit. h** i. V. m. § 22 BDSG.
Für das Portal als *zusätzlichen Kanal* ist die saubere Grundlage eine **ausdrückliche
Einwilligung nach Art. 9 Abs. 2 lit. a** — freiwillig, widerrufbar, dokumentiert.

Wichtig und leicht zu übersehen: Die Einwilligung muss **echt freiwillig** sein. Der
Patient darf nicht gezwungen sein, das Portal zu nutzen, um behandelt zu werden. Der
Papier- bzw. PDF-Weg muss als Alternative bestehen bleiben. Sonst ist die Einwilligung
unwirksam und mit ihr die ganze Verarbeitung.

### 4.4 Datenschutz-Folgenabschätzung ist Pflicht, nicht Kür

Art. 35 Abs. 3 lit. b greift bei umfangreicher Verarbeitung besonderer Datenkategorien;
Patientenportale stehen zudem auf der Muss-Liste der deutschen Aufsichtsbehörden.
**Die DSFA muss vor Inbetriebnahme vorliegen**, nicht danach. Sie ist gleichzeitig das
beste Werkzeug, um die Entscheidungen aus diesem Dokument sauber zu begründen.

### 4.5 Der stärkste Hebel: das Portal braucht den Namen vielleicht gar nicht

Hier liegt die eigentliche Antwort auf die Sorge. **Wir müssen die Stammdaten aus thevea
nicht spiegeln.** Ein Portal, das seinen Zweck erfüllt, braucht:

- eine **Kennung** (Pseudonym/UUID) statt Name und Geburtsdatum
- den **Inhalt**: Plan, Übungen, Supplement-Plan, Dokumente
- die **Eingaben** des Patienten: Häkchen, Schmerzwert, Notizen

Wer hinter der Kennung steckt, wissen thevea und der Physio — nicht zwingend unser
Server. Damit sinkt das Schadensmaß bei einem Vorfall erheblich: Ein Angreifer bekommt
Trainingspläne ohne zugeordnete Personen.

Vollständige Anonymität ist das nicht (der Physio kann rückverknüpfen, der Patient sieht
seine eigenen Daten), es bleibt personenbezogen im Sinne der DSGVO. Aber es ist saubere
**Datenminimierung nach Art. 5 Abs. 1 lit. c**, es verkleinert den DSFA-Umfang, und es
löst nebenbei das Doppelpflege-Problem, weil wir keine zweite Stammdatenhaltung betreiben.

**Konkret zur Frage nach Größe und Geburtsdatum:** Beide werden nur gebraucht, wenn das
Portal den Ruheumsatz *rechnet*. Trägt der Physio die Zielwerte ein, brauchen wir sie
nicht. Siehe dazu 5.3.

→ **Entschieden als [ADR 0006](decisions/0006-echte-namen-im-portal.md), abweichend vom
Vorschlag hier:** Das Konto trägt den echten Namen, keine Pseudonymkennung. Der Wunsch
nach Personalisierung wiegt schwerer als der Dämpfungseffekt bei einem Datenleck. Die
übrige Datensparsamkeit (Größe, Geburtsdatum nur bei Bedarf) bleibt davon unberührt.

---

## 5. Zwei Tretminen im PDF — hier entscheidet sich die MDR-Frage

Das ist der Abschnitt, der beim Lesen des PDF am wenigsten auffällt und am meisten kostet.

### 5.1 Die Schmerzampel

Das PDF enthält ein Ampelsystem auf Basis der NPRS: grün 0–3 „Übung wie geplant
fortführen", gelb 4–5 „Verlauf beobachten, ggf. reduzieren", rot 6+ „Übung sofort
abbrechen oder deutlich reduzieren".

Auf Papier ist das unproblematisch: Der Therapeut gibt dem Patienten eine Regel mit, der
Patient wendet sie selbst an. Die Bewertung findet im Kopf des Patienten statt.

**Sobald die Software den eingegebenen Wert entgegennimmt und daraus selbst eine Farbe,
eine Warnung oder eine Handlungsanweisung erzeugt, bewertet die Software einen Messwert
mit therapeutischer Konsequenz.** Das ist exakt die Grenze aus
[ADR 0004](decisions/0004-kein-medizinprodukt.md) und MDR Regel 11 — mit realistischer
Einstufung als Klasse IIa und allem, was daran hängt: Benannte Stelle, technische
Dokumentation, klinische Bewertung, QM-System nach ISO 13485.

| Zulässig (Dokumentation) | Nicht zulässig ohne CE (Bewertung) |
|---|---|
| Die Ampel als erklärenden Text zeigen, wie im PDF | Den eingegebenen Wert automatisch einfärben |
| Den Wert erfassen und speichern | „Ihr Wert liegt im roten Bereich — Übung abbrechen" |
| Den Verlauf als reines Diagramm zeigen | Trendpfeil, Score, Warnhinweis, Push-Nachricht |
| Den Patienten selbst zuordnen lassen | Automatische Meldung an den Physio bei Schwellwert |

Das ist im Code eine Entscheidung von wenigen Zeilen — und rechtlich der Unterschied
zwischen einer Dokumentations-App und einem zulassungspflichtigen Medizinprodukt.

→ **Entschieden als [ADR 0007](decisions/0007-schmerzampel-mdr-abgrenzung.md):** Die
automatische Zuordnung bleibt, nur die Formulierung wird abgeschwächt (kein „sofort
abbrechen" mehr). Das ADR hält ausdrücklich fest, dass dies die MDR-Frage **nicht löst**,
sondern ein bewusst akzeptiertes Risiko mit Fachanwalts-Vorbehalt vor dem Bau ist — die
in der rechten Spalte oben beschriebene sichere Variante bleibt die Rückfalloption.

### 5.2 Das KRS-System

Neun Stufen mit definierten Kriterien für den Stufenwechsel (Bant et al., 2017).
Dieselbe Logik: **Anzeigen**, auf welcher Stufe der Physio den Patienten eingetragen hat,
ist unkritisch. **Vorschlagen** oder automatisch prüfen, ob die Kriterien für die nächste
Stufe erfüllt sind, ist Regel 11.

### 5.3 Der Ruheumsatz-Rechner

Wenn das Portal aus Größe, Gewicht und Alter einen Grundumsatz und daraus Kalorien- und
Proteinmengen berechnet, ist das ein Rechner im therapeutischen Kontext. Reine
Ernährungsrechner sind in der Regel kein Medizinprodukt, im Reha-Kontext mit
OP-Bezug wird die Einordnung aber unscharf.

Sicherer und nebenbei datensparsamer: **Der Physio trägt die Zielwerte ein, das Portal
zeigt sie an.** Dann brauchen wir Größe und Gewicht gar nicht zu speichern.

---

## 6. Health Claims im Supplement-Teil

Die Mikronährstoff-Tabelle im PDF enthält Wirkaussagen wie „Fördert die Kollagenbildung,
unterstützt die Wundheilung und wirkt antioxidativ" (Vitamin C) oder „Wirkt
entzündungshemmend" (Omega 3).

Ein Teil davon ist als Claim nach der **Health-Claims-Verordnung (EU) 1924/2006**
zugelassen — etwa „trägt zu einer normalen Kollagenbildung bei" für Vitamin C. Ein
anderer Teil ist es nicht: „unterstützt die Wundheilung" und „wirkt entzündungshemmend"
sind in dieser Form nicht zugelassene bzw. krankheitsbezogene Aussagen.

Solange das ein Ausdruck für den einzelnen Patienten in der Behandlung ist, ist der
Kontext ein anderer als Werbung. Sobald es als digitaler Inhalt ausgeliefert wird — und
erst recht, falls je ein Produktname, ein Shop-Link oder eine Provision dazukommt —
greift die HCVO voll, und § 11 HWG kommt daneben in Betracht.

→ Vor der Digitalisierung einmal durch die Liste der zugelassenen Claims gehen und die
Formulierungen anpassen. Das ist Redaktionsarbeit, kein Entwicklungsaufwand — muss aber
vor dem ersten digitalen Plan passieren.

---

## 7. Subdomain: ja, mit zwei Auflagen

`portal.akphysiotherapie.de` passt zur Trennung aus `CLAUDE.md` (getrennte Deployments,
getrennte Datenbanken). Zwei Details, die man leicht falsch macht:

1. **Cookies niemals auf `.akphysiotherapie.de` setzen.** Sonst schickt der Browser das
   Sitzungscookie auch an die Marketingseite, und die Trennung ist nur noch auf dem
   Papier vorhanden. Host-only auf der Portal-Subdomain, dazu `Secure`, `HttpOnly`,
   `SameSite=Strict`.
2. **Eigene CSP mit ausschließlich `self`**, keine gemeinsamen Assets mit der
   Website — kein geteiltes CDN, keine geteilten Fonts
   ([ADR 0003](decisions/0003-kein-tracking-im-portal.md)).

Eine komplett eigene Domain wäre technisch noch sauberer, kostet aber
Wiedererkennbarkeit beim Patienten. Subdomain mit korrekt gesetzten Cookies reicht.

---

## 8. Was das für den Phasenplan bedeutet

Das beschriebene Portal ist **Phase 4**, nicht Phase 1 — mit allem, was `CLAUDE.md` dafür
verlangt. Wer schneller etwas in der Hand haben will, hat eine ehrliche Zwischenstufe:

**Reine Dokumentenablage ohne Patienteneingaben.** Der Physio lädt PDF und Plan hoch, der
Patient liest sie. Kein Schmerzverlauf, keine Häkchen, keine Selbsteingabe.

Das ist deutlich schmaler: Ohne Patienteneingaben entfällt der append-only-Zwang für die
Gegenrichtung, die Schmerzampel-Frage stellt sich nicht, die MDR-Frage stellt sich nicht.

Was **nicht** entfällt: Es sind trotzdem Gesundheitsdaten. AV-Vertrag, § 203-Verpflichtung,
DSFA, EU-Hosting und das Zugangskonzept aus Abschnitt 3 gelten unverändert. Die
Zwischenstufe spart Produktkomplexität, keine Rechtsarbeit.

---

## 9. Nächste Schritte

**Sofort, kostet je eine E-Mail:**

- [ ] Bei thevea/opta data fragen, ob ein **Patientenportal auf der Roadmap** steht
      *(entscheidet über die Wirtschaftlichkeit des ganzen Vorhabens)*
- [ ] Beim Physio: Wie kommt das Rehabilitationstagebuch heute zum Patienten — Ausdruck,
      E-Mail-Anhang, WhatsApp? *(siehe `offene-punkte.md` 0.3)*
- [ ] Wie viele Tagebücher pro Monat? *(Rechnet sich die Digitalisierung überhaupt?)*

**Vor der ersten Zeile Code:**

- [x] **[ADR 0005](decisions/0005-zugangskonzept-portal.md)** — Zugang: Link + temporäres
      Passwort, Konten ausschließlich physio-verwaltet (Abschnitt 3)
- [x] **[ADR 0006](decisions/0006-echte-namen-im-portal.md)** — echter Name statt
      Pseudonym, Rest der Datensparsamkeit bleibt (Abschnitt 4.5)
- [x] **[ADR 0007](decisions/0007-schmerzampel-mdr-abgrenzung.md)** — Ampel bleibt
      automatisiert, Formulierung abgeschwächt, MDR-Risiko bewusst offen (Abschnitt 5.1)
- [ ] Fachanwaltliche Bestätigung zu ADR 0007 einholen, **bevor** die Ampel gebaut wird
- [ ] KRS-Stufensystem: dieselbe Abwägung wie ADR 0007 treffen, noch offen
- [ ] Entscheidung: volles Portal oder Dokumentenablage zuerst (Abschnitt 8)

**Vor Inbetriebnahme:**

- [ ] DSFA erstellt und dokumentiert
- [ ] AV-Vertrag und § 203-Verpflichtungen unterschrieben
- [ ] Einwilligungstext für Patienten, anwaltlich geprüft, mit Papier-Alternative
- [ ] Supplement-Texte auf zugelassene Health Claims geprüft
