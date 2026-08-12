# ADR 0004: Bewusst außerhalb der MDR bleiben

- **Status:** akzeptiert
- **Datum:** 2026-08-12

## Kontext

Software, die reine Verwaltung und Dokumentation leistet, ist kein Medizinprodukt.
Sobald sie jedoch Informationen liefert, die zu **Entscheidungen für diagnostische oder
therapeutische Zwecke** herangezogen werden, greift **MDR Regel 11** – mindestens
Klasse I, in vielen Fällen IIa. Damit verbunden: QMS nach ISO 13485,
Konformitätsbewertung, ab Klasse IIa eine Benannte Stelle.

Das Feature, das diese Grenze überschreitet, ist typischerweise klein und wirkt harmlos
(„die App könnte den Plan doch automatisch anpassen"). Die Folgekosten sind es nicht.

## Entscheidung

Die Software **zeigt an, was der Therapeut selbst eingetragen hat.**

Nicht gebaut wird:

- Automatische Erstellung oder Anpassung von Trainings- oder Behandlungsplänen
- Therapieempfehlungen oder Vorschläge jeder Art
- Auswertung von Messwerten oder Verlaufsdaten mit therapeutischer Aussage
- Warnungen, Scores oder Ampeln mit medizinischer Bedeutung
- KI-Funktionen, die einen der obigen Punkte berühren

Unkritisch und erlaubt: Terminplanung, Stammdaten, Dokumentation, Anzeige von Plänen,
Erinnerungen an Termine, Abhaken von Übungen durch den Patienten, Freitextnotizen.

## Begründung

Der Nutzen der genannten Features steht in keinem Verhältnis zum regulatorischen
Aufwand. Der Wert für die Praxis liegt in der Zugänglichkeit der Pläne, nicht darin,
dass Software Therapieentscheidungen trifft.

## Konsequenzen

- Feature-Wünsche werden gegen diese Liste geprüft, bevor sie umgesetzt werden.
  Im Zweifel: nicht bauen, ADR schreiben, klären.
- Die Grenze ist bei Übungs-Feedback fließend. „Patient hakt Übung ab" ist Dokumentation.
  „System passt Wiederholungszahl an" wäre es nicht mehr.
- **Klarstellung Verlaufsdaten (z. B. Schmerzlevel):** Ein Diagramm der vom Patienten
  selbst eingegebenen Werte ist zulässig, solange die **Interpretation beim Physio
  bleibt** — reine Darstellung, keine Bewertung. Ein Trend-Pfeil, eine Ampel oder eine
  automatische Warnung wäre eine Bewertung durch die Software und fiele unter Regel 11.
- **Klarstellung Supplement-/Behandlungspläne:** Empfiehlt der Physio selbst und trägt
  er den Inhalt frei ein, ist die Anzeige davon unproblematisch — die Software
  generiert nichts. Der Inhalt selbst kann trotzdem anderes Recht berühren
  (Health-Claims-VO bei Produktaussagen); das ist eine Redaktions-, keine
  Software-Frage. Siehe `docs/legal/checkliste.md`.
- Gilt ausdrücklich auch für spätere KI-Ideen. Ein Assistent, der Behandlungsverläufe
  zusammenfasst und daraus etwas ableitet, fällt darunter.
- Diese Abgrenzung gehört in den Kundenvertrag, damit sie nicht als „vergessen"
  interpretiert wird.

## Verworfene Alternativen

**Klasse-I-Zertifizierung anstreben, um Spielraum zu haben** – verworfen. Auch Klasse I
bedeutet dauerhaft QMS, technische Dokumentation, Marktbeobachtung und
Vigilanz-Meldewege. Das ist eine laufende Verpflichtung, kein einmaliger Vorgang.
