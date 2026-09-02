# ADR 0010: Ruheumsatz-Rechner als unverbindliche Information ohne Speicherung

- **Status:** akzeptiert
- **Datum:** 2026-09-02
- **Beteiligte:** Luis, Claude

## Kontext

Das Tagebuch erklärt den Ruheumsatz und nennt die Mifflin-St-Jeor-Formel. Ein Rechner
im Portal braucht Alter, Größe, Gewicht (ADR 0006: nur speichern, wenn zwingend nötig)
und liefert im Reha-Kontext einen Wert, der nahe an MDR Regel 11 liegt
(`portal-konzept.md` Abschnitt 5.3 empfahl: Physio trägt Zielwerte ein, kein Rechner).

## Entscheidung

Der Rechner steht Patienten zur Verfügung, aber:

- nur als Baustein im Wissenskapitel Ernährung, nicht im Dashboard oder Plan,
- rechnet ausschließlich im Browser; **keine Eingabe und kein Ergebnis wird
  gespeichert** oder an den Server geschickt,
- kein Bezug zum Patientenprofil, zum Plan oder zu den vom Physio eingetragenen
  Zielwerten,
- mit festem, nicht editierbarem Disclaimer: ungefährer Orientierungswert, kein
  therapeutischer Wert, individuelle Anpassung durch Arzt oder Ernährungsberater.

Die verbindlichen Kalorien- und Proteinziele trägt weiterhin der Physio im Profil ein.

## Begründung

Der Physio wollte die Funktion aus dem PDF erhalten; Luis hat entschieden, sie
Patienten zugänglich zu machen. Ohne Speicherung und ohne Verknüpfung mit
Behandlungsdaten ist der Rechner ein allgemeiner Ernährungsrechner, wie er frei im Netz
steht, und keine für die einzelne Person bestimmte therapeutische Aussage.

## Konsequenzen

- Keine Körperdaten in der Datenbank; ADR 0006 bleibt eingehalten.
- Der Disclaimer ist Teil des Codes, nicht des editierbaren Inhalts.
- Sollte der Rechner je Werte ins Profil übernehmen oder der Plan darauf reagieren,
  ist das eine neue Entscheidung mit MDR-Prüfung.

## Verworfene Alternativen

- **Kein Rechner** (die sicherste Variante): verworfen, Nutzen für den Patienten.
- **Rechner nur im Admin**: verworfen, der Patient soll es selbst nachvollziehen können.
