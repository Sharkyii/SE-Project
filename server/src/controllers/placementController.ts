import { Request, Response, NextFunction } from 'express';
import { supabase, supabaseAdmin } from '../config/db';
import { sendEmail } from '../services/emailService';

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
            .insert([{ name, description, requirements, arrival_date, package_details }])
            .select()
            .single();

        if (error) throw error;

        const message = `New Company Arrival: ${name} is arriving on ${arrival_date}. Check placement module for details.`;

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

        // Email all students about new company
        try {
            const { data: students } = await supabaseAdmin
                .from('students')
                .select('name, email_id');

            if (students) {
                const emailPromises = students.map(s => {
                    if (!s.email_id) return Promise.resolve();
                    return sendEmail({
                        to: s.email_id,
                        subject: `🏢 New Company Arriving - ${name}`,
                        html: `
                          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                            <h2 style="color:#2563eb;">New Placement Opportunity!</h2>
                            <p>Dear ${s.name},</p>
                            <p>A new company has been added to the placement drive:</p>
                            <div style="background:#f3f4f6;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #2563eb;">
                              <p><strong>Company:</strong> ${name}</p>
                              <p><strong>Arrival Date:</strong> ${new Date(arrival_date).toLocaleDateString()}</p>
                              ${package_details ? `<p><strong>Package:</strong> ${package_details}</p>` : ''}
                              ${requirements ? `<p><strong>Requirements:</strong> ${requirements}</p>` : ''}
                              ${description ? `<p><strong>About:</strong> ${description}</p>` : ''}
                            </div>
                            <p>Login to the placement portal for more details and to apply.</p>
                            <p>Best regards,<br>Placement Cell</p>
                          </div>`
                    });
                });
                await Promise.allSettled(emailPromises);
            }
        } catch (emailErr) {
            console.error('Failed to send company arrival emails:', emailErr);
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

        // Email selected students
        try {
            const { data: students } = await supabaseAdmin
                .from('students')
                .select('name, email_id')
                .in('student_id', uniqueStudentIds);

            if (students) {
                const emailPromises = students.map(s => {
                    if (!s.email_id) return Promise.resolve();
                    return sendEmail({
                        to: s.email_id,
                        subject: `🎉 Congratulations! Selected for ${company?.name} - Round ${round_number}`,
                        html: `
                          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                            <h2 style="color:#16a34a;">🎉 Congratulations!</h2>
                            <p>Dear ${s.name},</p>
                            <p>You have been selected to proceed to the next round of the placement process!</p>
                            <div style="background:#f0fdf4;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #16a34a;">
                              <p><strong>Company:</strong> ${company?.name}</p>
                              <p><strong>Round:</strong> ${round_number}</p>
                              <p><strong>Status:</strong> ✅ Selected</p>
                            </div>
                            <p>Please check the placement portal for further details and instructions.</p>
                            <p>Best of luck!</p>
                            <p>Best regards,<br>Placement Cell</p>
                          </div>`
                    });
                });
                await Promise.allSettled(emailPromises);
            }
        } catch (emailErr) {
            console.error('Failed to send selection emails:', emailErr);
        }

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
