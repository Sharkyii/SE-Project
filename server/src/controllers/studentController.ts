import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/db';

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
        const { data, error } = await supabase
            .from('enrollments')
            .insert([{ student_id: req.user.profile_id, course_id: courseId, semester, academic_year: academicYear }])
            .select()
            .single();

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

export const viewGrades = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data, error } = await supabase
            .from('grades')
            .select('*, courses(name)')
            .eq('student_id', req.user.profile_id);

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
