const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'C:/Users/HP/OneDrive/Desktop/SE/Default-Layout/academic-erp/Course-Management/server/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function check() {
    const courseId = 'CS101';
    
    console.log("Fetching enrollments...");
    const { data: enrollments, error: enrollErr } = await supabase
        .from('enrollments')
        .select('*')
        .eq('course_id', courseId);
    console.log("Enrollments:", enrollments, enrollErr);

    console.log("Fetching students...");
    const { data: students, error: studErr } = await supabase
        .from('students')
        .select('*');
    console.log("Students total:", students?.length, studErr);

    console.log("Fetching joined query...");
    const { data: joined, error: joinedErr } = await supabase
        .from('enrollments')
        .select('students(name, email_id, student_id)')
        .eq('course_id', courseId);
    
    console.log("Joined:", JSON.stringify(joined, null, 2), joinedErr);
}

check();
