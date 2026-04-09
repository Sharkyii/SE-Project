/**
 * Run this once to create the enrollment tables in Supabase.
 * Usage: npx ts-node src/scripts/createEnrollmentTables.ts
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function run() {
  console.log('Creating enrollment_applications table...');

  const { error: e1 } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS enrollment_applications (
        id             BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        full_name      TEXT NOT NULL,
        email          TEXT NOT NULL,
        phone          TEXT NOT NULL,
        date_of_birth  DATE,
        gender         TEXT CHECK (gender IN ('male', 'female', 'other')),
        department     TEXT NOT NULL,
        semester       INTEGER NOT NULL,
        section        TEXT DEFAULT 'A',
        address        TEXT,
        guardian_name  TEXT,
        guardian_phone TEXT,
        status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        remarks        TEXT,
        reviewed_at    TIMESTAMPTZ,
        created_at     TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });
  if (e1) console.error('enrollment_applications error:', e1.message);
  else console.log('enrollment_applications: OK');

  const { error: e2 } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS student_documents (
        id             BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        application_id BIGINT NOT NULL,
        doc_type       TEXT NOT NULL CHECK (doc_type IN ('aadhar_card', 'college_id', 'photo', 'other')),
        file_url       TEXT NOT NULL,
        original_name  TEXT NOT NULL,
        uploaded_at    TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (application_id) REFERENCES enrollment_applications(id) ON DELETE CASCADE
      );
    `
  });
  if (e2) console.error('student_documents error:', e2.message);
  else console.log('student_documents: OK');

  console.log('Done. Also create an "enrollment-docs" storage bucket in Supabase dashboard (public).');
}

run();
