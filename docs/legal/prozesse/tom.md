# Technische und organisatorische Maßnahmen (Art. 32 DSGVO)

Anlage zum AV-Vertrag. Stand: 2026-09-07. Nur Maßnahmen, die tatsächlich umgesetzt sind
oder mit Datum als offen markiert.

## Vertraulichkeit

- **Zutritt/Zugang zum Server:** Hetzner-Rechenzentrum in Deutschland (ISO 27001 laut
  Hetzner); Serverzugang nur per SSH-Schlüssel, kein Passwort-Login; Firewall nur 22/80/443.
- **Zugang zur Anwendung:** personengebundene Konten; Passwörter mindestens 10 Zeichen,
  Hash serverseitig; temporäre Passwörter mit erzwungenem Wechsel und 7-Tage-Ablauf;
  **Zwei-Faktor-Pflicht** für alle Praxiszugänge; Sperre und Sitzungswiderruf durch die Praxis.
- **Zugriff auf Daten:** Rollentrennung Patient/Praxis in der Anwendung; Patienten sehen nur
  eigene Daten; Datenbankrolle der Anwendung ohne Änderungs- und Löschrecht auf
  Behandlungsdaten; Dateien nur über authentifizierte Endpunkte, keine Dauerlinks.
- **Trennung:** Produktion, Staging und Entwicklung getrennt; außerhalb der Produktion
  ausschließlich synthetische Daten (Regel 1).
- **Verschlüsselung:** TLS für alle Verbindungen (Caddy, automatische Zertifikate); Backups
  verschlüsselt; 2FA-Geheimnisse in der Datenbank verschlüsselt.
- **Keine Drittanbieter** im geschützten Bereich: keine Fonts, Skripte, Analytics von außen;
  Content-Security-Policy erlaubt nur den eigenen Ursprung.

## Integrität

- **Append-only:** Behandlungsdaten können auf Datenbankebene nicht geändert oder gelöscht
  werden (Trigger + fehlende Rechte); Korrekturen sind neue Versionen mit Verweis.
- **Audit-Log:** jeder Schreibvorgang mit Person, Zeit, IP und Gerät; nur lesbar, Schreiben
  ausschließlich durch Datenbank-Trigger.
- **Anmeldeprotokoll:** erfolgreiche und fehlgeschlagene Logins; Rate-Limits gegen
  Ausprobieren; Sperre nach fünf fehlgeschlagenen 2FA-Versuchen.
- **Uploads:** Typprüfung anhand Dateiinhalt (Magic Bytes), Größenlimit, Prüfsumme.

## Verfügbarkeit und Belastbarkeit

- Tägliches verschlüsseltes Backup auf getrennten Speicher (Hetzner Storage Box), 30 Tage
  rollierend.
- Wiederherstellungstest **vierteljährlich**, protokolliert in `docs/betrieb.md`.
  *Erster Test: offen.*
- Container-Betrieb mit automatischem Neustart; Reaktionszeit ein Werktag.

## Verfahren zur Überprüfung

- Automatisierte Tests bei jeder Änderung (Unit, Datenbank-Append-only, Ende-zu-Ende
  inklusive „keine externen Requests").
- Vier-Augen-Prinzip: jede Änderung als Pull Request, vom jeweils anderen geprüft.
- Architekturentscheidungen dokumentiert (ADR 0001–0013).
- Incident-Prozess: `incident-prozess.md`, jährliche Übung.

## Organisatorisch

- Beide Betreiber schriftlich nach § 203 Abs. 4 StGB und Art. 28/29 DSGVO verpflichtet.
- Zugangsdaten werden persönlich übergeben (Übergabeblatt), nie per Mail oder Messenger.
- Benachrichtigungs-Mails enthalten keine Gesundheitsdaten (nur „es gibt etwas Neues").

## Offen (mit Datum)

- Erster Restore-Test: [Datum]
- Staging-Deploy und Produktionsaufbau: [Datum]
- Löschlauf-Skript: siehe `loeschkonzept.md`
