/**
 * Fachliche Tabellen der Reha-Plattform.
 *
 * Append-only (ADR 0002): alle *_versions-, Protokoll- und Eintragstabellen werden nur
 * eingefügt. Eine Korrektur ist eine neue Zeile mit supersedes_id auf die Vorgängerin.
 * Die Erzwingung (REVOKE UPDATE/DELETE, Trigger) steht in der SQL-Migration, nicht hier.
 *
 * Änderbar (Stammdaten): exercises, content_assets.
 */
import { sql } from "drizzle-orm";
import {
  bigserial,
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

const id = () => uuid("id").primaryKey().default(sql`gen_random_uuid()`);
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const createdBy = () => text("created_by").notNull().references(() => user.id);

/** Profil des Patienten: Ziel, Bewegungsprofil, KRS-Stufe, Zielwerte. Versioniert. */
export const patientProfileVersions = pgTable(
  "patient_profile_versions",
  {
    id: id(),
    patientId: text("patient_id").notNull().references(() => user.id),
    version: integer("version").notNull(),
    supersedesId: uuid("supersedes_id"),
    goal: text("goal"),
    movementProfile: text("movement_profile"),
    notes: text("notes"),
    krsStage: smallint("krs_stage"),
    opContext: boolean("op_context").notNull().default(false),
    calorieTarget: integer("calorie_target"),
    proteinTargetG: integer("protein_target_g"),
    createdBy: createdBy(),
    createdAt: createdAt(),
  },
  (t) => [
    index("ppv_patient_idx").on(t.patientId, t.createdAt),
    check("ppv_krs_stage_range", sql`${t.krsStage} IS NULL OR (${t.krsStage} BETWEEN 1 AND 9)`),
  ],
);

/** Übungsbibliothek (Stammdaten, änderbar, protokolliert). */
export const exercises = pgTable(
  "exercises",
  {
    id: id(),
    name: text("name").notNull(),
    category: text("category").notNull().default("training"),
    description: text("description"),
    active: boolean("active").notNull().default(true),
    createdBy: createdBy(),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("exercises_active_name_idx").on(t.active, t.name),
    check("exercises_category", sql`${t.category} IN ('aufwaermen','training','abwaermen','allgemein')`),
  ],
);

/** Eine Trainingswoche des Patienten. Versioniert: Anpassung = neue Version. */
export const planWeekVersions = pgTable(
  "plan_week_versions",
  {
    id: id(),
    patientId: text("patient_id").notNull().references(() => user.id),
    weekNumber: integer("week_number").notNull(),
    startsOn: date("starts_on").notNull(),
    version: integer("version").notNull(),
    supersedesId: uuid("supersedes_id"),
    goal: text("goal"),
    notes: text("notes"),
    /** ISO-Wochentage 1 = Montag … 7 = Sonntag */
    trainingDays: smallint("training_days").array().notNull().default(sql`'{}'`),
    createdBy: createdBy(),
    createdAt: createdAt(),
  },
  (t) => [index("pwv_patient_starts_idx").on(t.patientId, t.startsOn, t.createdAt)],
);

export const planWeekExercises = pgTable(
  "plan_week_exercises",
  {
    id: id(),
    weekVersionId: uuid("week_version_id").notNull().references(() => planWeekVersions.id),
    section: text("section").notNull(),
    position: integer("position").notNull(),
    exerciseId: uuid("exercise_id").references(() => exercises.id),
    name: text("name").notNull(),
    duration: text("duration"),
    weight: text("weight"),
    reps: text("reps"),
    sets: text("sets"),
    remarks: text("remarks"),
  },
  (t) => [
    index("pwe_week_idx").on(t.weekVersionId, t.section, t.position),
    check("pwe_section", sql`${t.section} IN ('warmup','main','cooldown')`),
  ],
);

/** Ein Trainingseintrag des Patienten für einen Tag. Korrektur = neue Zeile. */
export const trainingLogs = pgTable(
  "training_logs",
  {
    id: id(),
    patientId: text("patient_id").notNull().references(() => user.id),
    weekVersionId: uuid("week_version_id").notNull().references(() => planWeekVersions.id),
    logDate: date("log_date").notNull(),
    supersedesId: uuid("supersedes_id"),
    remark: text("remark"),
    createdBy: createdBy(),
    createdAt: createdAt(),
  },
  (t) => [index("tl_patient_date_idx").on(t.patientId, t.logDate, t.createdAt)],
);

export const trainingLogItems = pgTable(
  "training_log_items",
  {
    id: id(),
    logId: uuid("log_id").notNull().references(() => trainingLogs.id),
    weekExerciseId: uuid("week_exercise_id").notNull().references(() => planWeekExercises.id),
    done: boolean("done").notNull().default(false),
    remark: text("remark"),
  },
  (t) => [index("tli_log_idx").on(t.logId)],
);

/** Schmerzwert (NPRS 0–10) zu einem Trainingstag: während, danach, nächster Morgen. */
export const painEntries = pgTable(
  "pain_entries",
  {
    id: id(),
    patientId: text("patient_id").notNull().references(() => user.id),
    trainingLogId: uuid("training_log_id").references(() => trainingLogs.id),
    entryDate: date("entry_date").notNull(),
    phase: text("phase").notNull(),
    nprs: smallint("nprs").notNull(),
    remark: text("remark"),
    supersedesId: uuid("supersedes_id"),
    createdBy: createdBy(),
    createdAt: createdAt(),
  },
  (t) => [
    index("pe_patient_date_idx").on(t.patientId, t.entryDate, t.createdAt),
    check("pe_phase", sql`${t.phase} IN ('during','after','next_morning')`),
    check("pe_nprs_range", sql`${t.nprs} BETWEEN 0 AND 10`),
  ],
);

/** Supplement-Plan, vom Physio konfiguriert. Versioniert. */
export const supplementPlanVersions = pgTable(
  "supplement_plan_versions",
  {
    id: id(),
    patientId: text("patient_id").notNull().references(() => user.id),
    version: integer("version").notNull(),
    supersedesId: uuid("supersedes_id"),
    notes: text("notes"),
    createdBy: createdBy(),
    createdAt: createdAt(),
  },
  (t) => [index("spv_patient_idx").on(t.patientId, t.createdAt)],
);

export const supplementPlanItems = pgTable(
  "supplement_plan_items",
  {
    id: id(),
    planVersionId: uuid("plan_version_id").notNull().references(() => supplementPlanVersions.id),
    position: integer("position").notNull(),
    name: text("name").notNull(),
    dosage: text("dosage"),
    amount: text("amount"),
    /** Teilmenge von morning, noon, evening */
    slots: text("slots").array().notNull().default(sql`'{}'`),
    validFrom: date("valid_from"),
    validTo: date("valid_to"),
  },
  (t) => [index("spi_plan_idx").on(t.planVersionId, t.position)],
);

/** Einnahme-Häkchen des Patienten. Rücknahme = neue Zeile mit revoked = true. */
export const supplementIntakes = pgTable(
  "supplement_intakes",
  {
    id: id(),
    patientId: text("patient_id").notNull().references(() => user.id),
    itemId: uuid("item_id").notNull().references(() => supplementPlanItems.id),
    intakeDate: date("intake_date").notNull(),
    slot: text("slot").notNull(),
    revoked: boolean("revoked").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [
    index("si_patient_date_idx").on(t.patientId, t.intakeDate, t.createdAt),
    check("si_slot", sql`${t.slot} IN ('morning','noon','evening')`),
  ],
);

/** Assessments (Messungen) durch den Physio. Korrektur = neue Zeile. */
export const assessments = pgTable(
  "assessments",
  {
    id: id(),
    patientId: text("patient_id").notNull().references(() => user.id),
    name: text("name").notNull(),
    assessedOn: date("assessed_on").notNull(),
    side: text("side"),
    score: text("score").notNull(),
    remark: text("remark"),
    supersedesId: uuid("supersedes_id"),
    createdBy: createdBy(),
    createdAt: createdAt(),
  },
  (t) => [
    index("assessments_patient_idx").on(t.patientId, t.assessedOn),
    check("assessments_side", sql`${t.side} IS NULL OR ${t.side} IN ('links','rechts','beide')`),
  ],
);

/** Einwilligungen (Art. 9 Abs. 2 lit. a). Nur einfügen; Widerruf = neue Zeile. */
export const consents = pgTable(
  "consents",
  {
    id: id(),
    userId: text("user_id").notNull().references(() => user.id),
    documentKey: text("document_key").notNull(),
    documentVersion: text("document_version").notNull(),
    decision: text("decision").notNull().default("accepted"),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: createdAt(),
  },
  (t) => [
    index("consents_user_idx").on(t.userId, t.documentKey, t.createdAt),
    check("consents_decision", sql`${t.decision} IN ('accepted','withdrawn')`),
  ],
);

/** Wissensinhalte (ADR 0009). Jede Bearbeitung ist eine neue Version. */
export const contentVersions = pgTable(
  "content_versions",
  {
    id: id(),
    slug: text("slug").notNull(),
    version: integer("version").notNull(),
    supersedesId: uuid("supersedes_id"),
    title: text("title").notNull(),
    category: text("category").notNull(),
    position: integer("position").notNull().default(0),
    body: jsonb("body").notNull(),
    status: text("status").notNull().default("draft"),
    authorId: text("author_id").notNull().references(() => user.id),
    createdAt: createdAt(),
  },
  (t) => [
    index("cv_slug_idx").on(t.slug, t.createdAt),
    check("cv_status", sql`${t.status} IN ('draft','published','archived')`),
    check("cv_category", sql`${t.category} IN ('einfuehrung','schlaf','ernaehrung','bewegung','schmerz','reha')`),
  ],
);

/** Hochgeladene Bilder für Wissensinhalte. Datei liegt unter UPLOAD_DIR. */
export const contentAssets = pgTable("content_assets", {
  id: id(),
  filename: text("filename").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  sha256: text("sha256").notNull(),
  storedPath: text("stored_path").notNull(),
  uploadedBy: createdBy(),
  createdAt: createdAt(),
});

/** Audit-Log, per Trigger gefüllt. Anwendung schreibt hier nie direkt. */
export const auditLog = pgTable(
  "audit_log",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
    actorId: text("actor_id"),
    action: text("action").notNull(),
    tableName: text("table_name").notNull(),
    rowId: text("row_id"),
    ip: text("ip"),
    userAgent: text("user_agent"),
    details: jsonb("details"),
  },
  (t) => [index("audit_at_idx").on(t.at), index("audit_actor_idx").on(t.actorId, t.at)],
);

/** Anmeldeversuche (ADR 0005: Logins werden protokolliert, auch Fehlversuche). */
export const loginEvents = pgTable(
  "login_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
    userId: text("user_id"),
    email: text("email"),
    success: boolean("success").notNull(),
    reason: text("reason"),
    ip: text("ip"),
    userAgent: text("user_agent"),
  },
  (t) => [index("login_events_user_idx").on(t.userId, t.at), index("login_events_at_idx").on(t.at)],
);
