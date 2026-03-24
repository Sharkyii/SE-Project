import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/db';

// Mark Attendance
export const markAttendance = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { studentId, courseId, date, status } = req.body;
        const { data, error } = await supabase
            .from('attendance')
            .insert([{ student_id: studentId, course_id: courseId, date, status }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
};

// Upload Grades
export const uploadGrades = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { studentId, courseId, examType, score } = req.body;
        const { data, error } = await supabase
            .from('grades')
            .insert([{ student_id: studentId, course_id: courseId, exam_type: examType, score }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
};

// Post Quiz (Placeholder)
export const postQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId, title, questions } = req.body;
        // Logic to store quiz details would go here
        res.status(201).json({ message: 'Quiz posted successfully', quizId: 'temp-id' });
    } catch (error) {
        next(error);
    }
};

// Apply Leave (Placeholder)
export const applyLeave = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { reason, startDate, endDate } = req.body;
        // Logic to store leave application
        res.status(201).json({ message: 'Leave application submitted' });
    } catch (error) {
        next(error);
    }
};

// Get Faculty Timetable
export const getFacultyTimetable = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Assuming the middleware populates user in req.user, and it has email or id
        // For now, let's assume we pass facultyId in query or params or body if not in auth
        // But better is to trust the token. Let's assume req.user.email is available if we extend Request
        // For now, let's accept it as a query param for flexibility in this "personal" view
        const { facultyId } = req.query;

        if (!facultyId) {
            res.status(400);
            throw new Error('Faculty ID is required');
        }

        const { data, error } = await supabase
            .from('timetables')
            .select(`
                *,
                courses (name, code),
                faculty (name)
            `)
            .eq('faculty_id', facultyId);

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};
