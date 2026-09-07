# ADR 0013: KRS-Stufen bleiben reine Anzeige

- **Status:** akzeptiert
- **Datum:** 2026-09-07
- **Beteiligte:** Luis, Claude

## Entscheidung

Die Software zeigt die KRS-Stufe an, die der Physio im Patientenprofil eingetragen hat –
sonst nichts. Sie prüft nicht, ob Kriterien für die nächste Stufe erfüllt sind, schlägt
keinen Wechsel vor und leitet aus Tagebuch- oder Messwerten keine Stufe ab.

## Begründung

Eine Prüfung „Kriterien erfüllt?" wäre eine Auswertung mit therapeutischer Aussage und
damit dieselbe MDR-Frage wie bei der Schmerzampel (ADR 0004, 0007). Anders als die Ampel
hat sie für den Patienten keinen unmittelbaren Nutzen, der das Risiko rechtfertigt. Die
Einstufung bleibt Fachentscheidung der Praxis.

## Konsequenzen

Wissensinhalte zu den Stufen (Tabelle, Treppe) dürfen erklären, was eine Stufe bedeutet
und welche Kriterien die Praxis anlegt – als Text, nicht als Abgleich mit Patientendaten.
