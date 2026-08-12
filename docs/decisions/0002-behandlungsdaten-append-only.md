# ADR 0002: Behandlungsdaten werden append-only gespeichert

- **Status:** akzeptiert
- **Datum:** 2026-08-12

## Kontext

§ 630f BGB verpflichtet zur Patientendokumentation und verlangt, dass **nachträgliche
Änderungen als solche erkennbar bleiben** und der **ursprüngliche Inhalt weiterhin
lesbar** ist. Die Aufbewahrungsfrist beträgt 10 Jahre.

Ein normales relationales Datenmodell mit `UPDATE` und `DELETE` erfüllt das nicht.
Diese Anforderung nachträglich einzuziehen bedeutet eine Migration durch das gesamte
Datenmodell – deshalb wird sie von Anfang an festgelegt.

## Entscheidung

Für Behandlungsdokumentation, Verordnungsbezüge und Trainingsplan-Versionen gilt:

- **Kein `UPDATE`, kein `DELETE`.** Nur Einfügen.
- Eine Korrektur entsteht als **neue Version** mit Verweis auf die Vorgängerversion.
  Die alte Version bleibt abrufbar.
- Jeder Schreibvorgang erzeugt einen **Audit-Log-Eintrag**: Nutzer, Zeitpunkt, Aktion,
  betroffener Datensatz, Herkunft.
- Der Audit-Log ist selbst append-only und für die Anwendung nicht änderbar.
- „Löschen" in der Oberfläche setzt eine Markierung; die physische Löschung erfolgt
  ausschließlich über das Löschkonzept nach Ablauf der Aufbewahrungsfrist.

Nicht betroffen: Stammdaten, Termine, Einstellungen. Dort ist normales Ändern zulässig
(Stammdatenänderungen werden aber ebenfalls protokolliert).

## Begründung

Gesetzliche Pflicht. Zusätzlich praktisch: Bei einem Streit über den Behandlungsverlauf
ist eine lückenlose, unveränderliche Dokumentation das entscheidende Beweismittel für
den Therapeuten.

## Konsequenzen

- Das Datenmodell braucht von Beginn an Versions- und Gültigkeitsfelder.
- Datenbank-Rechte werden so gesetzt, dass der Anwendungs-Nutzer auf den betroffenen
  Tabellen kein `UPDATE`/`DELETE` besitzt – die Regel wird technisch erzwungen, nicht
  nur per Konvention. Der Schutz muss auch dann greifen, wenn Code generiert wird.
- Das Recht auf Löschung (Art. 17 DSGVO) tritt hinter die gesetzliche
  Aufbewahrungspflicht zurück (Art. 17 Abs. 3 lit. b). Das gehört in die
  Datenschutzerklärung.
- Berichtigungen nach Art. 16 DSGVO werden als neue Version umgesetzt, nicht als
  Überschreiben.
- Speicherbedarf und Query-Komplexität steigen. Bei dieser Größenordnung irrelevant.

## Verworfene Alternativen

**Normales CRUD mit separater Historientabelle per Trigger** – funktioniert technisch,
aber die Historie ist dann nur so gut wie der Trigger. Ein vergessener Trigger auf einer
neuen Tabelle fällt niemandem auf, bis es zu spät ist.
