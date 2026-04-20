import { Request, Response, NextFunction } from 'express';
import { supabase, supabaseAdmin } from '../config/db';

// Add Company (Admin only)
export const addCompany = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, requirements, arrival_date, package_details, max_rounds } = req.body;

        if (!name || !arrival_date) {
            res.status(400);
            throw new Error('Company name and arrival date are required');
        }

        const { data: company, error } = await supabaseAdmin
            .from('companies')
            // Keep insert backward compatible even if DB doesn't yet have max_rounds column.
            .insert([{ name, description, requirements, arrival_date, package_details }])
            .select()
            .single();

        if (error) throw error;

        // Notify Students and Faculty
        const message = `New Company Arrival: ${name} is arriving on ${arrival_date}. Check placement module for details.`;
        
        // Build notification recipients directly from users.profile_id so IDs match auth payload.
        const { data: recipients } = await supabaseAdmin
            .from('users')
            .select('profile_id')
            .in('role', ['student', 'faculty'])
            .not('profile_id', 'is', null);

        const notifications = (recipients || []).map((recipient) => ({
            profile_id: recipient.profile_id,
            message
        }));

        if (notifications.length > 0) {
            const { error: notifError } = await supabaseAdmin.from('notifications').insert(notifications);
            if (notifError) console.error('Error sending placement notifications:', notifError);
        }

        res.status(201).json(company);
    } catch (error) {
        next(error);
    }
};

// Get All Companies
export const getCompanies = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .order('arrival_date', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

// Add Selection (Admin only)
export const addSelection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { company_id, student_ids, round_number } = req.body;

        if (!Array.isArray(student_ids)) {
            res.status(400);
            throw new Error('student_ids must be an array');
        }

        const uniqueStudentIds = Array.from(new Set(student_ids));

        const { error: deleteError } = await supabaseAdmin
            .from('placement_selections')
            .delete()
            .eq('company_id', company_id)
            .eq('round_number', round_number);

        if (deleteError) throw deleteError;

        const selections = uniqueStudentIds.map(sid => ({
            company_id,
            student_id: sid,
            round_number
        }));

        const { data, error } = await supabaseAdmin
            .from('placement_selections')
            .insert(selections)
            .select();

        if (error) throw error;

        // Notify selected students
        const { data: company } = await supabaseAdmin.from('companies').select('name').eq('id', company_id).single();
        const message = `Congratulations! You have been selected for Round ${round_number} of ${company?.name || 'the company'}.`;
        
        const notifications = uniqueStudentIds.map(sid => ({
            profile_id: sid,
            message
        }));

        await supabaseAdmin.from('notifications').insert(notifications);

        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
};

// Get Selections for a Company
export const getSelections = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { company_id } = req.params;
        const { data, error } = await supabase
            .from('placement_selections')
            .select('*, students(name, department, semester)')
            .eq('company_id', company_id)
            .order('round_number', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

// Get My Selections (Student)
export const getMySelections = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data: student, error: studentErr } = await supabase
            .from('students')
            .select('student_id')
            .eq('email_id', req.user.email)
            .single();

        if (studentErr || !student?.student_id) {
            res.status(404);
            throw new Error('Student profile not found');
        }

        const { data, error } = await supabase
            .from('placement_selections')
            .select('*, companies(name)')
            .eq('student_id', student.student_id);

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};
