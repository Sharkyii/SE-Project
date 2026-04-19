-- ============================================
-- CLEAR ALL DATA (WARNING: This deletes everything!)
-- ============================================

-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Clear all tables in reverse dependency order
TRUNCATE TABLE public.anonymous_feedback CASCADE;
TRUNCATE TABLE public.attendance CASCADE;
TRUNCATE TABLE public.documents CASCADE;
TRUNCATE TABLE public.elective_enrollments CASCADE;
TRUNCATE TABLE public.enrollment_applications CASCADE;
TRUNCATE TABLE public.enrollments CASCADE;
TRUNCATE TABLE public.exam_timetables CASCADE;
TRUNCATE TABLE public.fee_receipts CASCADE;
TRUNCATE TABLE public.feedback CASCADE;
TRUNCATE TABLE public.grades CASCADE;
TRUNCATE TABLE public.leaderboard CASCADE;
TRUNCATE TABLE public.notifications CASCADE;
TRUNCATE TABLE public.quizzes CASCADE;
TRUNCATE TABLE public.student_documents CASCADE;
TRUNCATE TABLE public.student_registrations CASCADE;
TRUNCATE TABLE public.courses CASCADE;
TRUNCATE TABLE public.students CASCADE;
TRUNCATE TABLE public.faculty CASCADE;
TRUNCATE TABLE public.users CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- ============================================
-- INSERT DUMMY DATA
-- ============================================

