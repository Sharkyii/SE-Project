import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function run() {
  console.log('Creating timetables table...');
  const { error: e1 } = await supabase.rpc('exec_sql', {
    sql: `
    CREATE TABLE IF NOT EXISTS timetables (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        course_id TEXT NOT NULL, 
        faculty_id TEXT NOT NULL, 
        day TEXT NOT NULL CHECK (day IN ('Mon', 'Tue', 'Wed', 'Thu', 'Fri')),
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        semester INTEGER NOT NULL,
        department TEXT NOT NULL,
        section TEXT NOT NULL,
        room_no TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (course_id) REFERENCES courses(code) ON DELETE CASCADE,
        FOREIGN KEY (faculty_id) REFERENCES faculty(email_id) ON DELETE CASCADE
    );
    NOTIFY pgrst, 'reload schema';
    `
  });
  if (e1) console.error('Error:', e1.message);
  else console.log('timetables: OK');
}

run();
