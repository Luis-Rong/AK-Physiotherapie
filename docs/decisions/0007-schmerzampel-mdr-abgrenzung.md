# ADR 0007: Schmerzampel bleibt automatisiert, Formulierung wird abgeschwächt

- **Status:** akzeptiert
- **Datum:** 2026-08-15

## Kontext

Das Rehabilitationstagebuch des Physios enthält eine Schmerzampel auf Basis der
NPRS-Skala: Grün (0–3) „Übung wie geplant fortführen", Gelb (4–5) „Verlauf beobachten,
ggf. reduzieren", Rot (6+) „Übung sofort abbrechen oder deutlich reduzieren". Auf Papier
trägt der Patient den Wert ein und wendet die Regel selbst an.

`docs/portal-konzept.md` Abschnitt 5.1 hat die Grenze aus ADR 0004 auf diesen Fall
angewendet: Sobald die Software den eingegebenen Wert selbst entgegennimmt und daraus
automatisch eine Farbe oder eine Handlungsanweisung erzeugt, bewertet sie einen Messwert
mit therapeutischer Konsequenz — das fällt unter MDR Regel 11.

## Entscheidung

Die Ampel bleibt im Kern erhalten: Der eingegebene Schmerzwert wird automatisch der
passenden Stufe (Grün/Gelb/Rot) zugeordnet und angezeigt. Die Formulierung der Stufen
wird abgeschwächt, damit sie als Orientierung und nicht als direkte medizinische
Anweisung erscheint — etwa „Beobachten, ob der Schmerz bis zum nächsten Morgen wieder
abklingt" statt „Übung sofort abbrechen".

## Begründung

Der Ausschlag über Farbe und erklärenden Text ist für den Patienten der eigentliche
Nutzen der digitalen Fassung gegenüber dem Papier — ihn ganz zu entfernen, würde die
Funktion entwerten. Eine zurückhaltendere Formulierung reduziert zumindest den Eindruck
einer direkten ärztlichen Anweisung durch die Software.

## Konsequenzen — einschließlich des unbequemen Teils

**Diese Entscheidung löst die MDR-Frage aus ADR 0004 nicht auf, sie verschiebt sie nur
graduell.** Nach der Einstufungslogik der MDCG-2019-11-Leitlinie hängt die Klassifizierung
als Medizinprodukt-Software nicht in erster Linie an der Wortwahl der Ausgabe, sondern
daran, ob die Software Patientendaten verarbeitet und daraus eine **für die einzelne
Person bestimmte Interpretation** erzeugt. Eine automatische Zuordnung des eingegebenen
Schmerzwerts zu Grün/Gelb/Rot ist genau das — unabhängig davon, ob der begleitende Text
sanft oder direktiv formuliert ist. Die Abschwächung senkt das Haftungsrisiko und den
Eindruck ärztlichen Rats, ändert aber vermutlich nichts an der regulatorischen Einstufung
selbst.

Das ist als bewusst akzeptiertes Risiko dokumentiert, nicht als gelöstes Problem. Daraus
folgt:

- **Vor dem Bau dieses Features:** fachanwaltliche Bestätigung einholen, ob die
  automatische Zuordnung in dieser Form MDR Regel 11 auslöst, und wenn ja, ob eine
  Selbsteinstufung als Klasse I mit vertretbarem Aufwand machbar ist oder ob das Feature
  auf reine Anzeige zurückgestuft werden muss.
- Fällt die Prüfung negativ aus, bleibt als Rückfalloption die in `portal-konzept.md`
  Abschnitt 5.1 beschriebene Variante: Der Wert wird nur als Zahl/Diagramm angezeigt, die
  Ampel-Erklärung steht als statischer Text daneben (wie auf dem Papierbogen), ohne dass
  die Software selbst zuordnet.
- Dieselbe Abwägung gilt für das KRS-Stufensystem im Tagebuch, sobald es digitalisiert
  wird — dort wurde noch keine Entscheidung getroffen.
- Der Ruheumsatz-Rechner (`portal-konzept.md` Abschnitt 5.3) ist von diesem ADR nicht
  erfasst; dort bleibt die Empfehlung, dass der Physio Zielwerte einträgt statt die
  Software sie berechnet.

## Verworfene Alternativen

**Ampel vollständig entfernen, nur Rohwert und Diagramm anzeigen** — die aus rein
regulatorischer Sicht sicherste Option. Zurückgestellt, weil sie den praktischen Nutzen
der Digitalisierung für den Patienten spürbar mindert; bleibt die Rückfalloption, falls
die anwaltliche Prüfung die automatische Zuordnung nicht trägt.
