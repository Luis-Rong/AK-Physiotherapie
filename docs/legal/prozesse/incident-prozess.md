# Incident-Prozess: Verletzung des Schutzes personenbezogener Daten

Ziel: Die 72-Stunden-Frist nach Art. 33 DSGVO einhalten, ohne im Ernstfall zu überlegen,
wer was tut. Gilt für Staging (nur Testdaten – dann verkürzt) und Produktion.

## Rollen

| Rolle | Wer | Erreichbar |
|---|---|---|
| Verantwortlicher (meldet an die Behörde) | Praxis, [Alexander Koetter] | [Telefon, E-Mail] |
| Auftragsverarbeiter (meldet an die Praxis) | [Roko Nachname] | [Telefon, E-Mail] |
| Technik (analysiert, stoppt, sichert) | Luis Rongstock | [Telefon, E-Mail] |
| Datenschutzbeauftragter der Praxis (falls bestellt) | [Name] | [Kontakt] |
| Aufsichtsbehörde | Der Hessische Beauftragte für Datenschutz und Informationsfreiheit (Praxis in Frankfurt) | Meldeformular online |

## Was ein Vorfall ist

Alles, wobei Patientendaten unbefugt gelesen, verändert, gelöscht oder unerreichbar geworden
sein **könnten** – auch ein Verdacht zählt. Beispiele: fremder Login, Server kompromittiert,
Backup verloren, Datei an falschen Patienten hinterlegt, Laptop mit Zugang gestohlen, Mail
mit Gesundheitsdaten versehentlich verschickt, Ransomware.

## Ablauf (Uhr läuft ab Kenntnis)

**Stunde 0 – Eindämmen (Technik).**
1. Zugang schließen: betroffene Sitzungen widerrufen (Praxisbereich → Zugang), bei Verdacht
   auf Serverkompromittierung Server vom Netz, Passwörter und `BETTER_AUTH_SECRET` rotieren.
2. Nichts löschen. Logs sichern: `audit_log`, `login_events`, Caddy-Logs, Docker-Logs, Zeitpunkt
   notieren.
3. Roko informieren (Telefon, nicht nur Mail).

**Stunde 0–24 – Melden an die Praxis (Roko).**
4. Spätestens 24 Stunden nach Kenntnis an die Praxis: was, wann, welche Daten, wie viele
   Betroffene (geschätzt), was schon getan wurde, Ansprechpartner. Vorlage unten.

**Stunde 24–72 – Bewerten und melden (Praxis).**
5. Praxis entscheidet mit DSB/Technik: Risiko für Betroffene? Bei Gesundheitsdaten fast
   immer **ja** → Meldung an die Aufsichtsbehörde innerhalb von 72 Stunden ab Kenntnis der
   Praxis. Unvollständig melden ist erlaubt, Nachreichen ist vorgesehen (Art. 33 Abs. 4).
6. **Hohes Risiko** (Gesundheitsdaten in fremder Hand): Betroffene benachrichtigen (Art. 34)
   – in klarer Sprache, mit Kontakt. Vorlage unten.

**Danach – Aufarbeiten.**
7. Ursache beheben, Wiederherstellung aus Backup falls nötig, Restore protokollieren.
8. Vorfall dokumentieren (Art. 33 Abs. 5): Hergang, Auswirkungen, Maßnahmen – auch wenn
   nicht gemeldet wurde, mit Begründung.
9. Nachbesprechung innerhalb von zwei Wochen: Was ändern wir? Als ADR festhalten.

## Vorlage: Meldung Auftragsverarbeiter → Praxis

```
Betreff: Datenschutzvorfall Reha-Plattform – [Datum, Uhrzeit Kenntnis]
1. Was ist passiert:
2. Wann bemerkt, wann vermutlich begonnen:
3. Betroffene Daten (Kategorien) und Personen (Anzahl, geschätzt):
4. Bereits getroffene Maßnahmen:
5. Empfohlene nächste Schritte:
6. Ansprechpartner Technik:
```

## Vorlage: Information Betroffene (Praxis)

```
Sehr geehrte/r [Name],
am [Datum] ist es in unserem Reha-Tagebuch zu einem Sicherheitsvorfall gekommen.
Betroffen waren möglicherweise: [Datenkategorien]. Wir haben [Maßnahmen] ergriffen.
Was Sie tun können: [z. B. Passwort ändern, auf ungewöhnliche Kontakte achten].
Fragen beantwortet: [Name, Telefon, E-Mail]. Die Aufsichtsbehörde wurde informiert.
```

## Übung

Einmal jährlich trocken durchspielen (Szenario: verlorener Laptop mit Praxiszugang) und das
Datum hier eintragen: [Datum].
