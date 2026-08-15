# ADR 0006: Patientenkonten mit echtem Namen, kein Pseudonym

- **Status:** akzeptiert
- **Datum:** 2026-08-15

## Kontext

Für Datenminimierung wurde vorgeschlagen, Patientenkonten im Portal über eine Kennung
(Pseudonym/UUID) statt über den echten Namen zu führen — die Zuordnung zur Person läge
dann nur beim Physio bzw. in thevea. Das senkt den Schaden bei einem Datenleck und
verkleinert den Umfang der Datenschutz-Folgenabschätzung (`docs/portal-konzept.md`
Abschnitt 4.5).

Dagegen steht: Das Portal ist kein einmaliges Formular, sondern eine Anwendung, die ein
Patient über Wochen und Monate regelmäßig nutzt — Trainingspläne, Schmerztagebuch,
Supplement-Plan. Anonyme oder pseudonyme Konten fühlen sich für diesen Anwendungsfall
unpersönlich an.

## Entscheidung

Das Patientenkonto trägt den **echten Namen** des Patienten (Vor- und Nachname), sichtbar
zur Anrede und Personalisierung der Oberfläche.

Das gilt ausdrücklich nur für den Namen. Weitere Stammdaten (Geburtsdatum, Größe,
Gewicht, Adresse) werden weiterhin nur gespeichert, wenn ein konkretes Feature sie
zwingend braucht — siehe dazu ADR 0007 zur Frage, ob Zielwerte im Portal berechnet oder
vom Physio eingetragen werden. Datensparsamkeit bleibt Leitprinzip, nur nicht beim Namen
selbst.

## Begründung

Personalisierung ist bei einer wiederkehrend genutzten Anwendung ein echter Wert für
Vertrauen und Akzeptanz beim Patienten. Der Physio kennt seine Patienten persönlich; eine
Pseudonymisierung würde in der täglichen Arbeit (Support, Rückfragen, Zuordnung) nur
Reibung erzeugen, ohne dass ihr als Verantwortlicher dadurch tatsächlich weniger wisst —
die Zuordnung liegt ohnehin bei ihm.

## Konsequenzen

- Ein Datenleck ist bei echten Namen **direkt** einer Person zuordenbar — der
  Dämpfungseffekt, den eine Pseudonymkennung geboten hätte, entfällt. Das erhöht die
  Anforderungen an technische und organisatorische Maßnahmen (Verschlüsselung at rest,
  Zugriffskontrolle, Protokollierung) gegenüber dem ursprünglichen Vorschlag.
- Name plus Gesundheitsdaten (Trainingsplan, Schmerzwerte) fällt vollständig und
  unmittelbar unter Art. 9 DSGVO — das war mit Pseudonym nicht anders, ist jetzt aber
  ohne die zusätzliche Hürde der Rückverknüpfung.
- Die Datenschutz-Folgenabschätzung muss von echten Namen ausgehen, nicht von einer
  Kennung. Das ist keine neue Pflicht, verändert aber die Risikobewertung gegenüber dem
  in `docs/portal-konzept.md` skizzierten Modell.
- Das Löschkonzept (10 Jahre nach § 630f BGB) muss mit echten Namen umgesetzt werden —
  kein Vorteil aus „nach Ablauf einfach die Zuordnungstabelle kappen".

## Verworfene Alternativen

**Pseudonymisierte Kennung (UUID) mit Zuordnung nur beim Physio** — der ursprüngliche
Vorschlag aus `docs/portal-konzept.md` Abschnitt 4.5. Bewusst nicht umgesetzt zugunsten
von Personalisierung und Praktikabilität im Alltag.
