/**
 * Run this to create placement tables and update notifications table.
 * Usage: npx ts-node src/scripts/createPlacementTables.ts
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function run() {
  console.log('Updating notifications table...');
  const { error: eNotif } = await supabase.rpc('exec_sql', {
    sql: `
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'student_id') THEN
          ALTER TABLE notifications RENAME COLUMN student_id TO profile_id;
        END IF;
      END $$;
    `
  });
  if (eNotif) console.error('notifications update error:', eNotif.message);
  else console.log('notifications: OK');

  console.log('Creating companies table...');
  const { error: e1 } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS companies (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        name TEXT NOT NULL,
        description TEXT,
        requirements TEXT,
        arrival_date DATE,
        package_details TEXT,
        max_rounds INTEGER DEFAULT 5,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });
  if (e1) console.error('companies error:', e1.message);
  else console.log('companies: OK');

  console.log('Creating placement_selections table...');
  const { error: e2 } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS placement_selections (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        company_id BIGINT NOT NULL,
        student_id TEXT NOT NULL,
        round_number INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
        UNIQUE (company_id, student_id, round_number)
      );
    `
  });
  if (e2) console.error('placement_selections error:', e2.message);
  else console.log('placement_selections: OK');

  console.log('Done.');
}

run();
