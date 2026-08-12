# ADR 0003: Keine Drittanbieter im geschützten Bereich

- **Status:** akzeptiert
- **Datum:** 2026-08-12

## Kontext

Zum Projekt gehört laufendes Marketing mit Ads und Conversion-Tracking. Gleichzeitig
verarbeitet dasselbe Projekt Gesundheitsdaten.

Auf einer Gesundheitswebsite ist Tracking besonders heikel: Schon die Information
„diese Person besucht eine Physiopraxis-Seite" kann ein Gesundheitsdatum nach Art. 9
DSGVO sein – erst recht bei themenspezifischen Landingpages. Meta und Google verbieten
in ihren eigenen Richtlinien die Übermittlung sensibler Gesundheitsdaten; Verstöße
führen zu Account-Sperren, die den Kunden treffen.

Im eingeloggten Bereich wäre ein Drittanbieter-Skript zusätzlich eine Offenbarung an
einen nicht nach § 203 Abs. 3 StGB verpflichteten Dritten.

## Entscheidung

Strikte Trennung nach Bereich:

| Bereich | Regel |
|---|---|
| `apps/website` | Tracking nur nach aktivem Consent, granular, **keine themenspezifischen Event-Namen** |
| Terminanfrage | Conversion höchstens generisch („Kontakt abgesendet") – nie mit Behandlungsart, Diagnose oder Landingpage-Thema |
| `apps/portal`, `apps/praxis` | **Null Drittanbieter.** Kein Pixel, kein Analytics, keine CDN-Fonts, kein externes Error-Tracking |

Technisch erzwungen, nicht nur dokumentiert:

- Getrennte Deployments und getrennte Datenbanken für öffentlichen und geschützten Bereich
- Content-Security-Policy im geschützten Bereich erlaubt ausschließlich `self`
- Schriften, Icons und Skripte werden selbst ausgeliefert
- Kein gemeinsames Analytics-Modul zwischen `apps/website` und `apps/portal`

## Begründung

Die Trennung muss so gebaut sein, dass ein Fehler beim Kampagnen-Setup den geschützten
Bereich nicht erreichen kann. Auf Disziplin allein ist kein Verlass – genau dieser
Fehler passiert typischerweise unter Zeitdruck.

## Konsequenzen

- Kein durchgehendes Funnel-Tracking von Ad bis Behandlung. Das ist gewollt.
- Kampagnenerfolg wird über generische Conversions und Praxiskennzahlen gemessen,
  nicht über personenbezogene Zuordnung.
- Ein XSS auf der Marketingseite erreicht die Patientenakte nicht.
- Tracking-Konfiguration wird versioniert (`docs/marketing/`), damit später
  nachvollziehbar ist, seit wann welches Skript wo lief.

## Verworfene Alternativen

**Gemeinsames Consent-Management über alle Bereiche** – verworfen. Würde bedeuten, dass
im Portal überhaupt eine Tracking-Infrastruktur existiert, die man versehentlich
scharfschalten kann.