-- 1. USERS (Admin, Faculty, Students)
-- Password for all: "password123" (hashed with bcrypt)
INSERT INTO public.users (email, password, role) VALUES
('admin@iiitg.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'admin'),
('faculty1@iiitg.ac.in', '$2b$10$kWzyNfxt8ugZu2IFPlWnLeGXiF4d9.npz3mXcRg60vg5K1mC.t1Ka', 'faculty'),
('faculty2@iiitg.ac.in', '$2b$10$59WnaC9Au3NhcWhwNy5qPeNOBCYEgvr9zjRbVgYnJoR7snLZDj29a', 'faculty'),
('faculty3@iiitg.ac.in', '$2b$10$iO3dZoyLDFyTrnS7AAf1MuMYcOy.fZ4LD4t31zLbAzGYsTH9qBHDG', 'faculty'),
('student1@iiitg.ac.in', '$2b$10$VKkI.i2s2dhFEA8mtkAhDOEZiLyuFsXxaG4ZDd2S6ChUWICLzkJIy', 'student'),
('student2@iiitg.ac.in', '$2b$10$vVxfcq77ARYSHOSe9H7Y6.NP6VBl5tDwp/Yc6PuFQNR4K1C83fXPm', 'student'),
('student3@iiitg.ac.in', '$2b$10$xonUCzueG/Ae1vJeRzHxveFagfB7SclzYhpKRtnbxBUqc4NpQzcxy', 'student'),
('student4@iiitg.ac.in', '$2b$10$nZvRbsfDmOK.Y9oMkBZDveyiUZOW1u/tyDqG.8u1.tjcMEtsvmMri', 'student'),
('student5@iiitg.ac.in', '$2b$10$td.WGwg5cX2hJS2OU9hlReMo9KdK2UuT4n2jQMd56.7kudF25ql0C', 'student');

-- 2. FACULTY
INSERT INTO public.faculty (user_id, email_id, name, department, designation, branch) VALUES
('faculty1', 'faculty1@iiitg.ac.in', 'Dr. Rajesh Kumar', 'Computer Science', 'Professor', 'CSE'),
('faculty2', 'faculty2@iiitg.ac.in', 'Dr. Priya Sharma', 'Computer Science', 'Associate Professor', 'CSE'),
('faculty3', 'faculty3@iiitg.ac.in', 'Dr. Amit Patel', 'Electronics', 'Assistant Professor', 'ECE');

-- 3. COURSES
INSERT INTO public.courses (name, code, credits, email_id, description, is_elective, max_seats, elective_semester) VALUES
-- Core Courses
('Data Structures and Algorithms', 'CS201', 4, 'faculty1@iiitg.ac.in', 'Fundamental data structures and algorithms', false, 60, NULL),
('Database Management Systems', 'CS301', 4, 'faculty2@iiitg.ac.in', 'Relational databases, SQL, and database design', false, 60, NULL),
('Operating Systems', 'CS302', 4, 'faculty1@iiitg.ac.in', 'Process management, memory management, file systems', false, 60, NULL),
('Computer Networks', 'CS303', 3, 'faculty2@iiitg.ac.in', 'Network protocols, TCP/IP, network security', false, 60, NULL),
('Software Engineering', 'CS304', 3, 'faculty1@iiitg.ac.in', 'Software development lifecycle, design patterns', false, 60, NULL),
-- Elective Courses
('Machine Learning', 'CS401', 4, 'faculty2@iiitg.ac.in', 'Supervised and unsupervised learning algorithms', true, 30, 7),
('Artificial Intelligence', 'CS402', 4, 'faculty1@iiitg.ac.in', 'AI techniques, search algorithms, knowledge representation', true, 30, 7),
('Cloud Computing', 'CS403', 3, 'faculty2@iiitg.ac.in', 'Cloud architecture, AWS, Azure, deployment strategies', true, 30, 7),
('Blockchain Technology', 'CS404', 3, 'faculty1@iiitg.ac.in', 'Distributed ledger, smart contracts, cryptocurrency', true, 30, 7),
('Cyber Security', 'CS405', 3, 'faculty3@iiitg.ac.in', 'Network security, cryptography, ethical hacking', true, 30, 7);

-- 4. STUDENTS
INSERT INTO public.students (student_id, name, email_id, department, semester, fees_status, fees_amount, branch, section) VALUES
('2021CSE001', 'Rahul Verma', 'student1@iiitg.ac.in', 'Computer Science', 5, 'paid', 75000, 'CSE', 'A'),
('2021CSE002', 'Sneha Gupta', 'student2@iiitg.ac.in', 'Computer Science', 5, 'paid', 75000, 'CSE', 'A'),
('2021CSE003', 'Arjun Singh', 'student3@iiitg.ac.in', 'Computer Science', 5, 'pending', 75000, 'CSE', 'B'),
('2021CSE004', 'Priya Reddy', 'student4@iiitg.ac.in', 'Computer Science', 5, 'paid', 75000, 'CSE', 'A'),
('2021CSE005', 'Vikram Joshi', 'student5@iiitg.ac.in', 'Computer Science', 5, 'paid', 75000, 'CSE', 'B');

-- 5. ENROLLMENTS (Core Courses)
INSERT INTO public.enrollments (student_id, course_id, semester, academic_year) VALUES
-- Student 1
('2021CSE001', 'CS201', 5, 2024),
('2021CSE001', 'CS301', 5, 2024),
('2021CSE001', 'CS302', 5, 2024),
('2021CSE001', 'CS303', 5, 2024),
-- Student 2
('2021CSE002', 'CS201', 5, 2024),
('2021CSE002', 'CS301', 5, 2024),
('2021CSE002', 'CS302', 5, 2024),
('2021CSE002', 'CS304', 5, 2024),
-- Student 3
('2021CSE003', 'CS201', 5, 2024),
('2021CSE003', 'CS301', 5, 2024),
('2021CSE003', 'CS303', 5, 2024),
-- Student 4
('2021CSE004', 'CS201', 5, 2024),
('2021CSE004', 'CS302', 5, 2024),
('2021CSE004', 'CS303', 5, 2024),
('2021CSE004', 'CS304', 5, 2024),
-- Student 5
('2021CSE005', 'CS201', 5, 2024),
('2021CSE005', 'CS301', 5, 2024),
('2021CSE005', 'CS302', 5, 2024);

-- 6. ELECTIVE ENROLLMENTS
INSERT INTO public.elective_enrollments (student_id, course_id, semester, academic_year) VALUES
('2021CSE001', 'CS401', 7, 2024),
('2021CSE002', 'CS402', 7, 2024),
('2021CSE003', 'CS403', 7, 2024),
('2021CSE004', 'CS401', 7, 2024),
('2021CSE005', 'CS404', 7, 2024);

-- 7. ATTENDANCE (Sample data for last 10 days)
INSERT INTO public.attendance (student_id, course_id, date, status) VALUES
-- Last 10 days for Student 1, Course CS201
('2021CSE001', 'CS201', CURRENT_DATE - INTERVAL '9 days', 'present'),
('2021CSE001', 'CS201', CURRENT_DATE - INTERVAL '8 days', 'present'),
('2021CSE001', 'CS201', CURRENT_DATE - INTERVAL '7 days', 'absent'),
('2021CSE001', 'CS201', CURRENT_DATE - INTERVAL '6 days', 'present'),
('2021CSE001', 'CS201', CURRENT_DATE - INTERVAL '5 days', 'present'),
('2021CSE001', 'CS201', CURRENT_DATE - INTERVAL '4 days', 'present'),
('2021CSE001', 'CS201', CURRENT_DATE - INTERVAL '3 days', 'present'),
('2021CSE001', 'CS201', CURRENT_DATE - INTERVAL '2 days', 'absent'),
('2021CSE001', 'CS201', CURRENT_DATE - INTERVAL '1 day', 'present'),
('2021CSE001', 'CS201', CURRENT_DATE, 'present'),
-- Student 2, Course CS301
('2021CSE002', 'CS301', CURRENT_DATE - INTERVAL '5 days', 'present'),
('2021CSE002', 'CS301', CURRENT_DATE - INTERVAL '4 days', 'present'),
('2021CSE002', 'CS301', CURRENT_DATE - INTERVAL '3 days', 'present'),
('2021CSE002', 'CS301', CURRENT_DATE - INTERVAL '2 days', 'present'),
('2021CSE002', 'CS301', CURRENT_DATE - INTERVAL '1 day', 'absent');

-- 8. GRADES
INSERT INTO public.grades (student_id, course_id, exam_type, score, status) VALUES
-- Student 1
('2021CSE001', 'CS201', 'mid', 85, 'published'),
('2021CSE001', 'CS201', 'quiz', 90, 'published'),
('2021CSE001', 'CS301', 'mid', 78, 'published'),
('2021CSE001', 'CS302', 'assignment', 88, 'published'),
-- Student 2
('2021CSE002', 'CS201', 'mid', 92, 'published'),
('2021CSE002', 'CS301', 'mid', 85, 'published'),
('2021CSE002', 'CS302', 'quiz', 95, 'published'),
-- Student 3
('2021CSE003', 'CS201', 'mid', 75, 'pending'),
('2021CSE003', 'CS301', 'mid', 80, 'published');

-- 9. EXAM TIMETABLE
INSERT INTO public.exam_timetables (course_id, exam_type, exam_date, start_time, end_time, room_no, semester, department, section) VALUES
('CS201', 'final', CURRENT_DATE + INTERVAL '15 days', '09:00:00', '12:00:00', 'Room 301', 5, 'Computer Science', 'A'),
('CS301', 'final', CURRENT_DATE + INTERVAL '17 days', '14:00:00', '17:00:00', 'Room 302', 5, 'Computer Science', 'A'),
('CS302', 'final', CURRENT_DATE + INTERVAL '19 days', '09:00:00', '12:00:00', 'Room 303', 5, 'Computer Science', 'A'),
('CS303', 'final', CURRENT_DATE + INTERVAL '21 days', '14:00:00', '17:00:00', 'Room 301', 5, 'Computer Science', 'A'),
('CS304', 'final', CURRENT_DATE + INTERVAL '23 days', '09:00:00', '12:00:00', 'Room 302', 5, 'Computer Science', 'A');

-- 10. FEE RECEIPTS
INSERT INTO public.fee_receipts (student_id, fee_type, bank, payment_method, file_url, status) VALUES
('2021CSE001', 'academic', 'SBI', 'UPI', 'https://example.com/receipt1.pdf', 'approved'),
('2021CSE002', 'academic', 'HDFC', 'Net Banking', 'https://example.com/receipt2.pdf', 'approved'),
('2021CSE003', 'academic', 'ICICI', 'Debit Card', 'https://example.com/receipt3.pdf', 'pending'),
('2021CSE004', 'mess', 'SBI', 'UPI', 'https://example.com/receipt4.pdf', 'approved');

-- 11. NOTIFICATIONS
INSERT INTO public.notifications (student_id, message, read_status) VALUES
('2021CSE001', 'Your mid-term exam results have been published', false),
('2021CSE001', 'Fee payment deadline is approaching', true),
('2021CSE002', 'New assignment uploaded for CS301', false),
('2021CSE003', 'Your attendance is below 75% in CS201', false),
('2021CSE004', 'Elective course registration is now open', false);

-- 12. QUIZZES
INSERT INTO public.quizzes (course_id, faculty_id, title, description, due_date) VALUES
('CS201', 'faculty1@iiitg.ac.in', 'Quiz 1: Arrays and Linked Lists', 'Basic data structures quiz', CURRENT_DATE + INTERVAL '7 days'),
('CS301', 'faculty2@iiitg.ac.in', 'Quiz 2: SQL Queries', 'Database query writing quiz', CURRENT_DATE + INTERVAL '10 days'),
('CS302', 'faculty1@iiitg.ac.in', 'Quiz 3: Process Scheduling', 'Operating systems concepts', CURRENT_DATE + INTERVAL '12 days');

-- 13. FEEDBACK
INSERT INTO public.feedback (student_id, email_id, course_id, semester, rating, comments) VALUES
('2021CSE001', 'faculty1@iiitg.ac.in', 'CS201', 5, 5, 'Excellent teaching and clear explanations'),
('2021CSE002', 'faculty2@iiitg.ac.in', 'CS301', 5, 4, 'Good course content, could use more examples'),
('2021CSE003', 'faculty1@iiitg.ac.in', 'CS302', 5, 5, 'Very engaging lectures');

-- 14. LEADERBOARD
INSERT INTO public.leaderboard (student_id, sgpa, cgpa, semester) VALUES
('2021CSE001', 8.5, 8.3, 5),
('2021CSE002', 9.2, 8.9, 5),
('2021CSE003', 7.8, 7.6, 5),
('2021CSE004', 8.1, 8.0, 5),
('2021CSE005', 8.7, 8.4, 5);

-- 15. ENROLLMENT APPLICATIONS (Pending applications)
INSERT INTO public.enrollment_applications (full_name, email, phone, date_of_birth, gender, department, semester, section, address, guardian_name, guardian_phone, status) VALUES
('Amit Kumar', 'amit.kumar@example.com', '9876543210', '2003-05-15', 'male', 'Computer Science', 1, 'A', '123 Main St, Delhi', 'Mr. Kumar', '9876543211', 'pending'),
('Neha Sharma', 'neha.sharma@example.com', '9876543212', '2003-08-20', 'female', 'Computer Science', 1, 'A', '456 Park Ave, Mumbai', 'Mrs. Sharma', '9876543213', 'approved');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check data counts
SELECT 'users' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'faculty', COUNT(*) FROM public.faculty
UNION ALL
SELECT 'students', COUNT(*) FROM public.students
UNION ALL
SELECT 'courses', COUNT(*) FROM public.courses
UNION ALL
SELECT 'enrollments', COUNT(*) FROM public.enrollments
UNION ALL
SELECT 'attendance', COUNT(*) FROM public.attendance
UNION ALL
SELECT 'grades', COUNT(*) FROM public.grades
UNION ALL
SELECT 'notifications', COUNT(*) FROM public.notifications;

-- ============================================
-- LOGIN CREDENTIALS FOR TESTING
-- ============================================

/*
ADMIN:
Email: admin@iiitg.ac.in
Password: password123

FACULTY:
Email: faculty1@iiitg.ac.in
Password: password123

Email: faculty2@iiitg.ac.in
Password: password123

STUDENTS:
Email: student1@iiitg.ac.in
Password: password123

Email: student2@iiitg.ac.in
Password: password123

Email: student3@iiitg.ac.in
Password: password123

Note: All passwords are "password123"
You'll need to hash them properly with bcrypt in your application
*/
