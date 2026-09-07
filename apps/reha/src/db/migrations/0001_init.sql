-- ============================================================================
-- 0001_init: Grundschema der Reha-Plattform
--
-- Läuft als reha_owner. Die Rollen reha_owner und reha_app werden vorher vom
-- Superuser angelegt (docker/init/01-roles.sql bzw. scripts/db-local.ts).
--
-- Append-only (ADR 0002) wird hier doppelt erzwungen:
--   1. reha_app bekommt auf den Dokumentationstabellen nur SELECT und INSERT.
--   2. Ein Trigger verweigert UPDATE/DELETE auch für den Owner.
-- Der Audit-Trigger schreibt jeden Schreibvorgang mit Akteur, IP und User-Agent,
-- die die Anwendung pro Transaktion über SET LOCAL app.actor_id / app.ip / app.ua
-- bereitstellt.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Audit-Infrastruktur
-- ---------------------------------------------------------------------------
CREATE TABLE audit_log (
  id          bigserial PRIMARY KEY,
  at          timestamptz NOT NULL DEFAULT now(),
  actor_id    text,
  action      text NOT NULL,
  table_name  text NOT NULL,
  row_id      text,
  ip          text,
  user_agent  text,
  details     jsonb
);
CREATE INDEX audit_at_idx ON audit_log (at);
CREATE INDEX audit_actor_idx ON audit_log (actor_id, at);

