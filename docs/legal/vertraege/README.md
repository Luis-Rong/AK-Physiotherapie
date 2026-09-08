# Vertragspaket – Entwürfe ohne Anwalt

**Kein Rechtsrat.** Diese Entwürfe haben Luis, Roko und Claude geschrieben (ADR 0012:
bewusst ohne Fachanwalt, solange das Vorhaben klein ist). Sie sind eine Grundlage zum
Ausfüllen und Verhandeln, keine geprüften Verträge. Sobald skaliert wird, gehen sie zum
Anwalt.

Platzhalter stehen in `[eckigen Klammern]`.

## Die Kette

```
AK Physiotherapie (Verantwortlicher, § 203-Berufsträger)
   │  Kundenvertrag + AV-Vertrag + § 203-Verpflichtung
   ▼
Roko [Nachname] (Einzelgewerbe, Auftragsverarbeiter, "Dienstleister")
   │  Unterauftrag: AV-Vertrag + § 203-Verpflichtung
   ▼
Luis Rongstock (Einzelgewerbe, Unterauftragsverarbeiter, "Entwickler")
   │  (beide) Unterauftragnehmer: Hetzner (Hosting, Backup), [Mailversender]
```

| Dokument | Zwischen | Datei |
|---|---|---|
| Kundenvertrag (Entwicklung + Betrieb) | AK ↔ Roko | [kundenvertrag.md](kundenvertrag.md) |
| AV-Vertrag nach Art. 28 DSGVO | AK ↔ Roko | [av-vertrag.md](av-vertrag.md) |
| AV-Vertrag Unterauftrag (Art. 28 Abs. 4) | Roko ↔ Luis | [av-vertrag.md](av-vertrag.md) (Variante B) |
| Verschwiegenheitsverpflichtung § 203 Abs. 3 StGB | AK → Roko, Roko → Luis | [verschwiegenheit-203.md](verschwiegenheit-203.md) |
| Zusammenarbeit Roko ↔ Luis (intern) | Roko ↔ Luis | [zusammenarbeit-intern.md](zusammenarbeit-intern.md) |

## Reihenfolge

1. Gewerbe anmelden (beide).
2. Verschwiegenheitsverpflichtungen unterschreiben – **vor** dem ersten Blick auf Daten,
   also auch vor dem Staging-Deploy mit echtem Zugang der Praxis.
3. Kundenvertrag und AV-Vertrag zusammen unterschreiben, Anlagen (TOM, Unterauftragnehmer)
   dabei.
4. Hetzner: AV-Vertrag im Kundenkonto abschließen (Standardprozess), Ausdruck zu den Akten.

## Was bewusst fehlt

- Haftungsbeschränkung durch Gesellschaftsform – beide haften persönlich (ADR 0012).
- Versicherung – Empfehlung bleibt, ist im Vertrag als „soweit vorhanden" formuliert.
