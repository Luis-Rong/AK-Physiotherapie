/**
 * Synthetische Testdaten für Entwicklung, Staging und Tests.
 * Regel 1 aus CLAUDE.md: Hier stehen nie echte Patientendaten. Namen sind erfunden,
 * E-Mail-Adressen nutzen die reservierte Domain example.test.
 */

export type SeedAccount = {
  id: string;
  name: string;
  email: string;
  role: "praxis" | "patient";
  /** Nur für Test/Staging. In Produktion vergibt der Physio temporäre Passwörter selbst. */
  password: string;
  mustChangePassword: boolean;
  /** Praxis-Konto bekommt beim Seed den festen TOTP-Schlüssel `seedTotpSecret` (nur lokal/Staging). */
  twoFactorSeeded?: boolean;
};

/**
 * Fester TOTP-Schlüssel für geseedete Praxis-Konten. Nur für lokal, Tests und Staging –
 * in Produktion richtet jeder Praxiszugang seinen zweiten Faktor selbst ein.
 * `pnpm totp` gibt den aktuellen Code aus; alternativ den Schlüssel (Base32, wird beim
 * Start von `pnpm dev` angezeigt) einmalig in eine Authenticator-App eintragen.
 */
export const seedTotpSecret = "REHA-TEST-TOTP-SECRET-NUR-LOKAL-01";

export const seedAccounts: SeedAccount[] = [
  {
    id: "seed-praxis-1",
    name: "Test Physio",
    email: "physio@example.test",
    role: "praxis",
    password: "physio-test-passwort",
    mustChangePassword: false,
    twoFactorSeeded: true,
  },
  {
    // Praxiszugang ohne zweiten Faktor: zeigt den Einrichtungszwang (E2E-Test)
    id: "seed-praxis-2",
    name: "Neue Praxis-Kraft",
    email: "praxis-neu@example.test",
    role: "praxis",
    password: "praxis-neu-test-passwort",
    mustChangePassword: false,
  },
  {
    id: "seed-patient-1",
    name: "Mara Beispiel",
    email: "mara@example.test",
    role: "patient",
    password: "mara-test-passwort",
    mustChangePassword: false,
  },
  {
    id: "seed-patient-2",
    name: "Jonas Muster",
    email: "jonas@example.test",
    role: "patient",
    password: "temp-jonas-1234",
    mustChangePassword: true,
  },
];

export const seedExercises: { name: string; category: "aufwaermen" | "training" | "abwaermen" | "allgemein"; description: string }[] = [
  { name: "Fahrradergometer", category: "aufwaermen", description: "Lockeres Treten mit geringem Widerstand, Trittfrequenz 70–80/min." },
  { name: "Mobilisation Sprunggelenk", category: "aufwaermen", description: "Kreisende Bewegungen in beide Richtungen, schmerzfreier Bereich." },
  { name: "Beinpresse", category: "training", description: "Füße hüftbreit, Knie über der Fußmitte, kontrolliert absenken und drücken." },
  { name: "Kniebeuge mit Körpergewicht", category: "training", description: "Bis zur schmerzfreien Tiefe, Rücken neutral, Knie stabil." },
  { name: "Ausfallschritt rückwärts", category: "training", description: "Schritt nach hinten, vorderes Knie über dem Fuß, langsam aufrichten." },
  { name: "Einbeinstand auf Kissen", category: "training", description: "Blick geradeaus, Becken stabil halten." },
  { name: "Wadenheben", category: "training", description: "Beidbeinig, oben kurz halten, langsam absenken." },
  { name: "Dehnung Oberschenkelrückseite", category: "abwaermen", description: "Bein auf Erhöhung, Oberkörper aufrecht nach vorn neigen, 30 Sekunden halten." },
  { name: "Dehnung Hüftbeuger", category: "abwaermen", description: "Kniestand, Becken nach vorn schieben, 30 Sekunden je Seite." },
  { name: "Atemübung 4-7-8", category: "allgemein", description: "4 Sekunden einatmen, 7 halten, 8 ausatmen, viermal wiederholen." },
];

export type SeedWeek = {
  weekNumber: number;
  goal: string;
  trainingDays: number[];
  warmup: { name: string; duration?: string; sets?: string; remarks?: string }[];
  main: { name: string; weight?: string; reps?: string; sets?: string; remarks?: string }[];
  cooldown: { name: string; duration?: string; sets?: string; remarks?: string }[];
  notes?: string;
};

export const seedWeeks: SeedWeek[] = [
  {
    weekNumber: 1,
    goal: "Schwellung kontrollieren, Beweglichkeit schmerzfrei erweitern",
    trainingDays: [1, 3, 5],
    warmup: [
      { name: "Fahrradergometer", duration: "8 min", sets: "1", remarks: "geringer Widerstand" },
      { name: "Mobilisation Sprunggelenk", duration: "2 min", sets: "2" },
    ],
    main: [
      { name: "Kniebeuge mit Körpergewicht", reps: "12", sets: "3", remarks: "nur bis 60°" },
      { name: "Einbeinstand auf Kissen", reps: "30 s", sets: "3" },
      { name: "Wadenheben", reps: "15", sets: "3" },
    ],
    cooldown: [{ name: "Dehnung Oberschenkelrückseite", duration: "30 s", sets: "2" }],
  },
  {
    weekNumber: 2,
    goal: "Kraftausdauer aufbauen (KRS 2)",
    trainingDays: [1, 3, 5],
    warmup: [{ name: "Fahrradergometer", duration: "10 min", sets: "1" }],
    main: [
      { name: "Beinpresse", weight: "40 kg", reps: "15", sets: "3", remarks: "Pause 45 s" },
      { name: "Ausfallschritt rückwärts", reps: "10 je Seite", sets: "3" },
      { name: "Einbeinstand auf Kissen", reps: "45 s", sets: "3" },
    ],
    cooldown: [
      { name: "Dehnung Oberschenkelrückseite", duration: "30 s", sets: "2" },
      { name: "Dehnung Hüftbeuger", duration: "30 s", sets: "2" },
    ],
    notes: "Bei Schwellung am nächsten Morgen Beinpresse auf 30 kg reduzieren.",
  },
];

export const seedSupplements: { name: string; dosage: string; amount: string; slots: ("morning" | "noon" | "evening")[] }[] = [
  { name: "Vitamin D3", dosage: "2000 IE", amount: "1 Kapsel", slots: ["morning"] },
  { name: "Omega-3", dosage: "1000 mg", amount: "1 Kapsel", slots: ["morning", "evening"] },
  { name: "Magnesiumbisglycinat", dosage: "300 mg", amount: "2 Kapseln", slots: ["evening"] },
];
