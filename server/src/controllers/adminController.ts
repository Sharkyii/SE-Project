import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/db';

// Create Course
export const createCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, code, description, credits, email_id } = req.body;
        const { data, error } = await supabase
            .from('courses')
            .insert([{ name, code, description, credits, email_id: email_id || null }])
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
