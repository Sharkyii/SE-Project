import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/db';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('student_id, name, email_id, department, semester, section')
            .eq('email_id', req.user.email)
            .single();
        if (error || !data) { res.status(404); throw new Error('Student profile not found'); }
        res.status(200).json(data);
    } catch (error) { next(error); }
};

export const uploadDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json({ message: 'Document upload functionality ready' });
    } catch (error) {
        next(error);
    }
};

export const payFee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json({ message: 'Fee payment successful' });
    } catch (error) {
        next(error);
    }
};

export const chooseElectives = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId, semester, academicYear } = req.body;

        // Resolve student_id from email
        const { data: studentData } = await supabase
            .from('students').select('student_id').eq('email_id', req.user.email).single();
        const studentId = studentData?.student_id;
        if (!studentId) { res.status(404); throw new Error('Student profile not found'); }

        // Check course is elective
        const { data: course } = await supabase
            .from('courses').select('code, name, is_elective, max_seats').eq('code', courseId).single();
        if (!course?.is_elective) { res.status(400); throw new Error('Course is not an elective'); }

        // Check seats available
        const { count } = await supabase
            .from('elective_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', courseId)
            .eq('semester', semester)
            .eq('academic_year', academicYear);
        if ((count || 0) >= (course.max_seats || 30)) {
            res.status(409); throw new Error('No seats available for this elective');
        }

        // Upsert — replace previous elective choice for same semester/year
        const { data, error } = await supabase
            .from('elective_enrollments')
            .upsert([{ student_id: studentId, course_id: courseId, semester, academic_year: academicYear }],
                { onConflict: 'student_id,semester,academic_year' })
            .select().single();

        if (error) throw error;
        res.status(200).json({ enrollment: data, course });
    } catch (error) {
        next(error);
    }
};

export const getMyElective = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { semester, academicYear } = req.query;
        const { data: studentData } = await supabase
            .from('students').select('student_id').eq('email_id', req.user.email).single();
        const studentId = studentData?.student_id;

        const { data, error } = await supabase
            .from('elective_enrollments')
            .select('*, courses(name, code, description, credits)')
            .eq('student_id', studentId)
            .eq('semester', semester)
            .eq('academic_year', academicYear)
            .maybeSingle();

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

export const getElectiveCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { semester, academicYear } = req.query;

        const { data: courses, error } = await supabase
            .from('courses')
            .select('id, name, code, description, credits, max_seats, elective_semester')
            .eq('is_elective', true);
        if (error) throw error;

        // Filter by semester in JS — show electives for this semester or untagged ones
        const filtered = (courses || []).filter(c =>
            c.elective_semester === null || c.elective_semester === undefined || c.elective_semester === Number(semester)
        );

        // Get seat counts for each elective
        const enriched = await Promise.all(filtered.map(async (c) => {
            const { count } = await supabase
                .from('elective_enrollments')
                .select('*', { count: 'exact', head: true })
                .eq('course_id', c.code)
                .eq('semester', semester)
                .eq('academic_year', academicYear);
            return { ...c, enrolled: count || 0, available_seats: (c.max_seats || 30) - (count || 0) };
        }));

        res.status(200).json(enriched);
    } catch (error) {
        next(error);
    }
};

export const viewGrades = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data, error } = await supabase
            .from('grades')
            .select('*, courses(name)')
            .eq('student_id', req.user.profile_id)
            .eq('status', 'published');

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

export const submitFeedback = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { facultyId, courseId, semester, rating, comments } = req.body;
        const { data, error } = await supabase
            .from('feedback')
            .insert([{ student_id: req.user.profile_id, faculty_id: facultyId, course_id: courseId, semester, rating, comments }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
};

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data, error } = await supabase
            .from('leaderboard')
            .select('*, students(name)')
            .order('gpa', { ascending: false })
            .limit(10);

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

// Get Student Timetable
export const getTimetable = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { semester, department, section } = req.query;

        let query = supabase.from('timetables').select(`
            *,
            courses (name, code),
            faculty (name)
        `);

        if (department && semester && section) {
            query = query
                .eq('department', department)
                .eq('semester', semester)
                .eq('section', section);
        } else {
            if (req.user && req.user.profile_id) {
                const { data: studentData, error: studentError } = await supabase
                    .from('students')
                    .select('department, semester')
                    .eq('student_id', req.user.profile_id)
                    .single();

                if (studentData) {
                    query = query
                        .eq('department', studentData.department)
                        .eq('semester', studentData.semester);
                }
            }
        }

        const { data, error } = await query;
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

// Get Notifications
export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('student_id', req.user.profile_id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

// Mark Notification as Read
export const markNotificationRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('notifications')
            .update({ read_status: true })
            .eq('id', id)
            .eq('student_id', req.user.profile_id)
            .select();

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

// Get Attendance
export const getAttendance = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data: student, error: studentError } = await supabase
            .from('students')
            .select('student_id')
            .eq('email_id', req.user.email)
            .single();
            
        if (studentError || !student) {
            res.status(404); throw new Error('Student profile not found');
        }

        const { data, error } = await supabase
            .from('attendance')
            .select('*, courses(name, code)')
            .eq('student_id', student.student_id)
            .order('date', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};
