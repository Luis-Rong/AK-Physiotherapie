-- Plan-Vorlagen (Stammdaten der Praxis, änderbar, protokolliert) und
-- Patientendateien (Teil der Dokumentation, append-only; Zurückziehen = neue Zeile).

CREATE TABLE plan_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  -- [{ weekNumber, goal, notes, trainingDays, exercises: [{ section, exerciseId, name, sets, reps, weight, duration, remarks }] }]
  weeks       jsonb NOT NULL DEFAULT '[]'::jsonb,
  active      boolean NOT NULL DEFAULT true,
  created_by  text NOT NULL REFERENCES "user"(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX plan_templates_active_name_idx ON plan_templates (active, name);
CREATE TRIGGER plan_templates_audit AFTER INSERT OR UPDATE OR DELETE ON plan_templates
  FOR EACH ROW EXECUTE FUNCTION audit_row_change();

CREATE TABLE patient_files (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    text NOT NULL REFERENCES "user"(id),
  filename      text NOT NULL,
  mime          text NOT NULL,
  size          integer NOT NULL,
  sha256        text NOT NULL,
  stored_path   text NOT NULL,
  note          text,
  withdrawn     boolean NOT NULL DEFAULT false,
  supersedes_id uuid REFERENCES patient_files(id),
  created_by    text NOT NULL REFERENCES "user"(id),
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX patient_files_patient_idx ON patient_files (patient_id, created_at);
CREATE TRIGGER patient_files_append_only BEFORE UPDATE OR DELETE ON patient_files
  FOR EACH ROW EXECUTE FUNCTION forbid_modification();
CREATE TRIGGER patient_files_audit AFTER INSERT ON patient_files
  FOR EACH ROW EXECUTE FUNCTION audit_row_change();

GRANT SELECT, INSERT, UPDATE, DELETE ON plan_templates TO reha_app;
GRANT SELECT, INSERT ON patient_files TO reha_app;
