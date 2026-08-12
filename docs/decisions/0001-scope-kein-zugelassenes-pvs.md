# ADR 0001: Ergänzendes System statt PVS-Ersatz

- **Status:** akzeptiert
- **Datum:** 2026-08-12

## Kontext

Ursprüngliche Idee war ein eigenes Praxisverwaltungssystem mit digitaler Patientenakte.
Ein PVS berührt in Deutschland aber mehrere zulassungspflichtige Bereiche:

- **Telematikinfrastruktur (TI):** Anschlusspflicht für Heilmittelerbringer ab
  **01.10.2027** (verschoben vom 01.01.2026). TI-Anwendungen wie ePA, KIM und die
  elektronische Heilmittelverordnung (eVO, frühestens 2027, realistisch 2028) setzen
  eine **gematik-Zulassung des Produkts** voraus – mit Sicherheitsgutachten,
  Konnektor/TI-Gateway und eHBA/SMC-B-Kartenintegration.
- **Abrechnung nach § 302 SGB V:** eigener Zertifizierungskosmos mit technischen
  Anlagen, Signaturverfahren und Datenaustausch mit den Kassen.

Beides ist für ein Zwei-Personen-Team nicht erreichbar.

## Entscheidung

Wir bauen ein **ergänzendes** System: Termine, Stammdaten, Behandlungsdokumentation,
Trainingspläne und Patientenportal.

Ausdrücklich **nicht** Teil des Produkts:

- Ersatz des zugelassenen PVS
- TI-Anbindung (ePA, KIM, eVerordnung, e-Rezept)
- Kassenabrechnung nach § 302 SGB V
- Ersatz der Papier-Verordnung (Muster 13) – das Original bleibt beim Kunden
  aufbewahrungspflichtig

## Begründung

Die regulierten Kanäle bleiben beim bestehenden PVS bzw. beim Abrechnungsdienstleister.
Wir bauen den patientenzugewandten Teil, für den es keine Zulassungspflicht gibt und in
dem bestehende Systeme typischerweise schwach sind.

## Konsequenzen

- **Positiv:** kein Zulassungsverfahren, überschaubares Haftungsprofil, schnell lieferbar.
- **Negativ:** Verordnungsdaten müssen manuell erfasst oder importiert werden. Doppelte
  Datenpflege ist möglich, solange kein Exportweg aus dem bestehenden PVS besteht.
- **Offen:** Welches PVS der Kunde einsetzt und ob es ein Exportformat anbietet
  (CSV, GDT, BDT). Klären, bevor Phase 3 beginnt – es entscheidet über einmalige
  Stammdatenübernahme vs. dauerhafte Doppelpflege.
- Diese Negativliste gehört wörtlich in den Kundenvertrag (Leistungsabgrenzung).

## Verworfene Alternativen

**Vollwertiges PVS mit TI-Anbindung** – verworfen. Zulassungsaufwand und laufende
Konformitätspflichten stehen in keinem Verhältnis zu einem Einzelkunden.
