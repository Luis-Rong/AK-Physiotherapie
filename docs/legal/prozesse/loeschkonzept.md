# Löschkonzept (Art. 5 Abs. 1 lit. e, Art. 17 DSGVO; § 630f Abs. 3 BGB)

## Grundsatz

Behandlungsdokumentation wird **zehn Jahre nach Abschluss der Behandlung** aufbewahrt und
danach gelöscht. Vorher darf sie nicht gelöscht werden – auch nicht auf Wunsch des Patienten
(Art. 17 Abs. 3 lit. b DSGVO). Alles, was keine Behandlungsdokumentation ist, wird früher
gelöscht.

## Fristen je Datenkategorie

| Daten | Frist | Auslöser | Umsetzung |
|---|---|---|---|
| Trainingspläne, Trainingsprotokolle, Schmerzwerte, Assessments, Supplementpläne/-einnahmen, Profilversionen, hinterlegte Dateien, Einwilligungen | 10 Jahre | Abschluss der Behandlung (Praxis setzt „Behandlung abgeschlossen am") | jährlicher Löschlauf, Freigabe durch die Praxis |
| Audit-Log-Einträge zu diesen Daten | 10 Jahre, gemeinsam mit den Daten | wie oben | Löschlauf |
| Anmeldeprotokolle (`login_events`) | 12 Monate | Zeitablauf | monatlicher Lauf |
| Sitzungen (`session`) | 14 Tage nach Ablauf | Zeitablauf | better-auth räumt auf; Kontrolle im Lauf |
| Konto ohne jede Behandlungsdokumentation (z. B. nie eingeloggt) | sofort bei Widerruf/Wunsch | Praxis | Konto löschen |
| Konto **mit** Dokumentation nach Widerruf der Einwilligung | Zugang sofort sperren; Daten nach 10-Jahres-Frist | Widerruf | Sperre im Praxisbereich; Konto bleibt als Träger der Dokumentation |
| Backups | rollierend, 30 Tage | Zeitablauf | Backup-Skript (`docs/betrieb.md`); gelöschte Daten sind damit spätestens 30 Tage nach Löschlauf auch aus Backups verschwunden |
| Wissensinhalte, Übungen, Vorlagen (keine Patientendaten) | unbegrenzt | – | – |

## Verfahren

1. **Behandlungsende erfassen.** Die Praxis trägt im Patientenprofil das Datum
   „Behandlung abgeschlossen" ein. *(Feld noch zu bauen – bis dahin: Liste der Praxis.)*
2. **Jährlicher Löschlauf** (Januar): Skript listet alle Patienten, deren Behandlungsende
   mehr als zehn Jahre zurückliegt. Die Praxis gibt die Liste frei (Vier-Augen-Prinzip).
3. **Löschen** in dieser Reihenfolge: Dateien auf dem Speicher, dann Datenbankzeilen
   (die Append-only-Trigger werden für den Löschlauf mit der Owner-Rolle umgangen –
   niemals mit der App-Rolle), dann Konto. Der Lauf schreibt einen Eintrag ins Audit-Log
   („gelöscht nach Löschkonzept, Freigabe durch … am …") – das ist der Nachweis.
4. **Protokoll** des Laufs (Anzahl, Datum, Freigabe) zehn Jahre aufbewahren.

## Auskunft und Export vor der Löschung

Vor dem Löschlauf haben Betroffene Gelegenheit zum Export (Profil → „Meine Daten
herunterladen"). Die Praxis bewahrt ihren eigenen Export gemäß Kundenvertrag Ziffer 7.2 auf.

## Noch zu bauen

- Feld „Behandlung abgeschlossen am" im Praxisprofil.
- Skript `pnpm loeschlauf --stichtag …` mit Vorschau und Freigabe-Schritt.
- Automatische Bereinigung von `login_events` älter als 12 Monate.
