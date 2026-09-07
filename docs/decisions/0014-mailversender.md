# ADR 0014: Mailversender für Benachrichtigungen (Entwurf)

- **Status:** vorgeschlagen – Entscheidung Luis + Roko steht aus
- **Datum:** 2026-09-07
- **Beteiligte:** Claude (Recherche), Luis, Roko

## Kontext

ADR 0012: Benachrichtigungen laufen per E-Mail. Die Mails enthalten kein Gesundheitsdatum
(„Es gibt etwas Neues in Ihrem Reha-Tagebuch" plus Login-Link). Trotzdem sieht der
Versender die E-Mail-Adresse und damit, dass jemand Patient einer Physiotherapiepraxis ist.
Regel 5 gilt: EU-Betrieb, AV-Vertrag, § 203-Verpflichtung – geklärt **bevor** die erste Mail
rausgeht, auch eine Testmail.

## Optionen

| Option | Sitz / Server | AV-Vertrag | § 203 | Bewertung |
|---|---|---|---|---|
| **Postfach der Praxis per SMTP** (z. B. beim Hoster der Praxisdomain) | hängt vom Anbieter der Praxis ab (offen, `offene-punkte.md` 1.3) | besteht ggf. schon zwischen Praxis und Hoster | kein neuer Beteiligter für uns | **Erste Wahl, wenn der Hoster in DE/EU sitzt.** Kein neuer Auftragsverarbeiter, Absender ist die Praxis selbst. Nachteil: Deliverability und Limits des Postfachs |
| **rapidmail** (Freiburg) | Deutschland, Server ausschließlich in Deutschland | deutscher AV-Vertrag im Angebot | individuell anzufragen | **Zweite Wahl.** Transaktionsmails per SMTP-Zugang; Pay-per-Mail für kleine Volumen, keine Grundgebühr |
| Mailjet (Sinch, EU) | EU-Hosting | vorhanden | anzufragen | möglich, größerer Anbieter |
| Brevo (Paris) | EU, teils auf Google Cloud | vorhanden | anzufragen | EU-Sitz, aber Google-Cloud-Anteil – nach unserer Hyperscaler-Linie (ADR 0008) nur zweite Reihe |
| Postmark u. ä. | USA | – | – | ausgeschlossen (Regel 5) |
| Eigener SMTP auf dem Hetzner-Server | Deutschland | – | – | kein neuer Beteiligter, aber Port-25-Sperre, Reputation, Wartung: Aufwand steht in keinem Verhältnis |

## Vorschlag

1. Beim Physio klären, wo `info@akphysiotherapie.de` liegt (Frage 7 im Fragenkatalog). Liegt
   das Postfach bei einem deutschen/EU-Hoster mit AV-Vertrag, versenden wir **über dieses
   Postfach per SMTP** – die Praxis ist Absenderin, kein neuer Auftragsverarbeiter.
2. Andernfalls **rapidmail** mit Pay-per-Mail; AV-Vertrag abschließen, § 203-Verpflichtung
   schriftlich anfragen, beides zu den Akten und in den AV-Vertrag als Unterauftragnehmer
   eintragen.
3. Unabhängig vom Weg: Mailinhalt ohne Gesundheitsdaten, kein Tracking-Pixel, keine
   Klick-Weiterleitung über den Anbieter; Abmeldung im Profil.

## Quellen (Stand 2026-09-07)

- [Europäische Transaktions-E-Mail-Dienste](https://european-alternatives.eu/category/transactional-email-service)
- [12 E-Mail-Marketing-Anbieter aus der EU im Vergleich](https://lsww.de/email-marketing-tools/)
- [Transaktionale E-Mails DSGVO – Leitfaden](https://mail.e-publisher.de/blog/transaktionale-e-mails-dsgvo/)
- [rapidmail vs. Mailchimp: „Made in Germany"](https://omr.com/de/reviews/contenthub/rapidmail-vs-mailchimp)
- [rapidmail Hilfecenter: Transaktionsmails](https://www.rapidmail.de/hilfe/kategorie/transaktionsmails)
- [rapidmail Preise](https://omr.com/en/reviews/product/rapidmail/pricing)
- [Brevo: Data storage location](https://help.brevo.com/hc/en-us/articles/360001005510-Data-storage-location)
- [Postmark: EU Data Protection](https://postmarkapp.com/eu-privacy)
