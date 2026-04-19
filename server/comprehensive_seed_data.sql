-- ============================================
-- COMPREHENSIVE SEED DATA FOR IIIT GWALIOR ERP
-- ============================================
-- Password for all users: "password123"
-- Hash: $2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC
-- ============================================

-- CLEAR ALL DATA
SET session_replication_role = 'replica';
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
SET session_replication_role = 'origin';

-- ============================================
-- 1. USERS (1 Admin + 10 Faculty + 25 Students)
-- ============================================
INSERT INTO public.users (email, password, role) VALUES
-- Admin
('admin@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'admin'),
-- Faculty (10)
('rajesh.kumar@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'faculty'),
('priya.sharma@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'faculty'),
('amit.patel@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'faculty'),
('neha.singh@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'faculty'),
('vikram.mehta@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'faculty'),
('anjali.verma@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'faculty'),
('rahul.gupta@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'faculty'),
('kavita.reddy@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'faculty'),
('suresh.kumar@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'faculty'),
('deepak.joshi@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'faculty');

-- Students - Batch 2021 (Semester 6)
INSERT INTO public.users (email, password, role) VALUES
('rahul.verma.2021@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student'),
('sneha.gupta.2021@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student'),
('arjun.singh.2021@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student'),
('priya.reddy.2021@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student'),
('vikram.joshi.2021@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student'),
-- Batch 2022 (Semester 4)
('ananya.sharma.2022@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student'),
('rohan.kumar.2022@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student'),
('ishita.patel.2022@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student'),
('aditya.mehta.2022@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student'),
('pooja.singh.2022@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student'),
-- Batch 2023 (Semester 2)
('karan.verma.2023@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student'),
('nisha.gupta.2023@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student'),
('siddharth.reddy.2023@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student'),
('tanvi.joshi.2023@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student'),
('harsh.kumar.2023@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student'),
-- Batch 2024 (Semester 1 - New admissions)
('riya.sharma.2024@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student'),
('amit.singh.2024@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student'),
('divya.patel.2024@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student'),
('nikhil.mehta.2024@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student'),
('sakshi.verma.2024@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student'),
('varun.gupta.2024@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student'),
('meera.reddy.2024@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student'),
('aryan.joshi.2024@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student'),
('tanya.kumar.2024@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student'),
('rohit.sharma.2024@iiitm.ac.in', '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC', 'student');

-- ============================================
-- 2. FACULTY (10 members teaching different courses)
-- ============================================
INSERT INTO public.faculty (user_id, email_id, name, department, designation, branch) VALUES
('rajesh.kumar@iiitm.ac.in', 'rajesh.kumar@iiitm.ac.in', 'Dr. Rajesh Kumar', 'Computer Science', 'Professor', 'CSE'),
('priya.sharma@iiitm.ac.in', 'priya.sharma@iiitm.ac.in', 'Dr. Priya Sharma', 'Computer Science', 'Associate Professor', 'CSE'),
('amit.patel@iiitm.ac.in', 'amit.patel@iiitm.ac.in', 'Dr. Amit Patel', 'Electronics', 'Assistant Professor', 'ECE'),
('neha.singh@iiitm.ac.in', 'neha.singh@iiitm.ac.in', 'Dr. Neha Singh', 'Computer Science', 'Associate Professor', 'CSE'),
('vikram.mehta@iiitm.ac.in', 'vikram.mehta@iiitm.ac.in', 'Dr. Vikram Mehta', 'Information Technology', 'Professor', 'IT'),
('anjali.verma@iiitm.ac.in', 'anjali.verma@iiitm.ac.in', 'Dr. Anjali Verma', 'Computer Science', 'Assistant Professor', 'CSE'),
('rahul.gupta@iiitm.ac.in', 'rahul.gupta@iiitm.ac.in', 'Dr. Rahul Gupta', 'Electronics', 'Associate Professor', 'ECE'),
('kavita.reddy@iiitm.ac.in', 'kavita.reddy@iiitm.ac.in', 'Dr. Kavita Reddy', 'Computer Science', 'Professor', 'CSE'),
('suresh.kumar@iiitm.ac.in', 'suresh.kumar@iiitm.ac.in', 'Dr. Suresh Kumar', 'Information Technology', 'Assistant Professor', 'IT'),
('deepak.joshi@iiitm.ac.in', 'deepak.joshi@iiitm.ac.in', 'Dr. Deepak Joshi', 'Computer Science', 'Associate Professor', 'CSE');

-- ============================================
-- 3. COURSES (15 courses - Core + Electives)
-- ============================================
INSERT INTO public.courses (name, code, credits, email_id, description, is_elective, max_seats, elective_semester) VALUES
-- Core Courses
('Programming Fundamentals', 'CS101', 4, 'rajesh.kumar@iiitm.ac.in', 'Introduction to programming with C/C++', false, 60, NULL),
('Data Structures and Algorithms', 'CS201', 4, 'priya.sharma@iiitm.ac.in', 'Fundamental data structures and algorithms', false, 60, NULL),
('Database Management Systems', 'CS301', 4, 'neha.singh@iiitm.ac.in', 'Relational databases, SQL, and database design', false, 60, NULL),
('Operating Systems', 'CS302', 4, 'rajesh.kumar@iiitm.ac.in', 'Process management, memory management, file systems', false, 60, NULL),
('Computer Networks', 'CS303', 3, 'vikram.mehta@iiitm.ac.in', 'Network protocols, TCP/IP, network security', false, 60, NULL),
('Software Engineering', 'CS304', 3, 'anjali.verma@iiitm.ac.in', 'Software development lifecycle, design patterns', false, 60, NULL),
('Theory of Computation', 'CS305', 3, 'kavita.reddy@iiitm.ac.in', 'Automata, formal languages, computability', false, 60, NULL),
('Computer Architecture', 'CS306', 4, 'amit.patel@iiitm.ac.in', 'CPU design, memory hierarchy, I/O systems', false, 60, NULL),
('Discrete Mathematics', 'CS102', 4, 'deepak.joshi@iiitm.ac.in', 'Logic, sets, relations, graph theory', false, 60, NULL),
('Object Oriented Programming', 'CS202', 4, 'suresh.kumar@iiitm.ac.in', 'OOP concepts with Java', false, 60, NULL),
-- Elective Courses
('Machine Learning', 'CS401', 4, 'priya.sharma@iiitm.ac.in', 'Supervised and unsupervised learning algorithms', true, 40, 7),
('Artificial Intelligence', 'CS402', 4, 'kavita.reddy@iiitm.ac.in', 'AI techniques, search algorithms, knowledge representation', true, 40, 7),
('Cloud Computing', 'CS403', 3, 'vikram.mehta@iiitm.ac.in', 'Cloud architecture, AWS, Azure, deployment strategies', true, 40, 7),
('Blockchain Technology', 'CS404', 3, 'neha.singh@iiitm.ac.in', 'Distributed ledger, smart contracts, cryptocurrency', true, 40, 7),
('Cyber Security', 'CS405', 3, 'rahul.gupta@iiitm.ac.in', 'Network security, cryptography, ethical hacking', true, 40, 7);

-- ============================================
-- 4. STUDENTS (25 students across 4 batches)
-- ============================================
INSERT INTO public.students (student_id, name, email_id, department, semester, fees_status, fees_amount, branch, section) VALUES
-- Batch 2021 (Semester 6) - 5 students
('2021CSE001', 'Rahul Verma', 'rahul.verma.2021@iiitm.ac.in', 'Computer Science', 6, 'paid', 75000, 'CSE', 'A'),
('2021CSE002', 'Sneha Gupta', 'sneha.gupta.2021@iiitm.ac.in', 'Computer Science', 6, 'paid', 75000, 'CSE', 'A'),
('2021CSE003', 'Arjun Singh', 'arjun.singh.2021@iiitm.ac.in', 'Computer Science', 6, 'paid', 75000, 'CSE', 'B'),
('2021CSE004', 'Priya Reddy', 'priya.reddy.2021@iiitm.ac.in', 'Computer Science', 6, 'paid', 75000, 'CSE', 'A'),
('2021CSE005', 'Vikram Joshi', 'vikram.joshi.2021@iiitm.ac.in', 'Computer Science', 6, 'paid', 75000, 'CSE', 'B'),
-- Batch 2022 (Semester 4) - 5 students
('2022CSE001', 'Ananya Sharma', 'ananya.sharma.2022@iiitm.ac.in', 'Computer Science', 4, 'paid', 75000, 'CSE', 'A'),
('2022CSE002', 'Rohan Kumar', 'rohan.kumar.2022@iiitm.ac.in', 'Computer Science', 4, 'paid', 75000, 'CSE', 'A'),
('2022CSE003', 'Ishita Patel', 'ishita.patel.2022@iiitm.ac.in', 'Computer Science', 4, 'pending', 75000, 'CSE', 'B'),
('2022CSE004', 'Aditya Mehta', 'aditya.mehta.2022@iiitm.ac.in', 'Computer Science', 4, 'paid', 75000, 'CSE', 'A'),
('2022CSE005', 'Pooja Singh', 'pooja.singh.2022@iiitm.ac.in', 'Computer Science', 4, 'paid', 75000, 'CSE', 'B'),
-- Batch 2023 (Semester 2) - 5 students
('2023CSE001', 'Karan Verma', 'karan.verma.2023@iiitm.ac.in', 'Computer Science', 2, 'paid', 75000, 'CSE', 'A'),
('2023CSE002', 'Nisha Gupta', 'nisha.gupta.2023@iiitm.ac.in', 'Computer Science', 2, 'paid', 75000, 'CSE', 'A'),
('2023CSE003', 'Siddharth Reddy', 'siddharth.reddy.2023@iiitm.ac.in', 'Computer Science', 2, 'paid', 75000, 'CSE', 'B'),
('2023CSE004', 'Tanvi Joshi', 'tanvi.joshi.2023@iiitm.ac.in', 'Computer Science', 2, 'pending', 75000, 'CSE', 'A'),
('2023CSE005', 'Harsh Kumar', 'harsh.kumar.2023@iiitm.ac.in', 'Computer Science', 2, 'paid', 75000, 'CSE', 'B'),
-- Batch 2024 (Semester 1) - 10 students
('2024CSE001', 'Riya Sharma', 'riya.sharma.2024@iiitm.ac.in', 'Computer Science', 1, 'paid', 75000, 'CSE', 'A'),
('2024CSE002', 'Amit Singh', 'amit.singh.2024@iiitm.ac.in', 'Computer Science', 1, 'paid', 75000, 'CSE', 'A'),
('2024CSE003', 'Divya Patel', 'divya.patel.2024@iiitm.ac.in', 'Computer Science', 1, 'pending', 75000, 'CSE', 'B'),
('2024CSE004', 'Nikhil Mehta', 'nikhil.mehta.2024@iiitm.ac.in', 'Computer Science', 1, 'paid', 75000, 'CSE', 'A'),
('2024CSE005', 'Sakshi Verma', 'sakshi.verma.2024@iiitm.ac.in', 'Computer Science', 1, 'paid', 75000, 'CSE', 'B'),
('2024CSE006', 'Varun Gupta', 'varun.gupta.2024@iiitm.ac.in', 'Computer Science', 1, 'paid', 75000, 'CSE', 'A'),
('2024CSE007', 'Meera Reddy', 'meera.reddy.2024@iiitm.ac.in', 'Computer Science', 1, 'paid', 75000, 'CSE', 'B'),
('2024CSE008', 'Aryan Joshi', 'aryan.joshi.2024@iiitm.ac.in', 'Computer Science', 1, 'pending', 75000, 'CSE', 'A'),
('2024CSE009', 'Tanya Kumar', 'tanya.kumar.2024@iiitm.ac.in', 'Computer Science', 1, 'paid', 75000, 'CSE', 'B'),
('2024CSE010', 'Rohit Sharma', 'rohit.sharma.2024@iiitm.ac.in', 'Computer Science', 1, 'paid', 75000, 'CSE', 'A');

-- ============================================
-- 5. ENROLLMENTS - Students enrolled in courses based on semester
-- ============================================
-- Batch 2021 (Semester 6) - Advanced courses
INSERT INTO public.enrollments (student_id, course_id, semester, academic_year) VALUES
-- Student 2021CSE001
('2021CSE001', 'CS301', 6, 2024), ('2021CSE001', 'CS302', 6, 2024), ('2021CSE001', 'CS303', 6, 2024), ('2021CSE001', 'CS304', 6, 2024),
-- Student 2021CSE002
('2021CSE002', 'CS301', 6, 2024), ('2021CSE002', 'CS302', 6, 2024), ('2021CSE002', 'CS303', 6, 2024), ('2021CSE002', 'CS305', 6, 2024),
-- Student 2021CSE003
('2021CSE003', 'CS301', 6, 2024), ('2021CSE003', 'CS302', 6, 2024), ('2021CSE003', 'CS304', 6, 2024), ('2021CSE003', 'CS306', 6, 2024),
-- Student 2021CSE004
('2021CSE004', 'CS301', 6, 2024), ('2021CSE004', 'CS303', 6, 2024), ('2021CSE004', 'CS304', 6, 2024), ('2021CSE004', 'CS305', 6, 2024),
-- Student 2021CSE005
('2021CSE005', 'CS302', 6, 2024), ('2021CSE005', 'CS303', 6, 2024), ('2021CSE005', 'CS304', 6, 2024), ('2021CSE005', 'CS306', 6, 2024);

-- Batch 2022 (Semester 4) - Mid-level courses
INSERT INTO public.enrollments (student_id, course_id, semester, academic_year) VALUES
('2022CSE001', 'CS201', 4, 2024), ('2022CSE001', 'CS202', 4, 2024), ('2022CSE001', 'CS301', 4, 2024), ('2022CSE001', 'CS302', 4, 2024),
('2022CSE002', 'CS201', 4, 2024), ('2022CSE002', 'CS202', 4, 2024), ('2022CSE002', 'CS301', 4, 2024), ('2022CSE002', 'CS303', 4, 2024),
('2022CSE003', 'CS201', 4, 2024), ('2022CSE003', 'CS202', 4, 2024), ('2022CSE003', 'CS302', 4, 2024), ('2022CSE003', 'CS303', 4, 2024),
('2022CSE004', 'CS201', 4, 2024), ('2022CSE004', 'CS202', 4, 2024), ('2022CSE004', 'CS301', 4, 2024), ('2022CSE004', 'CS304', 4, 2024),
('2022CSE005', 'CS201', 4, 2024), ('2022CSE005', 'CS202', 4, 2024), ('2022CSE005', 'CS302', 4, 2024), ('2022CSE005', 'CS304', 4, 2024);

-- Batch 2023 (Semester 2) - Foundation courses
INSERT INTO public.enrollments (student_id, course_id, semester, academic_year) VALUES
('2023CSE001', 'CS101', 2, 2024), ('2023CSE001', 'CS102', 2, 2024), ('2023CSE001', 'CS201', 2, 2024), ('2023CSE001', 'CS202', 2, 2024),
('2023CSE002', 'CS101', 2, 2024), ('2023CSE002', 'CS102', 2, 2024), ('2023CSE002', 'CS201', 2, 2024), ('2023CSE002', 'CS202', 2, 2024),
('2023CSE003', 'CS101', 2, 2024), ('2023CSE003', 'CS102', 2, 2024), ('2023CSE003', 'CS201', 2, 2024), ('2023CSE003', 'CS202', 2, 2024),
('2023CSE004', 'CS101', 2, 2024), ('2023CSE004', 'CS102', 2, 2024), ('2023CSE004', 'CS201', 2, 2024), ('2023CSE004', 'CS202', 2, 2024),
('2023CSE005', 'CS101', 2, 2024), ('2023CSE005', 'CS102', 2, 2024), ('2023CSE005', 'CS201', 2, 2024), ('2023CSE005', 'CS202', 2, 2024);

-- Batch 2024 (Semester 1) - First semester
INSERT INTO public.enrollments (student_id, course_id, semester, academic_year) VALUES
('2024CSE001', 'CS101', 1, 2024), ('2024CSE001', 'CS102', 1, 2024),
('2024CSE002', 'CS101', 1, 2024), ('2024CSE002', 'CS102', 1, 2024),
('2024CSE003', 'CS101', 1, 2024), ('2024CSE003', 'CS102', 1, 2024),
('2024CSE004', 'CS101', 1, 2024), ('2024CSE004', 'CS102', 1, 2024),
('2024CSE005', 'CS101', 1, 2024), ('2024CSE005', 'CS102', 1, 2024),
('2024CSE006', 'CS101', 1, 2024), ('2024CSE006', 'CS102', 1, 2024),
('2024CSE007', 'CS101', 1, 2024), ('2024CSE007', 'CS102', 1, 2024),
('2024CSE008', 'CS101', 1, 2024), ('2024CSE008', 'CS102', 1, 2024),
('2024CSE009', 'CS101', 1, 2024), ('2024CSE009', 'CS102', 1, 2024),
('2024CSE010', 'CS101', 1, 2024), ('2024CSE010', 'CS102', 1, 2024);

-- ============================================
-- 6. ELECTIVE ENROLLMENTS (Batch 2021 only)
-- ============================================
INSERT INTO public.elective_enrollments (student_id, course_id, semester, academic_year) VALUES
('2021CSE001', 'CS401', 7, 2024),
('2021CSE002', 'CS402', 7, 2024),
('2021CSE003', 'CS403', 7, 2024),
('2021CSE004', 'CS401', 7, 2024),
('2021CSE005', 'CS404', 7, 2024);

-- ============================================
-- 7. GRADES - Complete grade data for CGPA calculation
-- ============================================
-- Batch 2021 (Semester 6) - All previous semesters grades
INSERT INTO public.grades (student_id, course_id, exam_type, score, status) VALUES
-- 2021CSE001 - Excellent student (CGPA ~9.0)
('2021CSE001', 'CS301', 'mid', 92, 'published'), ('2021CSE001', 'CS301', 'final', 95, 'published'),
('2021CSE001', 'CS302', 'mid', 88, 'published'), ('2021CSE001', 'CS302', 'final', 90, 'published'),
('2021CSE001', 'CS303', 'mid', 90, 'published'), ('2021CSE001', 'CS303', 'final', 93, 'published'),
('2021CSE001', 'CS304', 'mid', 87, 'published'), ('2021CSE001', 'CS304', 'final', 89, 'published'),
-- 2021CSE002 - Very good student (CGPA ~8.5)
('2021CSE002', 'CS301', 'mid', 85, 'published'), ('2021CSE002', 'CS301', 'final', 88, 'published'),
('2021CSE002', 'CS302', 'mid', 82, 'published'), ('2021CSE002', 'CS302', 'final', 86, 'published'),
('2021CSE002', 'CS303', 'mid', 84, 'published'), ('2021CSE002', 'CS303', 'final', 87, 'published'),
('2021CSE002', 'CS305', 'mid', 83, 'published'), ('2021CSE002', 'CS305', 'final', 85, 'published'),
-- 2021CSE003 - Good student (CGPA ~7.8)
('2021CSE003', 'CS301', 'mid', 75, 'published'), ('2021CSE003', 'CS301', 'final', 78, 'published'),
('2021CSE003', 'CS302', 'mid', 76, 'published'), ('2021CSE003', 'CS302', 'final', 79, 'published'),
('2021CSE003', 'CS304', 'mid', 74, 'published'), ('2021CSE003', 'CS304', 'final', 77, 'published'),
('2021CSE003', 'CS306', 'mid', 75, 'published'), ('2021CSE003', 'CS306', 'final', 80, 'published'),
-- 2021CSE004 - Very good student (CGPA ~8.2)
('2021CSE004', 'CS301', 'mid', 80, 'published'), ('2021CSE004', 'CS301', 'final', 84, 'published'),
('2021CSE004', 'CS303', 'mid', 82, 'published'), ('2021CSE004', 'CS303', 'final', 85, 'published'),
('2021CSE004', 'CS304', 'mid', 81, 'published'), ('2021CSE004', 'CS304', 'final', 83, 'published'),
('2021CSE004', 'CS305', 'mid', 79, 'published'), ('2021CSE004', 'CS305', 'final', 82, 'published'),
-- 2021CSE005 - Excellent student (CGPA ~8.7)
('2021CSE005', 'CS302', 'mid', 86, 'published'), ('2021CSE005', 'CS302', 'final', 89, 'published'),
('2021CSE005', 'CS303', 'mid', 87, 'published'), ('2021CSE005', 'CS303', 'final', 90, 'published'),
('2021CSE005', 'CS304', 'mid', 85, 'published'), ('2021CSE005', 'CS304', 'final', 88, 'published'),
('2021CSE005', 'CS306', 'mid', 86, 'published'), ('2021CSE005', 'CS306', 'final', 89, 'published');

-- Batch 2022 (Semester 4)
INSERT INTO public.grades (student_id, course_id, exam_type, score, status) VALUES
-- 2022CSE001 (CGPA ~8.8)
('2022CSE001', 'CS201', 'mid', 88, 'published'), ('2022CSE001', 'CS201', 'final', 91, 'published'),
('2022CSE001', 'CS202', 'mid', 87, 'published'), ('2022CSE001', 'CS202', 'final', 90, 'published'),
('2022CSE001', 'CS301', 'mid', 86, 'published'), ('2022CSE001', 'CS301', 'final', 89, 'published'),
('2022CSE001', 'CS302', 'mid', 85, 'published'), ('2022CSE001', 'CS302', 'final', 88, 'published'),
-- 2022CSE002 (CGPA ~8.3)
('2022CSE002', 'CS201', 'mid', 82, 'published'), ('2022CSE002', 'CS201', 'final', 85, 'published'),
('2022CSE002', 'CS202', 'mid', 81, 'published'), ('2022CSE002', 'CS202', 'final', 84, 'published'),
('2022CSE002', 'CS301', 'mid', 83, 'published'), ('2022CSE002', 'CS301', 'final', 86, 'published'),
('2022CSE002', 'CS303', 'mid', 82, 'published'), ('2022CSE002', 'CS303', 'final', 85, 'published'),
-- 2022CSE003 (CGPA ~7.5)
('2022CSE003', 'CS201', 'mid', 72, 'published'), ('2022CSE003', 'CS201', 'final', 75, 'published'),
('2022CSE003', 'CS202', 'mid', 73, 'published'), ('2022CSE003', 'CS202', 'final', 76, 'published'),
('2022CSE003', 'CS302', 'mid', 74, 'published'), ('2022CSE003', 'CS302', 'final', 77, 'published'),
('2022CSE003', 'CS303', 'mid', 73, 'published'), ('2022CSE003', 'CS303', 'final', 76, 'published'),
-- 2022CSE004 (CGPA ~8.6)
('2022CSE004', 'CS201', 'mid', 85, 'published'), ('2022CSE004', 'CS201', 'final', 88, 'published'),
('2022CSE004', 'CS202', 'mid', 86, 'published'), ('2022CSE004', 'CS202', 'final', 89, 'published'),
('2022CSE004', 'CS301', 'mid', 84, 'published'), ('2022CSE004', 'CS301', 'final', 87, 'published'),
('2022CSE004', 'CS304', 'mid', 85, 'published'), ('2022CSE004', 'CS304', 'final', 88, 'published'),
-- 2022CSE005 (CGPA ~7.9)
('2022CSE005', 'CS201', 'mid', 77, 'published'), ('2022CSE005', 'CS201', 'final', 80, 'published'),
('2022CSE005', 'CS202', 'mid', 78, 'published'), ('2022CSE005', 'CS202', 'final', 81, 'published'),
('2022CSE005', 'CS302', 'mid', 76, 'published'), ('2022CSE005', 'CS302', 'final', 79, 'published'),
('2022CSE005', 'CS304', 'mid', 77, 'published'), ('2022CSE005', 'CS304', 'final', 80, 'published');

-- Batch 2023 (Semester 2)
INSERT INTO public.grades (student_id, course_id, exam_type, score, status) VALUES
-- 2023CSE001 (CGPA ~8.4)
('2023CSE001', 'CS101', 'mid', 84, 'published'), ('2023CSE001', 'CS101', 'final', 87, 'published'),
('2023CSE001', 'CS102', 'mid', 83, 'published'), ('2023CSE001', 'CS102', 'final', 86, 'published'),
('2023CSE001', 'CS201', 'mid', 82, 'published'), ('2023CSE001', 'CS201', 'final', 85, 'published'),
('2023CSE001', 'CS202', 'mid', 84, 'published'), ('2023CSE001', 'CS202', 'final', 87, 'published'),
-- 2023CSE002 (CGPA ~9.1)
('2023CSE002', 'CS101', 'mid', 91, 'published'), ('2023CSE002', 'CS101', 'final', 94, 'published'),
('2023CSE002', 'CS102', 'mid', 90, 'published'), ('2023CSE002', 'CS102', 'final', 93, 'published'),
('2023CSE002', 'CS201', 'mid', 89, 'published'), ('2023CSE002', 'CS201', 'final', 92, 'published'),
('2023CSE002', 'CS202', 'mid', 90, 'published'), ('2023CSE002', 'CS202', 'final', 93, 'published'),
-- 2023CSE003 (CGPA ~7.6)
('2023CSE003', 'CS101', 'mid', 74, 'published'), ('2023CSE003', 'CS101', 'final', 77, 'published'),
('2023CSE003', 'CS102', 'mid', 75, 'published'), ('2023CSE003', 'CS102', 'final', 78, 'published'),
('2023CSE003', 'CS201', 'mid', 73, 'published'), ('2023CSE003', 'CS201', 'final', 76, 'published'),
('2023CSE003', 'CS202', 'mid', 74, 'published'), ('2023CSE003', 'CS202', 'final', 77, 'published'),
-- 2023CSE004 (CGPA ~8.0)
('2023CSE004', 'CS101', 'mid', 79, 'published'), ('2023CSE004', 'CS101', 'final', 82, 'published'),
('2023CSE004', 'CS102', 'mid', 80, 'published'), ('2023CSE004', 'CS102', 'final', 83, 'published'),
('2023CSE004', 'CS201', 'mid', 78, 'published'), ('2023CSE004', 'CS201', 'final', 81, 'published'),
('2023CSE004', 'CS202', 'mid', 79, 'published'), ('2023CSE004', 'CS202', 'final', 82, 'published'),
-- 2023CSE005 (CGPA ~8.5)
('2023CSE005', 'CS101', 'mid', 85, 'published'), ('2023CSE005', 'CS101', 'final', 88, 'published'),
('2023CSE005', 'CS102', 'mid', 84, 'published'), ('2023CSE005', 'CS102', 'final', 87, 'published'),
('2023CSE005', 'CS201', 'mid', 83, 'published'), ('2023CSE005', 'CS201', 'final', 86, 'published'),
('2023CSE005', 'CS202', 'mid', 85, 'published'), ('2023CSE005', 'CS202', 'final', 88, 'published');

-- Batch 2024 (Semester 1) - Mid-term only
INSERT INTO public.grades (student_id, course_id, exam_type, score, status) VALUES
('2024CSE001', 'CS101', 'mid', 82, 'published'), ('2024CSE001', 'CS102', 'mid', 85, 'published'),
('2024CSE002', 'CS101', 'mid', 88, 'published'), ('2024CSE002', 'CS102', 'mid', 90, 'published'),
('2024CSE003', 'CS101', 'mid', 75, 'published'), ('2024CSE003', 'CS102', 'mid', 78, 'published'),
('2024CSE004', 'CS101', 'mid', 91, 'published'), ('2024CSE004', 'CS102', 'mid', 93, 'published'),
('2024CSE005', 'CS101', 'mid', 79, 'published'), ('2024CSE005', 'CS102', 'mid', 82, 'published'),
('2024CSE006', 'CS101', 'mid', 86, 'published'), ('2024CSE006', 'CS102', 'mid', 88, 'published'),
('2024CSE007', 'CS101', 'mid', 73, 'published'), ('2024CSE007', 'CS102', 'mid', 76, 'published'),
('2024CSE008', 'CS101', 'mid', 84, 'published'), ('2024CSE008', 'CS102', 'mid', 87, 'published'),
('2024CSE009', 'CS101', 'mid', 80, 'published'), ('2024CSE009', 'CS102', 'mid', 83, 'published'),
('2024CSE010', 'CS101', 'mid', 77, 'published'), ('2024CSE010', 'CS102', 'mid', 80, 'published');

-- ============================================
-- 8. LEADERBOARD - CGPA data for all students
-- ============================================
INSERT INTO public.leaderboard (student_id, sgpa, cgpa, semester) VALUES
-- Batch 2021
('2021CSE001', 9.1, 9.0, 6),
('2021CSE002', 8.6, 8.5, 6),
('2021CSE003', 7.9, 7.8, 6),
('2021CSE004', 8.3, 8.2, 6),
('2021CSE005', 8.8, 8.7, 6),
-- Batch 2022
('2022CSE001', 8.9, 8.8, 4),
('2022CSE002', 8.4, 8.3, 4),
('2022CSE003', 7.6, 7.5, 4),
('2022CSE004', 8.7, 8.6, 4),
('2022CSE005', 8.0, 7.9, 4),
-- Batch 2023
('2023CSE001', 8.5, 8.4, 2),
('2023CSE002', 9.2, 9.1, 2),
('2023CSE003', 7.7, 7.6, 2),
('2023CSE004', 8.1, 8.0, 2),
('2023CSE005', 8.6, 8.5, 2),
-- Batch 2024 (only mid-term, estimated)
('2024CSE001', 8.4, 8.4, 1),
('2024CSE002', 8.9, 8.9, 1),
('2024CSE003', 7.7, 7.7, 1),
('2024CSE004', 9.2, 9.2, 1),
('2024CSE005', 8.1, 8.1, 1),
('2024CSE006', 8.7, 8.7, 1),
('2024CSE007', 7.5, 7.5, 1),
('2024CSE008', 8.6, 8.6, 1),
('2024CSE009', 8.2, 8.2, 1),
('2024CSE010', 7.9, 7.9, 1);

-- ============================================
-- 9. ATTENDANCE - Last 30 days for all enrolled students
-- ============================================
-- Generate attendance for Batch 2021 students
INSERT INTO public.attendance (student_id, course_id, date, status) VALUES
-- 2021CSE001 - 85% attendance
('2021CSE001', 'CS301', CURRENT_DATE - 29, 'present'), ('2021CSE001', 'CS301', CURRENT_DATE - 28, 'present'),
('2021CSE001', 'CS301', CURRENT_DATE - 27, 'present'), ('2021CSE001', 'CS301', CURRENT_DATE - 26, 'absent'),
('2021CSE001', 'CS301', CURRENT_DATE - 25, 'present'), ('2021CSE001', 'CS301', CURRENT_DATE - 24, 'present'),
('2021CSE001', 'CS301', CURRENT_DATE - 23, 'present'), ('2021CSE001', 'CS301', CURRENT_DATE - 22, 'present'),
('2021CSE001', 'CS301', CURRENT_DATE - 21, 'present'), ('2021CSE001', 'CS301', CURRENT_DATE - 20, 'absent'),
('2021CSE001', 'CS301', CURRENT_DATE - 19, 'present'), ('2021CSE001', 'CS301', CURRENT_DATE - 18, 'present'),
('2021CSE001', 'CS301', CURRENT_DATE - 17, 'present'), ('2021CSE001', 'CS301', CURRENT_DATE - 16, 'present'),
('2021CSE001', 'CS301', CURRENT_DATE - 15, 'present'), ('2021CSE001', 'CS301', CURRENT_DATE - 14, 'absent'),
('2021CSE001', 'CS301', CURRENT_DATE - 13, 'present'), ('2021CSE001', 'CS301', CURRENT_DATE - 12, 'present'),
('2021CSE001', 'CS301', CURRENT_DATE - 11, 'present'), ('2021CSE001', 'CS301', CURRENT_DATE - 10, 'present'),
('2021CSE001', 'CS301', CURRENT_DATE - 9, 'present'), ('2021CSE001', 'CS301', CURRENT_DATE - 8, 'present'),
('2021CSE001', 'CS301', CURRENT_DATE - 7, 'absent'), ('2021CSE001', 'CS301', CURRENT_DATE - 6, 'present'),
('2021CSE001', 'CS301', CURRENT_DATE - 5, 'present'), ('2021CSE001', 'CS301', CURRENT_DATE - 4, 'present'),
('2021CSE001', 'CS301', CURRENT_DATE - 3, 'present'), ('2021CSE001', 'CS301', CURRENT_DATE - 2, 'present'),
('2021CSE001', 'CS301', CURRENT_DATE - 1, 'present'), ('2021CSE001', 'CS301', CURRENT_DATE, 'present');

-- Sample attendance for other students (abbreviated for space)
INSERT INTO public.attendance (student_id, course_id, date, status) VALUES
('2021CSE002', 'CS301', CURRENT_DATE - 10, 'present'), ('2021CSE002', 'CS301', CURRENT_DATE - 9, 'present'),
('2021CSE002', 'CS301', CURRENT_DATE - 8, 'absent'), ('2021CSE002', 'CS301', CURRENT_DATE - 7, 'present'),
('2021CSE002', 'CS301', CURRENT_DATE - 6, 'present'), ('2021CSE002', 'CS301', CURRENT_DATE - 5, 'present'),
('2021CSE002', 'CS301', CURRENT_DATE - 4, 'present'), ('2021CSE002', 'CS301', CURRENT_DATE - 3, 'present'),
('2021CSE002', 'CS301', CURRENT_DATE - 2, 'absent'), ('2021CSE002', 'CS301', CURRENT_DATE - 1, 'present'),
('2022CSE001', 'CS201', CURRENT_DATE - 10, 'present'), ('2022CSE001', 'CS201', CURRENT_DATE - 9, 'present'),
('2022CSE001', 'CS201', CURRENT_DATE - 8, 'present'), ('2022CSE001', 'CS201', CURRENT_DATE - 7, 'present'),
('2022CSE001', 'CS201', CURRENT_DATE - 6, 'absent'), ('2022CSE001', 'CS201', CURRENT_DATE - 5, 'present'),
('2023CSE001', 'CS101', CURRENT_DATE - 10, 'present'), ('2023CSE001', 'CS101', CURRENT_DATE - 9, 'present'),
('2023CSE001', 'CS101', CURRENT_DATE - 8, 'present'), ('2023CSE001', 'CS101', CURRENT_DATE - 7, 'present'),
('2024CSE001', 'CS101', CURRENT_DATE - 10, 'present'), ('2024CSE001', 'CS101', CURRENT_DATE - 9, 'present'),
('2024CSE001', 'CS101', CURRENT_DATE - 8, 'present'), ('2024CSE001', 'CS101', CURRENT_DATE - 7, 'absent');

-- ============================================
-- 10. NOTIFICATIONS
-- ============================================
INSERT INTO public.notifications (student_id, message, read_status) VALUES
('2021CSE001', 'Your final exam results have been published', false),
('2021CSE001', 'Fee payment deadline is approaching', true),
('2021CSE002', 'New assignment uploaded for CS301', false),
('2022CSE001', 'Mid-term exam schedule released', false),
('2023CSE001', 'Course registration for next semester opens soon', false),
('2024CSE001', 'Welcome to IIIT Gwalior! Complete your profile', true);

-- ============================================
-- 11. EXAM TIMETABLE
-- ============================================
INSERT INTO public.exam_timetables (course_id, exam_type, exam_date, start_time, end_time, room_no, semester, department, section) VALUES
('CS301', 'final', CURRENT_DATE + 15, '09:00:00', '12:00:00', 'Room 301', 6, 'Computer Science', 'A'),
('CS302', 'final', CURRENT_DATE + 17, '14:00:00', '17:00:00', 'Room 302', 6, 'Computer Science', 'A'),
('CS303', 'final', CURRENT_DATE + 19, '09:00:00', '12:00:00', 'Room 303', 6, 'Computer Science', 'A'),
('CS201', 'final', CURRENT_DATE + 20, '14:00:00', '17:00:00', 'Room 201', 4, 'Computer Science', 'A'),
('CS202', 'final', CURRENT_DATE + 22, '09:00:00', '12:00:00', 'Room 202', 4, 'Computer Science', 'A'),
('CS101', 'final', CURRENT_DATE + 25, '14:00:00', '17:00:00', 'Room 101', 2, 'Computer Science', 'A'),
('CS102', 'final', CURRENT_DATE + 27, '09:00:00', '12:00:00', 'Room 102', 2, 'Computer Science', 'A');

-- ============================================
-- 12. FEE RECEIPTS
-- ============================================
INSERT INTO public.fee_receipts (student_id, fee_type, bank, payment_method, file_url, status) VALUES
('2021CSE001', 'academic', 'SBI', 'UPI', 'https://example.com/receipt1.pdf', 'approved'),
('2021CSE002', 'academic', 'HDFC', 'Net Banking', 'https://example.com/receipt2.pdf', 'approved'),
('2022CSE001', 'academic', 'ICICI', 'Debit Card', 'https://example.com/receipt3.pdf', 'approved'),
('2022CSE003', 'academic', 'SBI', 'UPI', 'https://example.com/receipt4.pdf', 'pending'),
('2023CSE001', 'mess', 'HDFC', 'Net Banking', 'https://example.com/receipt5.pdf', 'approved'),
('2024CSE001', 'academic', 'ICICI', 'UPI', 'https://example.com/receipt6.pdf', 'approved'),
('2024CSE003', 'academic', 'SBI', 'Debit Card', 'https://example.com/receipt7.pdf', 'pending');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
SELECT 'users' as table_name, COUNT(*) as count FROM public.users
UNION ALL SELECT 'faculty', COUNT(*) FROM public.faculty
UNION ALL SELECT 'students', COUNT(*) FROM public.students
UNION ALL SELECT 'courses', COUNT(*) FROM public.courses
UNION ALL SELECT 'enrollments', COUNT(*) FROM public.enrollments
UNION ALL SELECT 'grades', COUNT(*) FROM public.grades
UNION ALL SELECT 'leaderboard', COUNT(*) FROM public.leaderboard
UNION ALL SELECT 'attendance', COUNT(*) FROM public.attendance;

-- ============================================
-- LOGIN CREDENTIALS
-- ============================================
/*
ADMIN: admin@iiitm.ac.in / password123

FACULTY (10):
- rajesh.kumar@iiitm.ac.in / password123
- priya.sharma@iiitm.ac.in / password123
- amit.patel@iiitm.ac.in / password123
... (all 10 faculty with password123)

STUDENTS (25):
Batch 2021: rahul.verma.2021@iiitm.ac.in / password123
Batch 2022: ananya.sharma.2022@iiitm.ac.in / password123
Batch 2023: karan.verma.2023@iiitm.ac.in / password123
Batch 2024: riya.sharma.2024@iiitm.ac.in / password123
... (all 25 students with password123)
*/
