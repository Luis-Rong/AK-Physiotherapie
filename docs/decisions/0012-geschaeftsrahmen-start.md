# ADR 0012: Geschäftsrahmen für den Start – zwei Einzelgewerbe, Code bleibt bei uns, nur AK Physio

- **Status:** akzeptiert
- **Datum:** 2026-09-07
- **Beteiligte:** Luis (für Luis und Roko), Claude

## Kontext

Die Plattform steht als erste Ausbaustufe. Vor Angebot und Echtbetrieb waren acht
Entscheidungen offen (Rechtsform, Code-Eigentum, Preismodell, Schmerzampel,
KRS-Stufen, Benachrichtigungen, Mandantenfähigkeit, thevea-Roadmap) plus die Frage,
wer für Health-Claims in den Inhalten haftet. Der Kunde ist ein Bekannter von Roko,
der das Tagebuch „einfach gemacht haben will". Es gibt kein Budget für Anwälte,
Notar oder Gesellschaftsgründung.

## Entscheidung

1. **Rechtsform:** Kein gemeinsames Unternehmen. Luis und Roko melden je ein
   Einzelgewerbe (IT-Dienstleistungen) an. Rechnungskette: Roko → AK Physio,
   Luis → Roko. Wird das Produkt skaliert, wird der Rahmen erweitert (Gesellschaft,
   Anwalt) – nicht vorher.
2. **Code:** bleibt bei uns. AK Physio erhält ein **einfaches Nutzungsrecht**, damit
   die Option auf weitere Praxen offen bleibt.
3. **Preis:** Entwicklung als Festpreis, Betrieb als laufende Pauschale. Zahlen sind
   noch nicht ausgehandelt und intern noch nicht festgelegt.
4. **Schmerzampel:** bleibt aktiv (ADR 0011). Der Patient trägt seine Werte selbst
   ein; die Darstellung wird eine erkennbare Ampel (drei Lichter), ergänzt um den
   Hinweis, dass die Einfärbung kein ärztlicher Rat ist und die Einschätzung der
   Praxis nicht ersetzt. Die anwaltliche MDR-Prüfung wird bewusst nicht jetzt
   eingeholt; das Risiko wird im Kundenvertrag benannt.
5. **Benachrichtigungen:** per **E-Mail**, nicht Push. Die Plattform bleibt eine
   Web-App (als PWA installierbar); eine native App ist nicht geplant. Mails enthalten
   kein Gesundheitsdatum – nur „Es gibt etwas Neues" plus Login-Link. Über denselben
   Kanal laufen Anfragen zu Betroffenenrechten; die Auskunft selbst wird nicht
   unverschlüsselt per Mail verschickt, sondern als Export im Portal bereitgestellt.
6. **Nur AK Physio.** Kein Mandantenumbau jetzt. Sollte eine zweite Praxis kommen,
   bekommt sie eine eigene Instanz.
7. **thevea:** keine Anfrage zur Roadmap, keine Abhängigkeit. Falls thevea ein Portal
   liefert, wird umgeplant.
8. **Kundenvertrag und AV-Vertrag** entwerfen wir gemeinsam mit Claude, ohne Anwalt.
   Claude ist kein Anwalt; das ist ein bewusst akzeptiertes Risiko.
9. **Health Claims:** Der Physio verantwortet die Inhalte als Autor (ADR 0009). Das
   wird im Vertrag festgehalten, und der Autor wird im Wissensbereich sichtbar als
   Quelle genannt, damit keine Verwechslung mit uns als Betreiber entsteht.

## Begründung

Das Vorhaben ist heute zu klein für Gesellschaft, Notar und Fachanwalt. Was ohne
Geld geht – Verträge selbst schreiben, Verpflichtungen auf Papier, Option auf
Skalierung durch Code-Eigentum – wird gemacht; was Geld kostet, wird verschoben,
bis das Produkt es trägt.

## Konsequenzen

- **Haftung:** Beide haften persönlich und unbeschränkt. Das ist bekannt und
  akzeptiert. § 203 StGB trifft ohnehin persönlich, unabhängig von der Rechtsform.
- **Zwei Verpflichtungsketten auf Papier, kostenlos, aber Pflicht:** Die
  Verschwiegenheitsverpflichtung nach § 203 Abs. 3 StGB braucht der Physio schriftlich
  von Roko, und Roko von Luis als seinem Subunternehmer. Ebenso der AV-Vertrag:
  AK Physio ↔ Roko (Art. 28), Roko ↔ Luis als Unterauftragsverarbeiter (Art. 28 Abs. 4),
  Hetzner als weiterer Unterauftragnehmer in beiden. Vorlagen dafür schreiben wir.
- **Versicherung** (Vermögensschadenhaftpflicht) bleibt als Empfehlung offen; sie ist
  der eine Posten, an dem sich sparen bei einem Vorfall persönlich auswirkt.
- **Mailversender** muss vor der ersten Mail nach Regel 5 geprüft sein (EU, AV-Vertrag,
  § 203-Verpflichtung). Kandidaten: deutsche Anbieter, kein US-Dienst.
- **Folgearbeiten im Code:** Ampel als Ampel darstellen plus Hinweistext;
  Autorenzeile im Wissensbereich; Mail-Benachrichtigung; Datenexport für Auskunft.
- **Gestaltung:** Die Oberfläche soll wärmer und bunter werden – eigene Piktogramme
  und Bilder, keine Emojis. Der Patient soll gern mit dem Programm arbeiten. Die
  erdige Farbwelt (ADR 0008) bleibt Basis, bekommt aber mehr Akzent und Bildsprache.

## Verworfene Alternativen

- **UG/GmbH vor dem ersten Vertrag:** Haftungsschutz, aber Notar, Steuerberater und
  laufende Kosten ohne Umsatzbasis. Verschoben auf den Fall der Skalierung.
- **Web-Push statt Mail:** datenschutzrechtlich schlanker (kein weiterer
  Auftragsverarbeiter), aber nur in der installierten App und damit für viele Patienten
  unsichtbar. Mail erreicht alle. Push bleibt als Ergänzung möglich.
- **Mandantenfähigkeit jetzt einziehen:** Architekturarbeit für einen Fall, der noch
  nicht existiert. Bei Bedarf eigene Instanz pro Praxis.