CREATE OR REPLACE FUNCTION audit_row_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_row_id text;
  v_details jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_row_id := OLD.id::text;
    v_details := jsonb_build_object('old', to_jsonb(OLD));
  ELSIF TG_OP = 'UPDATE' THEN
    v_row_id := NEW.id::text;
    -- nur geänderte Felder festhalten, ohne Passwort-Hashes und Tokens
    v_details := jsonb_build_object(
      'changed',
      (SELECT jsonb_object_agg(key, value)
         FROM jsonb_each(to_jsonb(NEW) - 'password' - 'secret' - 'backup_codes' - 'token')
        WHERE value IS DISTINCT FROM (to_jsonb(OLD) -> key))
    );
  ELSE
    v_row_id := NEW.id::text;
    v_details := NULL;
  END IF;

  INSERT INTO audit_log (actor_id, action, table_name, row_id, ip, user_agent, details)
  VALUES (
    NULLIF(current_setting('app.actor_id', true), ''),
    TG_OP,
    TG_TABLE_NAME,
    v_row_id,
    NULLIF(current_setting('app.ip', true), ''),
    NULLIF(current_setting('app.ua', true), ''),
    v_details
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION forbid_modification() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Tabelle % ist append-only (ADR 0002): % nicht erlaubt', TG_TABLE_NAME, TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$$;

-- ---------------------------------------------------------------------------
-- better-auth: Kern + Plugins admin, twoFactor (Stammdaten, änderbar)
-- ---------------------------------------------------------------------------
CREATE TABLE "user" (
  id                        text PRIMARY KEY,
  name                      text NOT NULL,
  email                     text NOT NULL UNIQUE,
  email_verified            boolean NOT NULL DEFAULT false,
  image                     text,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now(),
  role                      text NOT NULL DEFAULT 'patient',
  banned                    boolean NOT NULL DEFAULT false,
  ban_reason                text,
  ban_expires               timestamptz,
  two_factor_enabled        boolean NOT NULL DEFAULT false,
  must_change_password      boolean NOT NULL DEFAULT true,
  temp_password_expires_at  timestamptz,
  created_by_id             text,
  CONSTRAINT user_role CHECK (role IN ('patient', 'praxis'))
);
CREATE INDEX user_role_idx ON "user" (role);

CREATE TABLE session (
  id               text PRIMARY KEY,
  expires_at       timestamptz NOT NULL,
  token            text NOT NULL UNIQUE,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  ip_address       text,
  user_agent       text,
  user_id          text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  impersonated_by  text
);
CREATE INDEX session_user_id_idx ON session (user_id);

CREATE TABLE account (
  id                        text PRIMARY KEY,
  issuer                    text NOT NULL,
  account_id                text NOT NULL,
  provider_id               text NOT NULL,
  user_id                   text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  access_token              text,
  refresh_token             text,
  id_token                  text,
  access_token_expires_at   timestamptz,
  refresh_token_expires_at  timestamptz,
  scope                     text,
  password                  text,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX account_user_id_idx ON account (user_id);

CREATE TABLE verification (
  id          text PRIMARY KEY,
  identifier  text NOT NULL,
  value       text NOT NULL,
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX verification_identifier_idx ON verification (identifier);

CREATE TABLE two_factor (
  id            text PRIMARY KEY,
  secret        text NOT NULL,
  backup_codes  text NOT NULL,
  user_id       text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  verified                  boolean NOT NULL DEFAULT true,
  failed_verification_count integer NOT NULL DEFAULT 0,
  locked_until              timestamptz
);
CREATE INDEX two_factor_user_id_idx ON two_factor (user_id);

-- Stammdatenänderungen an Konten werden protokolliert
CREATE TRIGGER user_audit AFTER INSERT OR UPDATE OR DELETE ON "user"
  FOR EACH ROW EXECUTE FUNCTION audit_row_change();
CREATE TRIGGER two_factor_audit AFTER INSERT OR UPDATE OR DELETE ON two_factor
  FOR EACH ROW EXECUTE FUNCTION audit_row_change();

-- ---------------------------------------------------------------------------
-- Fachliche Tabellen
-- ---------------------------------------------------------------------------
CREATE TABLE patient_profile_versions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        text NOT NULL REFERENCES "user"(id),
  version           integer NOT NULL,
  supersedes_id     uuid REFERENCES patient_profile_versions(id),
  goal              text,
  movement_profile  text,
  notes             text,
  krs_stage         smallint,
  op_context        boolean NOT NULL DEFAULT false,
  calorie_target    integer,
  protein_target_g  integer,
  created_by        text NOT NULL REFERENCES "user"(id),
  created_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ppv_krs_stage_range CHECK (krs_stage IS NULL OR krs_stage BETWEEN 1 AND 9),
  CONSTRAINT ppv_patient_version UNIQUE (patient_id, version)
);
CREATE INDEX ppv_patient_idx ON patient_profile_versions (patient_id, created_at);

CREATE TABLE exercises (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  category     text NOT NULL DEFAULT 'training',
  description  text,
  active       boolean NOT NULL DEFAULT true,
  created_by   text NOT NULL REFERENCES "user"(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT exercises_category CHECK (category IN ('aufwaermen', 'training', 'abwaermen', 'allgemein'))
);
CREATE INDEX exercises_active_name_idx ON exercises (active, name);
CREATE TRIGGER exercises_audit AFTER INSERT OR UPDATE OR DELETE ON exercises
  FOR EACH ROW EXECUTE FUNCTION audit_row_change();

CREATE TABLE plan_week_versions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id     text NOT NULL REFERENCES "user"(id),
  week_number    integer NOT NULL,
  starts_on      date NOT NULL,
  version        integer NOT NULL,
  supersedes_id  uuid REFERENCES plan_week_versions(id),
  goal           text,
  notes          text,
  training_days  smallint[] NOT NULL DEFAULT '{}',
  created_by     text NOT NULL REFERENCES "user"(id),
  created_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pwv_training_days_range CHECK (training_days <@ ARRAY[1,2,3,4,5,6,7]::smallint[])
);
CREATE INDEX pwv_patient_starts_idx ON plan_week_versions (patient_id, starts_on, created_at);

CREATE TABLE plan_week_exercises (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_version_id  uuid NOT NULL REFERENCES plan_week_versions(id),
  section          text NOT NULL,
  position         integer NOT NULL,
  exercise_id      uuid REFERENCES exercises(id),
  name             text NOT NULL,
  duration         text,
  weight           text,
  reps             text,
  sets             text,
  remarks          text,
  CONSTRAINT pwe_section CHECK (section IN ('warmup', 'main', 'cooldown'))
);
CREATE INDEX pwe_week_idx ON plan_week_exercises (week_version_id, section, position);

CREATE TABLE training_logs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       text NOT NULL REFERENCES "user"(id),
  week_version_id  uuid NOT NULL REFERENCES plan_week_versions(id),
  log_date         date NOT NULL,
  supersedes_id    uuid REFERENCES training_logs(id),
  remark           text,
  created_by       text NOT NULL REFERENCES "user"(id),
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tl_patient_date_idx ON training_logs (patient_id, log_date, created_at);

CREATE TABLE training_log_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id            uuid NOT NULL REFERENCES training_logs(id),
  week_exercise_id  uuid NOT NULL REFERENCES plan_week_exercises(id),
  done              boolean NOT NULL DEFAULT false,
  remark            text
);
CREATE INDEX tli_log_idx ON training_log_items (log_id);

CREATE TABLE pain_entries (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       text NOT NULL REFERENCES "user"(id),
  training_log_id  uuid REFERENCES training_logs(id),
  entry_date       date NOT NULL,
  phase            text NOT NULL,
  nprs             smallint NOT NULL,
  remark           text,
  supersedes_id    uuid REFERENCES pain_entries(id),
  created_by       text NOT NULL REFERENCES "user"(id),
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pe_phase CHECK (phase IN ('during', 'after', 'next_morning')),
  CONSTRAINT pe_nprs_range CHECK (nprs BETWEEN 0 AND 10)
);
CREATE INDEX pe_patient_date_idx ON pain_entries (patient_id, entry_date, created_at);

CREATE TABLE supplement_plan_versions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id     text NOT NULL REFERENCES "user"(id),
  version        integer NOT NULL,
  supersedes_id  uuid REFERENCES supplement_plan_versions(id),
  notes          text,
  created_by     text NOT NULL REFERENCES "user"(id),
  created_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT spv_patient_version UNIQUE (patient_id, version)
);
CREATE INDEX spv_patient_idx ON supplement_plan_versions (patient_id, created_at);

