# Tracking-Konzept

Stand: 2026-08-12 · Status: Entwurf, wird vor Phase 2 konkretisiert

Dieses Dokument hält fest, **welches Skript seit wann wo läuft**. Das ist kein
Selbstzweck: Wenn eine Aufsichtsbehörde oder Meta/Google nachfragt, ist diese Datei
die Antwort. Änderungen deshalb immer per PR, nie direkt in der Ads-Oberfläche
„mal eben".

Grundlage: [ADR 0003](../decisions/0003-kein-tracking-im-portal.md)

## Warum hier strengere Regeln gelten als auf einer normalen Website

Schon die Information „diese Person besucht eine Physiopraxis-Seite" kann ein
Gesundheitsdatum nach Art. 9 DSGVO sein – erst recht bei einer Landingpage zu einem
konkreten Beschwerdebild. Meta und Google verbieten in ihren eigenen Richtlinien die
Übermittlung sensibler Gesundheitsdaten und das Targeting auf Gesundheitszustände.
Ein Verstoß sperrt das Werbekonto **des Kunden**, nicht unseres.

## Regeln

| Bereich | Erlaubt |
|---|---|
| `apps/website` | Tracking **nur nach aktivem Consent**, granular abwählbar |
| Terminanfrage | Conversion nur generisch: `contact_submitted` |
| `apps/portal`, `apps/praxis` | **nichts** – kein Pixel, kein Analytics, keine CDN-Ressourcen |

**Verboten in Event-Namen, URL-Parametern und Custom Conversions:**
Behandlungsart, Diagnose, Beschwerdebild, Landingpage-Thema, alles personenbezogene.

Falsch: `conversion_beckenboden`, `lead_bandscheibe`, `?therapie=schmerz`
Richtig: `contact_submitted`

## Werberecht (HWG)

Für Werbetexte, nicht nur fürs Tracking:

- **Keine Heilversprechen.** „Wir behandeln Rückenschmerzen" ist zulässig.
  „Wir beseitigen Ihre Rückenschmerzen" ist abmahnfähig.
- **Keine Angstwerbung** („ohne Behandlung droht …").
- **Testimonials und Dankschreiben** sind nach § 11 HWG eingeschränkt. Eingebettete
  Google-Rezensionen sind üblich, Kampagnen mit Patientengeschichten sind heikel.
- **Vorher-Nachher-Darstellungen**: Vorsicht bei allem, was einen Behandlungserfolg
  bildlich behauptet.

Abmahnungen durch Wettbewerber sind in diesem Feld ein Geschäftsmodell. Texte werden
gegengelesen, bevor sie live gehen.

## Eingesetzte Werkzeuge

Noch nicht entschieden. Kandidaten und Prüfkriterien:

| Werkzeug | Zweck | Prüfen |
|---|---|---|
| — | Web-Analytics | EU-Hosting, AV-Vertrag, cookiefrei möglich? |
| — | Ads | Richtlinien zu Gesundheitsdaten, Consent-Kopplung |

Eintragen, sobald entschieden – mit Datum und Verweis auf den PR.

## Änderungshistorie

| Datum | Änderung | PR |
|---|---|---|
| 2026-08-12 | Dokument angelegt | — |
