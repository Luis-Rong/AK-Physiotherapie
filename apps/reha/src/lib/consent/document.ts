/**
 * Einwilligung in die Verarbeitung von Gesundheitsdaten im Portal
 * (Art. 9 Abs. 2 lit. a DSGVO). Versioniert: Jede Textänderung erhöht die Version,
 * bestehende Nutzer müssen erneut zustimmen. Die Annahme wird append-only in
 * `consents` gespeichert (portal-konzept.md Abschnitt 4.3).
 *
 * ⚠ PLATZHALTER. Der endgültige Text kommt vom Fachanwalt und wird vor
 * Produktivbetrieb ersetzt (docs/legal/checkliste.md). Die Papier-/PDF-Alternative
 * muss weiterhin bestehen, sonst ist die Einwilligung nicht freiwillig.
 */
export const CONSENT_KEY = "portal-einwilligung";
export const CONSENT_VERSION = "0.1-entwurf";

export const consentSections: { title: string; body: string }[] = [
  {
    title: "Worum es geht",
    body:
      "Ihre Praxis stellt Ihnen dieses Portal zur Verfügung, damit Sie Ihren Trainingsplan, Ihren Supplement-Plan und Wissensinhalte einsehen und Ihren Fortschritt sowie Schmerzwerte selbst eintragen können. Dabei werden Gesundheitsdaten verarbeitet.",
  },
  {
    title: "Wer verantwortlich ist",
    body:
      "Verantwortlich ist die Praxis AK Physiotherapie. Der technische Betrieb erfolgt durch einen Auftragsverarbeiter mit Sitz und Servern in der EU, der zur Verschwiegenheit verpflichtet ist.",
  },
  {
    title: "Was gespeichert wird",
    body:
      "Ihr Name und Ihre E-Mail-Adresse als Zugangskennung, die von Ihrer Praxis eingetragenen Pläne, Ziele und Messwerte sowie Ihre eigenen Einträge (erledigte Übungen, Schmerzwerte, Einnahmen, Bemerkungen). Zugriffe und Änderungen werden protokolliert.",
  },
  {
    title: "Freiwilligkeit und Widerruf",
    body:
      "Die Nutzung des Portals ist freiwillig. Sie können Ihre Pläne weiterhin auf Papier oder als PDF erhalten. Sie können diese Einwilligung jederzeit gegenüber Ihrer Praxis widerrufen; die Rechtmäßigkeit der bis dahin erfolgten Verarbeitung bleibt unberührt. Behandlungsdokumentation unterliegt einer gesetzlichen Aufbewahrungsfrist von zehn Jahren.",
  },
  {
    title: "Kein Medizinprodukt",
    body:
      "Das Portal zeigt an, was Ihre Therapeutin oder Ihr Therapeut eingetragen hat, und dokumentiert Ihre Eingaben. Es ersetzt keine ärztliche oder therapeutische Beurteilung.",
  },
];
