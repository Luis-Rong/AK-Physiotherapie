# Vereinbarung zur Auftragsverarbeitung nach Art. 28 DSGVO (Entwurf)

**Kein Rechtsrat – Entwurf zum Ausfüllen, siehe [README](README.md).** Orientiert an den
Standardvertragsklauseln der EU-Kommission zu Art. 28 (Durchführungsbeschluss (EU) 2021/915),
gekürzt auf das, was hier gebraucht wird.

## Variante A: Praxis ↔ Dienstleister · Variante B: Dienstleister ↔ Entwickler

Dasselbe Dokument in zwei Ausfertigungen. In Variante B ist „Verantwortlicher" der
Dienstleister (Roko) als Auftragsverarbeiter der Praxis, und „Auftragsverarbeiter" ist der
Entwickler (Luis) als Unterauftragsverarbeiter nach Art. 28 Abs. 4. Die Pflichten sind
identisch; Weisungen der Praxis werden in Variante B durchgereicht.

| | Variante A | Variante B |
|---|---|---|
| Verantwortlicher | [Praxis AK Physiotherapie] | [Roko Nachname] (im Auftrag der Praxis) |
| Auftragsverarbeiter | [Roko Nachname] | [Luis Rongstock] |

## 1 Gegenstand und Dauer

Bereitstellung und Betrieb der Reha-Plattform (Kundenvertrag vom [Datum]). Dauer wie der
Hauptvertrag.

## 2 Art und Zweck, Datenkategorien, Betroffene

- **Zweck:** Führung eines digitalen Rehabilitationstagebuchs für Patientinnen und Patienten
  der Praxis; Kontoverwaltung; Betrieb der Infrastruktur.
- **Datenkategorien:** Stammdaten (Name, E-Mail), Zugangsdaten (Passwort-Hash, 2FA-Geheimnis
  verschlüsselt), **Gesundheitsdaten (Art. 9)**: Trainingspläne, Trainingsprotokolle,
  Schmerzwerte, Assessments, Supplementpläne, Reha-Stufe, hinterlegte Dateien; Einwilligungen;
  Protokolldaten (Audit-Log, Anmeldeversuche mit IP-Adresse).
- **Betroffene:** Patientinnen und Patienten der Praxis; Praxispersonal mit Zugang.

## 3 Weisungen

Der Auftragsverarbeiter verarbeitet nur auf dokumentierte Weisung (Textform). Hält er eine
Weisung für rechtswidrig, teilt er das unverzüglich mit. Weisungsberechtigt: [Name Praxis /
in Variante B: Roko]. Weisungsempfänger: [Roko / in Variante B: Luis].

## 4 Vertraulichkeit

Alle eingesetzten Personen sind zur Vertraulichkeit verpflichtet – nach DSGVO **und** nach
§ 203 Abs. 4 StGB (gesonderte Verpflichtung, Anlage). Der Auftragsverarbeiter hält eine
Liste dieser Personen bereit.

## 5 Technische und organisatorische Maßnahmen (TOM)

Stand: siehe `docs/legal/prozesse/tom.md`. Kern:

- Hosting ausschließlich in Rechenzentren in Deutschland; Transportverschlüsselung (TLS);
  verschlüsselte Backups; Zugriff nur per SSH-Schlüssel.
- Zugangskontrolle: personengebundene Konten, Zwei-Faktor-Pflicht für Praxiszugänge,
  Anmeldeprotokoll, Sperrmöglichkeit.
- Integrität: Behandlungsdaten append-only auf Datenbankebene, Audit-Log für jeden
  Schreibvorgang.
- Trennung: Produktionsdaten nur in Produktion; Entwicklung und Tests ausschließlich mit
  synthetischen Daten.
- Keine Drittanbieterskripte, kein Tracking im geschützten Bereich.

Änderungen der TOM nur bei mindestens gleichwertigem Schutzniveau.

## 6 Unterauftragsverarbeiter

Genehmigt (Anlage, Stand [Datum]):

| Wer | Was | Wo | AV-Vertrag |
|---|---|---|---|
| [Luis Rongstock] (nur Variante A) | Entwicklung, Betrieb | Deutschland | Variante B |
| Hetzner Online GmbH, Gunzenhausen | Server, Backup-Speicher | Deutschland | Hetzner-AV im Kundenkonto |
| [Mailversender] | Benachrichtigungs-Mails ohne Gesundheitsdaten | EU | [Link] |

Neue Unterauftragsverarbeiter werden mit vier Wochen Vorlauf angezeigt; Widerspruch aus
wichtigem Grund möglich. Der Auftragsverarbeiter überbindet seine Pflichten aus dieser
Vereinbarung auf jeden Unterauftragsverarbeiter, einschließlich der § 203-Verpflichtung.

## 7 Unterstützung des Verantwortlichen

Betroffenenrechte (Auskunft, Berichtigung, Löschung, Übertragbarkeit): technische Umsetzung
durch den Auftragsverarbeiter, u. a. Datenexport je Patient im Portal. Zuarbeit zu
Datenschutz-Folgenabschätzung und Verzeichnis der Verarbeitungstätigkeiten.

## 8 Meldung von Verletzungen

Der Auftragsverarbeiter meldet jede Verletzung des Schutzes personenbezogener Daten
**unverzüglich, spätestens innerhalb von 24 Stunden** nach Kenntnis an [Kontakt Praxis],
mit den Angaben nach Art. 33 Abs. 3. Ablauf: `docs/legal/prozesse/incident-prozess.md`.

## 9 Löschung und Rückgabe

Nach Ende des Hauptvertrags: Export an den Verantwortlichen, danach Löschung aller Daten
einschließlich Backups innerhalb von [30] Tagen, schriftliche Bestätigung. Aufbewahrung
nach § 630f BGB ist Sache des Verantwortlichen.

## 10 Nachweise und Kontrollen

Der Auftragsverarbeiter stellt Nachweise bereit (TOM-Dokument, Audit-Log-Auszüge,
Hetzner-Zertifikate). Kontrollen vor Ort nach Ankündigung, höchstens jährlich, außer bei
einem Vorfall.

## 11 Haftung

Nach Art. 82 DSGVO. Im Innenverhältnis haftet jede Partei für die Verstöße, die sie zu
vertreten hat.

Ort, Datum, Unterschriften: __________________ / __________________

Anlagen: TOM · Unterauftragsverarbeiter · Verschwiegenheitsverpflichtung § 203
