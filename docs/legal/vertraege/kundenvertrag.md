# Vertrag über Entwicklung und Betrieb der Reha-Plattform (Entwurf)

**Kein Rechtsrat – Entwurf zum Ausfüllen, siehe [README](README.md).**

zwischen

**[Praxis AK Physiotherapie, Inhaber Alexander Koetter, Anschrift]** – „Praxis" –

und

**[Roko Nachname, Einzelunternehmer, IT-Dienstleistungen, Anschrift]** – „Dienstleister" –

## 1 Gegenstand

1.1 Der Dienstleister stellt der Praxis die Software „Reha-Plattform" (Rehabilitationstagebuch
mit Patienten- und Praxisbereich, Stand der Funktionsbeschreibung in Anlage 1) zur Nutzung
bereit und betreibt sie.

1.2 **Was die Software nicht ist** (ADR 0001, ADR 0004). Die Praxis bestätigt, dass ihr das
bekannt ist und sie die Software entsprechend einsetzt:

- kein zugelassenes Praxisverwaltungssystem; das bestehende PVS bleibt im Einsatz;
- keine Anbindung an die Telematikinfrastruktur (ePA, KIM, eVerordnung);
- keine Abrechnung nach § 302 SGB V;
- kein Ersatz für die Papierverordnung; Originale bleiben aufbewahrungspflichtig bei der Praxis;
- **kein Medizinprodukt**: Die Software zeigt an, was Therapeut oder Patient eingetragen
  haben. Sie erstellt keine Behandlungs- oder Trainingspläne, gibt keine Therapieempfehlungen
  und bewertet keine Messwerte. Ausnahme ist die Schmerzampel nach Ziffer 1.3.

1.3 **Schmerzampel.** Die Software ordnet einen vom Patienten eingegebenen Schmerzwert (0–10)
automatisch den Stufen Grün/Gelb/Rot zu, nach dem Schema aus dem Rehabilitationstagebuch der
Praxis (Anlage 1). Ob diese Funktion die Medizinprodukteverordnung berührt, ist **nicht
anwaltlich geprüft**. Die Praxis kennt dieses Risiko und wünscht die Funktion ausdrücklich.
Der Dienstleister kann sie jederzeit ohne Umbau abschalten; dann werden nur Zahl und Verlauf
angezeigt. Die fachliche Einordnung der Werte bleibt Aufgabe der Praxis.

## 2 Leistungen des Dienstleisters

2.1 **Entwicklung** bis zum in Anlage 1 beschriebenen Stand, Abnahme durch die Praxis.

2.2 **Betrieb**: Hosting bei einem Rechenzentrumsbetreiber in Deutschland (derzeit Hetzner
Online GmbH), tägliches verschlüsseltes Backup, Sicherheitsupdates, Wiederherstellungstest
mindestens vierteljährlich, Fehlerbehebung.

2.3 **Reaktionszeit**: Der Dienstleister reagiert auf Störungsmeldungen innerhalb eines
Werktags (Mo–Fr, 9–17 Uhr). Eine Verfügbarkeit rund um die Uhr wird nicht zugesagt; Ziel
sind 99 % im Monatsmittel ohne angekündigte Wartungsfenster.

2.4 **Weiterentwicklung** nach gesonderter Beauftragung.

## 3 Mitwirkung der Praxis

3.1 Die Praxis ist Verantwortliche im Sinne der DSGVO. Sie holt die Einwilligungen der
Patienten ein, führt das Verzeichnis der Verarbeitungstätigkeiten und die
Datenschutz-Folgenabschätzung (mit Zuarbeit des Dienstleisters) und bestellt, soweit
erforderlich, einen Datenschutzbeauftragten.

3.2 **Inhalte.** Alle Texte, Pläne, Übungen, Supplement-Empfehlungen und Wissensinhalte in
der Software stammen von der Praxis und werden von ihr verantwortet – auch werbe-,
heilmittelwerbe- und lebensmittelrechtlich (insbesondere Health-Claims-Verordnung
(EG) Nr. 1924/2006). Die Software nennt die Praxis als Autorin. Der Dienstleister prüft
Inhalte nicht.

3.3 Die Praxis übergibt Zugangsdaten persönlich und schreibt Passwörter nicht in E-Mails
oder Messenger.

