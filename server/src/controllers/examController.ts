import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/db';

// Admin: Create exam timetable entry
export const createExamEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { course_id, exam_type, exam_date, start_time, end_time, room_no, semester, department, section } = req.body;

        if (!course_id || !exam_type || !exam_date || !start_time || !end_time || !room_no || !semester || !department) {
            res.status(400); throw new Error('All fields are required');
        }

        // Conflict check: same room, same date, overlapping time
        const { data: conflicts } = await supabase
            .from('exam_timetables')
            .select('id')
            .eq('room_no', room_no)
            .eq('exam_date', exam_date)
            .or(`and(start_time.lte.${start_time},end_time.gt.${start_time}),and(start_time.lt.${end_time},end_time.gte.${end_time})`);

        if (conflicts && conflicts.length > 0) {
            res.status(409); throw new Error(`Room ${room_no} is already booked on ${exam_date} during that time slot`);
        }

        const { data, error } = await supabase
            .from('exam_timetables')
            .insert([{ course_id, exam_type, exam_date, start_time, end_time, room_no, semester: Number(semester), department, section: section || 'A' }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) { next(error); }
};

// Admin: Get exam timetable (filtered)
export const getExamTimetable = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { department, semester, section, exam_type } = req.query;

        let query = supabase
            .from('exam_timetables')
            .select('*, courses(name, code)')
            .order('exam_date', { ascending: true })
            .order('start_time', { ascending: true });

        if (department) query = query.eq('department', department as string);
        if (semester) query = query.eq('semester', Number(semester));
        if (section) query = query.eq('section', section as string);
        if (exam_type) query = query.eq('exam_type', exam_type as string);

        const { data, error } = await query;
        if (error) throw error;
        res.json(data ?? []);
    } catch (error) { next(error); }
};

// Admin: Delete exam entry
export const deleteExamEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('exam_timetables').delete().eq('id', id);
        if (error) throw error;
        res.json({ message: 'Exam entry deleted' });
    } catch (error) { next(error); }
};

// Student: Get own exam timetable
export const getStudentExamTimetable = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { department, semester, section } = req.query;

        let query = supabase
            .from('exam_timetables')
            .select('*, courses(name, code)')
            .order('exam_date', { ascending: true })
            .order('start_time', { ascending: true });

        if (department) query = query.eq('department', department as string);
        if (semester) query = query.eq('semester', Number(semester));
        if (section) query = query.eq('section', section as string);

        const { data, error } = await query;
        if (error) throw error;
        res.json(data ?? []);
    } catch (error) { next(error); }
};
