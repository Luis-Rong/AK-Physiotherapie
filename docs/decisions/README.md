# Architecture Decision Records

Kurze Notizen darüber, **warum** etwas so gebaut ist. Fünf Zeilen reichen – wichtig ist,
dass die Entscheidung später nachvollziehbar ist. Bei einem Produkt, das Gesundheitsdaten
verarbeitet, ist das nicht nur Ordnungsliebe: Wenn in drei Jahren eine Aufsichtsbehörde
oder ein Gutachter fragt, warum ein Datum wie gespeichert wird, ist diese Ablage die
Antwort.

## Wann eine ADR schreiben?

- Eine Entscheidung ist schwer rückgängig zu machen (Datenmodell, Hosting, Auth)
- Sie hat rechtliche Auswirkungen (Aufbewahrung, Löschung, Drittanbieter)
- Ihr habt darüber diskutiert und euch für eine von mehreren Optionen entschieden
- Jemand wird sich in einem Jahr fragen „warum eigentlich so?"

## Wie?

`0000-template.md` kopieren, fortlaufend nummerieren, per PR einchecken.

Eine ADR wird **nicht bearbeitet, wenn sie überholt ist** – stattdessen eine neue ADR
schreiben und die alte auf `Status: abgelöst durch ADR-XXXX` setzen. Die Historie ist
der Punkt.

## Übersicht

| Nr | Titel | Status |
|---|---|---|
| [0001](0001-scope-kein-zugelassenes-pvs.md) | Ergänzendes System statt PVS-Ersatz | akzeptiert |
| [0002](0002-behandlungsdaten-append-only.md) | Behandlungsdaten append-only | akzeptiert |
| [0003](0003-kein-tracking-im-portal.md) | Keine Drittanbieter im geschützten Bereich | akzeptiert |
| [0004](0004-kein-medizinprodukt.md) | Bewusst außerhalb der MDR bleiben | akzeptiert |
| [0005](0005-zugangskonzept-portal.md) | Zugang zum Patientenportal: provisioniertes Konto statt Selbstregistrierung | akzeptiert |
| [0006](0006-echte-namen-im-portal.md) | Patientenkonten mit echtem Namen, kein Pseudonym | akzeptiert |
| [0007](0007-schmerzampel-mdr-abgrenzung.md) | Schmerzampel bleibt automatisiert, Formulierung wird abgeschwächt | akzeptiert |
| [0008](0008-tech-stack-reha-plattform.md) | Tech-Stack und Zuschnitt der Reha-Plattform | akzeptiert |
| [0009](0009-wissensinhalte-editierbar.md) | Wissensinhalte vom Physio im Admin editierbar | akzeptiert |
| [0010](0010-ruheumsatz-rechner.md) | Ruheumsatz-Rechner ohne Speicherung | akzeptiert |
| [0011](0011-schmerzampel-bau-freigegeben.md) | Schmerzampel-Bau ohne vorherige anwaltliche Bestätigung | akzeptiert |
| [0012](0012-geschaeftsrahmen-start.md) | Geschäftsrahmen für den Start: zwei Einzelgewerbe, Code bleibt bei uns, nur AK Physio | akzeptiert |
| [0013](0013-krs-stufen-nur-anzeige.md) | KRS-Stufen bleiben reine Anzeige | akzeptiert |