3.4 Die Praxis stellt sicher, dass Behandlung und Dokumentation auch ohne die Software
möglich bleiben (kein faktischer Zwang zur Nutzung, Freiwilligkeit der Einwilligung).

## 4 Vergütung

4.1 Entwicklung: Festpreis **[Betrag] € netto**, fällig **[Zahlungsplan, z. B. 50 % bei
Auftrag, 50 % bei Abnahme]**.

4.2 Betrieb: **[Betrag] € netto monatlich**, im Voraus, ab Produktivstart. Enthalten:
Hosting, Backup, Updates, Reaktionszeit nach 2.3, bis zu **[n]** Stunden Pflege im Monat.

4.3 Änderungen der Vergütung mit drei Monaten Vorlauf zum Monatsende.

## 5 Nutzungsrechte

5.1 Die Software bleibt Eigentum des Dienstleisters und seines Entwicklers. Die Praxis erhält
ein **einfaches, nicht übertragbares Nutzungsrecht** für die Dauer des Vertrags, beschränkt
auf den eigenen Praxisbetrieb.

5.2 Der Dienstleister darf die Software oder Teile davon für andere Kunden nutzen. Daten der
Praxis oder ihrer Patienten sind davon ausgenommen und werden nie für andere Kunden
verwendet.

5.3 Inhalte der Praxis (Texte, Pläne, Bilder) bleiben Eigentum der Praxis.

## 6 Datenschutz und Geheimnisschutz

6.1 Die Verarbeitung personenbezogener Daten regelt der Auftragsverarbeitungsvertrag
(Anlage 2), der Bestandteil dieses Vertrags ist.

6.2 Der Dienstleister und alle von ihm eingesetzten Personen sind nach § 203 Abs. 4 StGB zur
Geheimhaltung verpflichtet (Anlage 3) und werden von der Praxis entsprechend verpflichtet.

6.3 Unterauftragnehmer: **Luis Rongstock (Entwicklung, Betrieb)**, **Hetzner Online GmbH
(Hosting, Backup)**, **[Mailversender]**. Weitere nur mit Zustimmung der Praxis.

6.4 Es werden keine Daten außerhalb der EU verarbeitet.

## 7 Laufzeit, Kündigung, Beendigung

7.1 Betrieb ab **[Datum]**, unbestimmte Laufzeit, Kündigung mit drei Monaten Frist zum
Monatsende, erstmals nach **[12]** Monaten. Außerordentliche Kündigung aus wichtigem Grund
bleibt unberührt.

7.2 **Exit.** Bei Beendigung übergibt der Dienstleister der Praxis innerhalb von 30 Tagen
einen vollständigen, maschinenlesbaren Export aller Daten (JSON) und, auf Wunsch, einen
lesbaren Verlaufsbericht je Patient (PDF). Danach löscht er alle Daten und bestätigt das
schriftlich – außer soweit gesetzliche Aufbewahrungspflichten des Dienstleisters selbst
entgegenstehen. **Die zehnjährige Aufbewahrungspflicht nach § 630f BGB liegt bei der
Praxis**; sie muss den Export sicher verwahren.

7.3 Der Export ist auch bei Streit über Zahlungen geschuldet.

## 8 Haftung

8.1 Der Dienstleister haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei
Verletzung von Leben, Körper, Gesundheit.

8.2 Bei einfacher Fahrlässigkeit haftet er nur bei Verletzung wesentlicher Vertragspflichten,
begrenzt auf den vertragstypischen, vorhersehbaren Schaden, höchstens **[z. B. die
Jahresvergütung des Betriebs]**.

8.3 Für Inhalte der Praxis (Ziffer 3.2) und für die medizinische Einordnung von Werten
haftet der Dienstleister nicht.

8.4 Die Parteien halten fest, dass der Dienstleister keine Gesellschaft mit beschränkter
Haftung ist. Eine Vermögensschadenhaftpflicht wird abgeschlossen, **[sobald / soweit]**
vorhanden; Nachweis auf Verlangen.

## 9 Schlussbestimmungen

Änderungen in Textform. Deutsches Recht. Gerichtsstand **[Sitz des Dienstleisters]**. Sollte
eine Bestimmung unwirksam sein, bleibt der Rest wirksam.

Anlagen: 1 Funktionsbeschreibung und Negativliste · 2 AV-Vertrag · 3 Verschwiegenheit ·
4 TOM · 5 Preisblatt

Ort, Datum, Unterschriften: __________________ / __________________
