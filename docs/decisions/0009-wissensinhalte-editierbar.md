# ADR 0009: Wissensinhalte sind vom Physio im Admin editierbar

- **Status:** akzeptiert
- **Datum:** 2026-09-02
- **Beteiligte:** Luis, Claude

## Kontext

Das Rehabilitationstagebuch enthält rund 15 Seiten Fachtext (Schlaf, Ernährung,
OP-Leitfaden, Wundheilung, KRS-System) mit Grafiken. Zur Wahl standen: Inhalte als
Dateien im Repo, geändert per PR durch uns, oder ein Editor im Adminbereich, mit dem der
Physio selbst schreibt.

## Entscheidung

Der Physio pflegt die Wissensinhalte selbst im Adminbereich. Dafür gibt es:

- einen Editor (Tiptap, gebündelt) für Text, Listen, Tabellen und Bilder,
- feste **Bausteine**, die eingefügt, aber nicht verändert werden können
  (Schmerzampel-Legende, KRS-Treppe, Heilungskurve, Phasen-Karten, Atem-Timer,
  Ruheumsatz-Rechner),
- Entwurf/Veröffentlicht mit Versionshistorie; Patienten sehen nur Veröffentlichtes,
- Bild-Upload auf ein Server-Volume, Auslieferung nur an eingeloggte Nutzer.

Die Erstbefüllung aus dem PDF wird als **Entwurf** angelegt, nicht veröffentlicht.

## Begründung

Der Physio ist Autor dieser Texte und will sie ohne Umweg über uns anpassen. Der
Aufwand für Editor und Versionierung ist überschaubar; er ersetzt dauerhafte
Redaktionsarbeit durch uns.

## Konsequenzen

- **Die Verantwortung für Health Claims (EU 1924/2006) und § 3 HWG liegt beim Autor.**
  Die Mikronährstoff-Tabelle und die Supplement-Liste aus dem PDF enthalten Aussagen
  wie „unterstützt die Wundheilung", die in dieser Form nicht zugelassen sind. Vor der
  ersten Veröffentlichung müssen sie überarbeitet werden; der Entwurfsstatus des Seeds
  erzwingt diesen Schritt. Das gehört in den Kundenvertrag und ins Onboarding.
- Bilder sind Uploads und damit Teil von Backup und Löschkonzept.
- Versionen der Inhalte werden append-only gespeichert (welche Fassung hat welcher
  Patient wann gesehen, ist im Streitfall relevant).
- Bausteine, die rechnen (Ruheumsatz) oder zuordnen (Ampel), sind Code, nicht Inhalt;
  Änderungen daran laufen weiter über PR und ADR.

## Verworfene Alternativen

**Inhalte als MDX im Repo**: nachvollziehbar, Claims-Prüfung per Vier-Augen-Prinzip,
kein Editor nötig. Verworfen, weil der Physio nicht für jede Textänderung auf uns
warten soll.