CREATE TABLE supplement_plan_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_version_id  uuid NOT NULL REFERENCES supplement_plan_versions(id),
  position         integer NOT NULL,
  name             text NOT NULL,
  dosage           text,
  amount           text,
  slots            text[] NOT NULL DEFAULT '{}',
  valid_from       date,
  valid_to         date,
  CONSTRAINT spi_slots CHECK (slots <@ ARRAY['morning', 'noon', 'evening']::text[])
);
CREATE INDEX spi_plan_idx ON supplement_plan_items (plan_version_id, position);

CREATE TABLE supplement_intakes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id   text NOT NULL REFERENCES "user"(id),
  item_id      uuid NOT NULL REFERENCES supplement_plan_items(id),
  intake_date  date NOT NULL,
  slot         text NOT NULL,
  revoked      boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT si_slot CHECK (slot IN ('morning', 'noon', 'evening'))
);
CREATE INDEX si_patient_date_idx ON supplement_intakes (patient_id, intake_date, created_at);

CREATE TABLE assessments (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id     text NOT NULL REFERENCES "user"(id),
  name           text NOT NULL,
  assessed_on    date NOT NULL,
  side           text,
  score          text NOT NULL,
  remark         text,
  supersedes_id  uuid REFERENCES assessments(id),
  created_by     text NOT NULL REFERENCES "user"(id),
  created_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT assessments_side CHECK (side IS NULL OR side IN ('links', 'rechts', 'beide'))
);
CREATE INDEX assessments_patient_idx ON assessments (patient_id, assessed_on);

CREATE TABLE consents (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           text NOT NULL REFERENCES "user"(id),
  document_key      text NOT NULL,
  document_version  text NOT NULL,
  decision          text NOT NULL DEFAULT 'accepted',
  ip                text,
  user_agent        text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT consents_decision CHECK (decision IN ('accepted', 'withdrawn'))
);
CREATE INDEX consents_user_idx ON consents (user_id, document_key, created_at);

CREATE TABLE content_versions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text NOT NULL,
  version        integer NOT NULL,
  supersedes_id  uuid REFERENCES content_versions(id),
  title          text NOT NULL,
  category       text NOT NULL,
  position       integer NOT NULL DEFAULT 0,
  body           jsonb NOT NULL,
  status         text NOT NULL DEFAULT 'draft',
  author_id      text NOT NULL REFERENCES "user"(id),
  created_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cv_status CHECK (status IN ('draft', 'published', 'archived')),
  CONSTRAINT cv_category CHECK (category IN ('einfuehrung', 'schlaf', 'ernaehrung', 'bewegung', 'schmerz', 'reha')),
  CONSTRAINT cv_slug_version UNIQUE (slug, version)
);
CREATE INDEX cv_slug_idx ON content_versions (slug, created_at);

