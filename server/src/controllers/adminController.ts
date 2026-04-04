import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/db';

// Create Student (admin only)
export const createStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, student_id, department, semester, section } = req.body;
        if (!name || !email || !password || !student_id || !department || !semester) {
            res.status(400); throw new Error('All fields are required');
        }

        const { data: exists } = await supabase.from('users').select('id').eq('email', email).single();
        if (exists) { res.status(400); throw new Error('Email already registered'); }

        const hashed = await bcrypt.hash(password, 10);

        const { data: userRes, error: userErr } = await supabase
            .from('users').insert([{ email, password: hashed, role: 'student' }]).select().single();
        if (userErr) throw userErr;

        const { data: studentRes, error: studentErr } = await supabase
            .from('students')
            .insert([{ student_id, name, email_id: email, department, semester: Number(semester), section: section || 'A' }])
            .select().single();
        if (studentErr) throw studentErr;

        await supabase.from('users').update({ profile_id: student_id }).eq('id', userRes.id);

        res.status(201).json({ message: 'Student created', student: studentRes });
    } catch (error) { next(error); }
};

// Create Faculty (admin only)
export const createFaculty = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, department, designation } = req.body;
        if (!name || !email || !password || !department || !designation) {
            res.status(400); throw new Error('All fields are required');
        }

        const { data: exists } = await supabase.from('users').select('id').eq('email', email).single();
        if (exists) { res.status(400); throw new Error('Email already registered'); }

        const hashed = await bcrypt.hash(password, 10);

        const { data: userRes, error: userErr } = await supabase
            .from('users').insert([{ email, password: hashed, role: 'faculty' }]).select().single();
        if (userErr) throw userErr;

        const { data: facultyRes, error: facultyErr } = await supabase
            .from('faculty')
            .insert([{ user_id: String(userRes.id), email_id: email, name, department, designation }])
            .select().single();
        if (facultyErr) throw facultyErr;

        await supabase.from('users').update({ profile_id: email }).eq('id', userRes.id);

        res.status(201).json({ message: 'Faculty created', faculty: facultyRes });
    } catch (error) { next(error); }
};

// Get all students
export const getStudents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) { next(error); }
};

// Get all faculty
export const getFaculty = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data, error } = await supabase.from('faculty').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) { next(error); }
};

// Create Course
export const createCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, code, description, credits, email_id, is_elective, max_seats, elective_semester } = req.body;
        const { data, error } = await supabase
            .from('courses')
            .insert([{ name, code, description, credits, email_id: email_id || null, is_elective: is_elective || false, max_seats: max_seats || 30, elective_semester: elective_semester || null }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
};

// Assign Faculty to Course
export const assignFaculty = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId, facultyId } = req.body; // facultyId here is the email_id
        const { data, error } = await supabase
            .from('courses')
            .update({ email_id: facultyId })
            .eq('id', courseId)
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            res.status(404);
            throw new Error('Course not found');
        }
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

// Create Timetable Entry
export const createTimetable = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { course_id, faculty_id, day, start_time, end_time, semester, department, section, room_no } = req.body;

        // Conflict Validation
        // Check if faculty is already booked at this time
        const { data: conflicts, error: conflictError } = await supabase
            .from('timetables')
            .select('*')
            .eq('faculty_id', faculty_id)
            .eq('day', day)
            .or(`and(start_time.lte.${start_time},end_time.gt.${start_time}),and(start_time.lt.${end_time},end_time.gte.${end_time})`);

        if (conflictError) throw conflictError;

        if (conflicts && conflicts.length > 0) {
            res.status(409);
            throw new Error(`Faculty is already assigned to another class on ${day} between ${start_time} and ${end_time}`);
        }

        const { data, error } = await supabase
            .from('timetables')
            .insert([{ course_id, faculty_id, day, start_time, end_time, semester, department, section, room_no }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
};


// Get Timetable
export const getTimetable = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type, userId, department, semester, section } = req.query;

        let query = supabase.from('timetables').select(`
            *,
            courses (name, code),
            faculty (name)
        `);

        if (type === 'personal' && userId) {
            // Assuming userId passed is the faculty email_id for now, or we need to look it up.
            // If userId is the internal ID, we need to join. But let's assume valid email_id or we fetch it.
            // For simplicity, let's assume the frontend passes the faculty's email_id as userId for now
            // Or better, we use the auth middleware to get the user's email if they are faculty.
            query = query.eq('faculty_id', userId);
        } else if (type === 'student' && department && semester && section) {
            query = query.eq('department', department).eq('semester', semester).eq('section', section);
        } else if (type === 'institute') {
            if (department) query = query.eq('department', department);
            if (semester) query = query.eq('semester', semester);
        }

        const { data, error } = await query;
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

