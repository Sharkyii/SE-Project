-- Academic ERP Database Schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'faculty', 'student')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Students Table
CREATE TABLE IF NOT EXISTS students (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    student_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email_id TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    semester INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Faculty Table
CREATE TABLE IF NOT EXISTS faculty (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id TEXT NOT NULL, -- Referenced as string in IFaculty
    email_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    designation TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    credits INTEGER NOT NULL,
    email_id TEXT NOT NULL, -- Refers to Faculty email_id
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (email_id) REFERENCES faculty(email_id) ON DELETE CASCADE
);

-- 5. Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    student_id TEXT NOT NULL,
    course_id TEXT NOT NULL, -- Refers to Course code
    semester INTEGER NOT NULL,
    academic_year INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(code) ON DELETE CASCADE
);

-- 6. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    student_id TEXT NOT NULL,
    course_id TEXT NOT NULL, -- Refers to Course code
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(code) ON DELETE CASCADE
);

-- 7. Grades Table
CREATE TABLE IF NOT EXISTS grades (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    student_id TEXT NOT NULL,
    course_id TEXT NOT NULL, -- Refers to Course code
    exam_type TEXT NOT NULL CHECK (exam_type IN ('mid', 'final', 'quiz', 'assignment')),
    score NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(code) ON DELETE CASCADE
);

-- 8. Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    student_id TEXT NOT NULL,
    email_id TEXT NOT NULL, -- Student email
    course_id TEXT NOT NULL, -- Refers to Course code
    semester INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(code) ON DELETE CASCADE
);


-- 9. Leaderboard Table
CREATE TABLE IF NOT EXISTS leaderboard (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    student_id TEXT NOT NULL,
    sgpa NUMERIC NOT NULL,
    cgpa NUMERIC NOT NULL,
    semester INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- 11. Fee Receipts Table
CREATE TABLE IF NOT EXISTS fee_receipts (
    id             BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    student_id     TEXT NOT NULL,
    fee_type       TEXT NOT NULL CHECK (fee_type IN ('mess', 'academic')),
    bank           TEXT NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('UPI', 'Net Banking', 'Debit Card', 'Credit Card')),
    file_url       TEXT NOT NULL,
    status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    uploaded_at    TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- 10. Timetables Table
CREATE TABLE IF NOT EXISTS timetables (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    course_id TEXT NOT NULL, -- Refers to Course code
    faculty_id TEXT NOT NULL, -- Refers to Faculty email_id
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

-- Alter Courses Table to add description and make email_id nullable
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'description') THEN
        ALTER TABLE courses ADD COLUMN description TEXT;
    END IF;

    ALTER TABLE courses ALTER COLUMN email_id DROP NOT NULL;
END $$;

