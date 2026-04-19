# Database Seed Data Guide

## Quick Start

### Step 1: Generate Password Hashes
```bash
cd server
node generate_hashes.js
```

Copy the generated hashes and replace them in `seed_data.sql` file in the USERS section.

### Step 2: Run the Seed Script

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project
2. Click on "SQL Editor" in the left sidebar
3. Copy the entire content of `seed_data.sql`
4. Paste it into the SQL editor
5. Click "Run" button

**Option B: Using psql command line**
```bash
psql -h your-supabase-host -U postgres -d postgres -f seed_data.sql
```

**Option C: Using Supabase CLI**
```bash
supabase db reset
# Then run the seed script
```

## What Data is Included

### Users (9 total)
- 1 Admin
- 3 Faculty members
- 5 Students

**All passwords: `password123`**

### Login Credentials

#### Admin
- Email: `admin@iiitg.ac.in`
- Password: `password123`
- Role: admin

#### Faculty
- Email: `faculty1@iiitg.ac.in` (Dr. Rajesh Kumar - CSE)
- Email: `faculty2@iiitg.ac.in` (Dr. Priya Sharma - CSE)
- Email: `faculty3@iiitg.ac.in` (Dr. Amit Patel - ECE)
- Password: `password123` (for all)
- Role: faculty

#### Students
- Email: `student1@iiitg.ac.in` (Rahul Verma - 2021CSE001)
- Email: `student2@iiitg.ac.in` (Sneha Gupta - 2021CSE002)
- Email: `student3@iiitg.ac.in` (Arjun Singh - 2021CSE003)
- Email: `student4@iiitg.ac.in` (Priya Reddy - 2021CSE004)
- Email: `student5@iiitg.ac.in` (Vikram Joshi - 2021CSE005)
- Password: `password123` (for all)
- Role: student

### Courses (10 total)

#### Core Courses (5)
1. CS201 - Data Structures and Algorithms (4 credits)
2. CS301 - Database Management Systems (4 credits)
3. CS302 - Operating Systems (4 credits)
4. CS303 - Computer Networks (3 credits)
5. CS304 - Software Engineering (3 credits)

#### Elective Courses (5)
1. CS401 - Machine Learning (4 credits)
2. CS402 - Artificial Intelligence (4 credits)
3. CS403 - Cloud Computing (3 credits)
4. CS404 - Blockchain Technology (3 credits)
5. CS405 - Cyber Security (3 credits)

### Other Data
- **Enrollments**: Students enrolled in various courses
- **Attendance**: Sample attendance records for last 10 days
- **Grades**: Mid-term and quiz grades (some published, some pending)
- **Exam Timetable**: Final exams scheduled for next 3 weeks
- **Fee Receipts**: Sample fee payment records
- **Notifications**: Unread notifications for students
- **Quizzes**: Upcoming quizzes with due dates
- **Feedback**: Student feedback for courses
- **Leaderboard**: SGPA and CGPA rankings
- **Enrollment Applications**: 2 pending applications

## Testing Scenarios

### Test Admin Features
1. Login as admin
2. View all courses
3. Manage enrollments
4. Verify fee receipts
5. View attendance reports
6. Approve grades

### Test Faculty Features
1. Login as faculty1 or faculty2
2. View assigned courses
3. Mark attendance
4. Enter grades
5. Upload quizzes
6. View student feedback

### Test Student Features
1. Login as any student
2. View enrolled courses
3. Check attendance
4. View grades
5. See exam timetable
6. Check notifications
7. Register for electives

## Customization

### Change Password
Edit the `generate_hashes.js` file and change the password variable:
```javascript
const password = 'your_new_password';
```

Then run it again to generate new hashes.

### Add More Data
Edit `seed_data.sql` and add more INSERT statements following the same pattern.

### Modify Existing Data
Change the values in the INSERT statements in `seed_data.sql`.

## Troubleshooting

### Error: "duplicate key value violates unique constraint"
- The data already exists. Run the TRUNCATE commands first to clear all data.

### Error: "relation does not exist"
- Make sure all tables are created first using the schema.sql file.

### Error: "foreign key constraint"
- Make sure you're inserting data in the correct order (users → faculty/students → courses → enrollments, etc.)

### Password not working
- Make sure you generated proper bcrypt hashes using the generate_hashes.js script
- Verify the hashes are correctly copied to the SQL file

## Data Relationships

```
users
  ├── faculty (via email)
  │   └── courses (via email_id)
  │       ├── enrollments
  │       ├── attendance
  │       ├── grades
  │       ├── quizzes
  │       └── exam_timetables
  └── students (via email)
      ├── enrollments
      ├── elective_enrollments
      ├── attendance
      ├── grades
      ├── notifications
      ├── feedback
      ├── fee_receipts
      └── leaderboard
```

## Clean Up

To remove all data and start fresh:
```sql
-- Run only the TRUNCATE section from seed_data.sql
SET session_replication_role = 'replica';
TRUNCATE TABLE public.anonymous_feedback CASCADE;
-- ... (all other TRUNCATE statements)
SET session_replication_role = 'origin';
```

## Notes

- All dates are relative to CURRENT_DATE for realistic testing
- Exam dates are set 15-23 days in the future
- Quiz due dates are 7-12 days in the future
- Attendance records cover the last 10 days
- Some grades are marked as "pending" to test approval workflow
- Fee status varies (paid/pending) for testing
- Notifications include both read and unread messages

## Security Warning

⚠️ **IMPORTANT**: This is dummy data for development/testing only!

- Never use these credentials in production
- Always use strong, unique passwords
- Change all default passwords before deploying
- Use environment variables for sensitive data
- Enable proper authentication and authorization

---

**Happy Testing! 🚀**
