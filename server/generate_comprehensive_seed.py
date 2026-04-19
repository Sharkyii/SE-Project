#!/usr/bin/env python3
"""
Generate comprehensive seed data for IIIT Gwalior ERP
Creates realistic data for 25 students, 10 faculty, complete attendance, grades, CGPA
"""

import random
from datetime import datetime, timedelta

# Configuration
PASSWORD_HASH = '$2b$10$BWSHxdQ/C1PnMSO4ByFv7.SvNSA4ZaLjFXDXjBeTQQd0Qf6UmWYKC'  # password123

# Student batches
BATCHES = {
    2021: {'semester': 6, 'count': 5},
    2022: {'semester': 4, 'count': 5},
    2023: {'semester': 2, 'count': 5},
    2024: {'semester': 1, 'count': 10}
}

# Faculty data
FACULTY = [
    ('rajesh.kumar', 'Dr. Rajesh Kumar', 'Computer Science', 'Professor', 'CSE'),
    ('priya.sharma', 'Dr. Priya Sharma', 'Computer Science', 'Associate Professor', 'CSE'),
    ('amit.patel', 'Dr. Amit Patel', 'Electronics', 'Assistant Professor', 'ECE'),
    ('neha.singh', 'Dr. Neha Singh', 'Computer Science', 'Associate Professor', 'CSE'),
    ('vikram.mehta', 'Dr. Vikram Mehta', 'Information Technology', 'Professor', 'IT'),
    ('anjali.verma', 'Dr. Anjali Verma', 'Computer Science', 'Assistant Professor', 'CSE'),
    ('rahul.gupta', 'Dr. Rahul Gupta', 'Electronics', 'Associate Professor', 'ECE'),
    ('kavita.reddy', 'Dr. Kavita Reddy', 'Computer Science', 'Professor', 'CSE'),
    ('suresh.kumar', 'Dr. Suresh Kumar', 'Information Technology', 'Assistant Professor', 'IT'),
    ('deepak.joshi', 'Dr. Deepak Joshi', 'Computer Science', 'Associate Professor', 'CSE'),
]

# Courses data
COURSES = [
    ('CS101', 'Programming Fundamentals', 4, 0, False, None, None),
    ('CS102', 'Discrete Mathematics', 4, 9, False, None, None),
    ('CS201', 'Data Structures and Algorithms', 4, 1, False, None, None),
    ('CS202', 'Object Oriented Programming', 4, 8, False, None, None),
    ('CS301', 'Database Management Systems', 4, 3, False, None, None),
    ('CS302', 'Operating Systems', 4, 0, False, None, None),
    ('CS303', 'Computer Networks', 3, 4, False, None, None),
    ('CS304', 'Software Engineering', 3, 5, False, None, None),
    ('CS305', 'Theory of Computation', 3, 7, False, None, None),
    ('CS306', 'Computer Architecture', 4, 2, False, None, None),
    ('CS401', 'Machine Learning', 4, 1, True, 40, 7),
    ('CS402', 'Artificial Intelligence', 4, 7, True, 40, 7),
    ('CS403', 'Cloud Computing', 3, 4, True, 40, 7),
    ('CS404', 'Blockchain Technology', 3, 3, True, 40, 7),
    ('CS405', 'Cyber Security', 3, 6, True, 40, 7),
]

# Student names
FIRST_NAMES = ['Rahul', 'Sneha', 'Arjun', 'Priya', 'Vikram', 'Ananya', 'Rohan', 'Ishita', 'Aditya', 'Pooja',
               'Karan', 'Nisha', 'Siddharth', 'Tanvi', 'Harsh', 'Riya', 'Amit', 'Divya', 'Nikhil', 'Sakshi',
               'Varun', 'Meera', 'Aryan', 'Tanya', 'Rohit']
LAST_NAMES = ['Verma', 'Gupta', 'Singh', 'Reddy', 'Joshi', 'Sharma', 'Kumar', 'Patel', 'Mehta', 'Verma']

def generate_sql():
    sql = []
    
    # Header
    sql.append("-- ============================================")
    sql.append("-- COMPREHENSIVE SEED DATA FOR IIIT GWALIOR ERP")
    sql.append("-- Generated: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    sql.append("-- Password for all: password123")
    sql.append("-- ============================================\n")
    
    # Clear data
    sql.append("SET session_replication_role = 'replica';")
    tables = ['anonymous_feedback', 'attendance', 'documents', 'elective_enrollments', 
              'enrollment_applications', 'enrollments', 'exam_timetables', 'fee_receipts',
              'feedback', 'grades', 'leaderboard', 'notifications', 'quizzes',
              'student_documents', 'student_registrations', 'courses', 'students', 'faculty', 'users']
    for table in tables:
        sql.append(f"TRUNCATE TABLE public.{table} CASCADE;")
    sql.append("SET session_replication_role = 'origin';\n")
    
    # Users
    sql.append("-- USERS")
    sql.append("INSERT INTO public.users (email, password, role) VALUES")
    users = [f"('admin@iiitg.ac.in', '{PASSWORD_HASH}', 'admin')"]
    
    # Faculty users
    for fac in FACULTY:
        users.append(f"('{fac[0]}@iiitg.ac.in', '{PASSWORD_HASH}', 'faculty')")
    
    # Student users
    student_idx = 0
    for batch, info in BATCHES.items():
        for i in range(info['count']):
            name = FIRST_NAMES[student_idx].lower()
            last = LAST_NAMES[student_idx % len(LAST_NAMES)].lower()
            users.append(f"('{name}.{last}.{batch}@iiitg.ac.in', '{PASSWORD_HASH}', 'student')")
            student_idx += 1
    
    sql.append(",\n".join(users) + ";\n")
    
    # Faculty
    sql.append("-- FACULTY")
    sql.append("INSERT INTO public.faculty (user_id, email_id, name, department, designation, branch) VALUES")
    fac_rows = []
    for fac in FACULTY:
        email = f"{fac[0]}@iiitg.ac.in"
        fac_rows.append(f"('{email}', '{email}', '{fac[1]}', '{fac[2]}', '{fac[3]}', '{fac[4]}')")
    sql.append(",\n".join(fac_rows) + ";\n")
    
    # Courses
    sql.append("-- COURSES")
    sql.append("INSERT INTO public.courses (code, name, credits, email_id, description, is_elective, max_seats, elective_semester) VALUES")
    course_rows = []
    for course in COURSES:
        fac_email = f"{FACULTY[course[2]][0]}@iiitg.ac.in"
        desc = f"Course on {course[1]}"
        elective = 'true' if course[3] else 'false'
        max_seats = course[4] if course[4] else 'NULL'
        elec_sem = course[5] if course[5] else 'NULL'
        course_rows.append(f"('{course[0]}', '{course[1]}', {course[2]}, '{fac_email}', '{desc}', {elective}, {max_seats}, {elec_sem})")
    sql.append(",\n".join(course_rows) + ";\n")
    
    print("\n".join(sql))

if __name__ == '__main__':
    generate_sql()
