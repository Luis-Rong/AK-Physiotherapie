# ADR 0011: Bau der automatischen Schmerzampel ohne vorherige anwaltliche Bestätigung

- **Status:** akzeptiert
- **Datum:** 2026-09-02
- **Beteiligte:** Luis, Claude

## Kontext

ADR 0007 hält die automatische Zuordnung des NPRS-Werts zu Grün/Gelb/Rot fest, macht
den Bau aber von einer fachanwaltlichen Bestätigung abhängig, ob das MDR Regel 11
auslöst. Diese Bestätigung liegt nicht vor. Für das erste Release standen zur Wahl:
sichere Variante zuerst (Zahl + Diagramm + statische Legende, Einfärbung hinter einem
Flag) oder Einfärbung sofort aktiv.

## Entscheidung

Die automatische Einfärbung wird gebaut und ist im ersten Release **aktiv**. Der
Anwaltsvorbehalt aus ADR 0007 gilt für den Bau nicht mehr; die anwaltliche Prüfung
bleibt als offener Punkt vor dem Produktivbetrieb mit echten Patienten.

Technisch bleibt ein Schalter (`PAIN_TRAFFIC_LIGHT=off`), der auf die sichere Variante
zurückfällt, ohne Datenmodell oder Oberfläche umzubauen.

## Begründung

Entscheidung von Luis: Die Ampel ist für den Patienten der spürbare Mehrwert der
digitalen Fassung; ihn bis zur Anwaltsantwort zurückzuhalten, wurde als unverhältnismäßig
eingestuft.

## Konsequenzen

- Das in ADR 0007 beschriebene MDR-Risiko wird nicht nur akzeptiert, sondern ohne
  vorherige Absicherung gebaut. Das muss dem Physio als Verantwortlichem im
  Kundenvertrag ausdrücklich benannt werden.
- Die anwaltliche Prüfung wandert von „vor dem Bau" nach „vor Produktivbetrieb" in
  `docs/legal/checkliste.md`. Fällt sie negativ aus, wird der Schalter umgelegt.
- Unverändert verboten bleiben Trendaussagen, Schwellwert-Meldungen an den Physio und
  jede weitere Auswertung (ADR 0004). Die Ampel färbt genau einen eingegebenen Wert ein.

## Verworfene Alternativen

**Sichere Variante zuerst, Flag standardmäßig aus**: die Empfehlung aus der Planung.
Verworfen zugunsten des Patientennutzens.