// Verify User (e.g., mark as active or verified - adding a column if needed, but for now just a dummy update)
export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.body;
        // Assuming we might have a verified column, or just toggling something.
        // For now, let's just log it or update a placeholder.
        res.status(200).json({ message: `User ${userId} verified` });
    } catch (error) {
        next(error);
    }
};

// Get Reports (Basic counts for now)
export const getReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { count: studentsCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
        const { count: facultyCount } = await supabase.from('faculty').select('*', { count: 'exact', head: true });
        const { count: coursesCount } = await supabase.from('courses').select('*', { count: 'exact', head: true });

        res.status(200).json({
            stats: {
                students: studentsCount || 0,
                faculty: facultyCount || 0,
                courses: coursesCount || 0,
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get elective enrollment summary
export const getElectiveSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { semester, academicYear } = req.query;
        const { data, error } = await supabase
            .from('elective_enrollments')
            .select('*, courses(name, code, max_seats), students(name, student_id, department)')
            .eq('semester', semester)
            .eq('academic_year', academicYear)
            .order('course_id');
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) { next(error); }
};

// Get Pending Grades
export const getPendingGrades = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data, error } = await supabase
            .from('grades')
            .select(`
                *,
                students (name, student_id),
                courses (name, code)
            `)
            .eq('status', 'pending');

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

// Approve Grades (Publish)
export const approveGrades = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { gradeIds } = req.body; // Array of grade IDs to approve

        if (!gradeIds || !Array.isArray(gradeIds) || gradeIds.length === 0) {
            res.status(400);
            throw new Error('No grade IDs provided');
        }

        const { data, error } = await supabase
            .from('grades')
            .update({ status: 'published' })
            .in('id', gradeIds)
            .select();

        res.status(200).json({ message: 'Grades published successfully', data });
    } catch (error) {
        next(error);
    }
};

// Get All Courses
export const getCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data, error } = await supabase
            .from('courses')
            .select('*');
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

// Assign Course to Student (Enrollment)
export const assignCourseToStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { studentId, courseId, semester, academicYear } = req.body;

        if (!studentId || !courseId || !semester || !academicYear) {
            res.status(400);
            throw new Error('Please provide all required fields');
        }

        // Check if student exists
        const { data: student, error: studentError } = await supabase
            .from('students')
            .select('student_id')
            .eq('student_id', studentId)
            .single();

        if (studentError || !student) {
            res.status(404);
            throw new Error('Student not found');
        }

        // Check if course exists
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('code')
            .eq('code', courseId)
            .single();

        if (courseError || !course) {
            res.status(404);
            throw new Error('Course not found');
        }

        // Insert enrollment
        const { data, error } = await supabase
            .from('enrollments')
            .insert([{
                student_id: studentId,
                course_id: courseId,
                semester,
                academic_year: academicYear
            }])
            .select()
            .single();

        // Handle unique constraint violation (already enrolled)
        if (error) {
            if (error.code === '23505') {
                res.status(409);
                throw new Error('Student is already enrolled in this course for this semester.');
            }
            throw error;
        }

        res.status(201).json({ message: 'Course assigned successfully', enrollment: data });
    } catch (error) {
        next(error);
    }
};