CREATE TABLE content_assets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename     text NOT NULL,
  mime         text NOT NULL,
  size         integer NOT NULL,
  sha256       text NOT NULL,
  stored_path  text NOT NULL,
  uploaded_by  text NOT NULL REFERENCES "user"(id),
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER content_assets_audit AFTER INSERT OR UPDATE OR DELETE ON content_assets
  FOR EACH ROW EXECUTE FUNCTION audit_row_change();

CREATE TABLE login_events (
  id          bigserial PRIMARY KEY,
  at          timestamptz NOT NULL DEFAULT now(),
  user_id     text,
  email       text,
  success     boolean NOT NULL,
  reason      text,
  ip          text,
  user_agent  text
);
CREATE INDEX login_events_user_idx ON login_events (user_id, at);
CREATE INDEX login_events_at_idx ON login_events (at);

-- ---------------------------------------------------------------------------
-- Append-only-Erzwingung und Audit auf den Dokumentationstabellen
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'patient_profile_versions', 'plan_week_versions', 'plan_week_exercises',
    'training_logs', 'training_log_items', 'pain_entries',
    'supplement_plan_versions', 'supplement_plan_items', 'supplement_intakes',
    'assessments', 'consents', 'content_versions', 'audit_log', 'login_events'
  ] LOOP
    EXECUTE format(
      'CREATE TRIGGER %I BEFORE UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION forbid_modification()',
      t || '_append_only', t);
    IF t NOT IN ('audit_log', 'login_events') THEN
      EXECUTE format(
        'CREATE TRIGGER %I AFTER INSERT ON %I FOR EACH ROW EXECUTE FUNCTION audit_row_change()',
        t || '_audit', t);
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- Sichten auf den jeweils aktuellen Stand
-- ---------------------------------------------------------------------------
CREATE VIEW patient_profile_current AS
  SELECT DISTINCT ON (patient_id) *
    FROM patient_profile_versions
   ORDER BY patient_id, version DESC;

CREATE VIEW plan_week_current AS
  SELECT DISTINCT ON (patient_id, week_number) *
    FROM plan_week_versions
   ORDER BY patient_id, week_number, version DESC;

CREATE VIEW supplement_plan_current AS
  SELECT DISTINCT ON (patient_id) *
    FROM supplement_plan_versions
   ORDER BY patient_id, version DESC;

CREATE VIEW content_current AS
  SELECT DISTINCT ON (slug) *
    FROM content_versions
   ORDER BY slug, version DESC;

CREATE VIEW content_published AS
  SELECT DISTINCT ON (slug) *
    FROM content_versions
   WHERE status = 'published'
     AND NOT EXISTS (
       SELECT 1 FROM content_versions later
        WHERE later.slug = content_versions.slug
          AND later.version > content_versions.version
          AND later.status = 'archived')
   ORDER BY slug, version DESC;

-- ---------------------------------------------------------------------------
-- Rechte der Anwendungsrolle
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO reha_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  "user", session, account, verification, two_factor, exercises, content_assets
  TO reha_app;
GRANT SELECT, INSERT ON
  patient_profile_versions, plan_week_versions, plan_week_exercises,
  training_logs, training_log_items, pain_entries,
  supplement_plan_versions, supplement_plan_items, supplement_intakes,
  assessments, consents, content_versions, login_events
  TO reha_app;
-- audit_log: nur lesen; geschrieben wird ausschließlich über den SECURITY-DEFINER-Trigger
GRANT SELECT ON audit_log TO reha_app;
GRANT USAGE, SELECT ON SEQUENCE audit_log_id_seq, login_events_id_seq TO reha_app;
GRANT SELECT ON
  patient_profile_current, plan_week_current, supplement_plan_current,
  content_current, content_published
  TO reha_app;
