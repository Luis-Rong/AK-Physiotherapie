# ADR 0005: Zugang zum Patientenportal — provisioniertes Konto statt Selbstregistrierung

- **Status:** akzeptiert
- **Datum:** 2026-08-15

## Kontext

Ein dauerhafter, ungeprüfter Link auf Gesundheitsdaten ist gegenüber Art. 32 DSGVO schwer
zu rechtfertigen (kein Widerruf, keine Zuordnung zu einer Person, Verweildauer im
Postfach, Streuung über mehrere Geräte — siehe `docs/portal-konzept.md` Abschnitt 3).
Gleichzeitig soll die Hürde für den Patienten niedrig bleiben: keine Online-Identitäts-
prüfung wie bei einer Bank, denn der Physio kennt seine Patienten bereits persönlich.

Diskutiert wurde ein reiner Magic Link (einmalig gültig, automatischer Login ohne
Passwort). Entschieden wurde stattdessen ein Modell mit Link **und** Passwort, weil ein
zweites, getrennt übermitteltes Geheimnis das Risiko eines einzelnen abgefangenen Kanals
(z. B. eines mitgelesenen E-Mail-Postfachs) deutlich senkt.

## Entscheidung

- **Keine Selbstregistrierung.** Der Physio legt das Konto im Portal für den Patienten
  an — analog zu seiner Rolle bei thevea, wo er ebenfalls Zugänge verwaltet
  (siehe `docs/pvs-thevea.md`).
- Beim Anlegen erhält das Konto ein **temporäres Passwort**. Der Link führt zur normalen
  Login-Seite des Portals, nicht direkt in eine eingeloggte Sitzung.
- **Die erste Anmeldung erzwingt eine Passwortänderung.** Das temporäre Passwort wird
  nach der ersten erfolgreichen Anmeldung oder nach Ablauf einer kurzen Frist
  (Empfehlung: 7 Tage) ungültig.
- **Übergabe des temporären Passworts getrennt vom Link**, wo praktikabel: mündlich oder
  auf Papier bei einem Praxistermin, alternativ per SMS — nicht im selben Kanal wie ein
  automatisch verschickter Link.
- **Der Physio verwaltet die Zugänge**: Konto anlegen, temporäres Passwort neu vergeben
  (Reset), Konto sperren oder deaktivieren (z. B. bei Behandlungsende), Login-Historie
  einsehen. Das läuft über einen eigenen Admin-Bereich im Portal, getrennt vom
  Patienten-Login.
- Nach der ersten Anmeldung: normale Passwort-Sitzung, keine Magic Links mehr im
  laufenden Betrieb.

## Begründung

Der Physio identifiziert den Patienten ohnehin persönlich, bevor er das Konto anlegt —
das löst die Identitätsprüfung nebenbei, ohne ein separates Verfahren dafür zu bauen.
Ein Passwort als zweites Geheimnis, getrennt vom Link übermittelt, macht aus dem
ursprünglich kritisierten „der Link ist der Zugang"-Muster ein Modell, bei dem der Link
allein nichts wert ist.

## Konsequenzen

- Das Portal braucht einen **Admin-Bereich für den Physio** — Konten anlegen, Passwörter
  zurücksetzen, sperren. Das gehört in die erste Ausbaustufe, nicht als Nachtrag.
- Die Übergabe des temporären Passworts ist ein **organisatorischer Ablauf in der
  Praxis**, kein rein technisches Problem — gehört ins Onboarding des Physios.
- Kein „Passwort vergessen"-Link per E-Mail ohne weitere Prüfung. Ein Reset läuft
  entweder über den Physio (neues temporäres Passwort) oder über eine Reset-Mail ohne
  jeden Gesundheitsdatenbezug, kombiniert mit einer zweiten Bestätigung. Sonst entsteht
  durch die Hintertür wieder das Link-Problem, das dieses ADR vermeiden soll.
- Logins und Passwort-Resets werden protokolliert — das Audit-Log-Prinzip aus ADR 0002
  gilt auch für Zugriffe, nicht nur für Schreibvorgänge an Behandlungsdaten.
- Fehlversuche brauchen ein Lockout/Rate-Limit, damit ein kurzes temporäres Passwort
  nicht per Brute-Force zu erraten ist.

## Verworfene Alternativen

**Reiner Magic Link, automatischer Login ohne Passwort** — verworfen. Der Link allein
wäre dann wieder das einzige Geheimnis; genau das Risiko, das dieses ADR adressiert.

**Offene Selbstregistrierung mit E-Mail-Bestätigung** — verworfen. Würde eine eigene
Identitätsprüfung nötig machen (woher weiß das System, dass die Person, die sich
registriert, wirklich Patient X ist?) und passt nicht zur gewünschten zentralen
Verwaltung durch den Physio.
