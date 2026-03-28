import { Request, Response, NextFunction } from 'express';
import { supabase, supabaseAdmin } from '../config/db';

type MulterRequest = Request & { files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[] };

// ── Student: Submit Registration Application ──────────────────────────────────
export const submitApplication = async (req: MulterRequest, res: Response, next: NextFunction) => {
  try {
    const {
      full_name, email, phone, date_of_birth, gender,
      department, semester, section, address, guardian_name, guardian_phone,
    } = req.body;

    if (!full_name || !email || !phone || !department || !semester) {
      res.status(400); throw new Error('Required fields missing: full_name, email, phone, department, semester');
    }

    // Check duplicate — use maybeSingle() so no error when row doesn't exist
    const { data: existing, error: checkErr } = await supabase
      .from('enrollment_applications')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (checkErr) {
      console.error('Duplicate check error:', checkErr);
      res.status(500); throw new Error(`Database error: ${checkErr.message}`);
    }
    if (existing) {
      res.status(400); throw new Error('An application already exists for this email');
    }

    // Insert application
    const { data: app, error: appErr } = await supabase
      .from('enrollment_applications')
      .insert([{
        full_name, email, phone,
        date_of_birth: date_of_birth || null,
        gender: gender || null,
        department,
        semester: Number(semester),
        section: section || 'A',
        address: address || null,
        guardian_name: guardian_name || null,
        guardian_phone: guardian_phone || null,
        status: 'pending',
      }])
      .select()
      .single();

    if (appErr) {
      console.error('Insert application error:', appErr);
      res.status(500); throw new Error(`Failed to save application: ${appErr.message}`);
    }

    // Upload documents if provided (non-blocking — skip if bucket missing)
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (files && Object.keys(files).length > 0) {
      for (const [fieldname, fileArr] of Object.entries(files)) {
        for (const file of fileArr) {
          try {
            const fileName = `${app.id}/${fieldname}_${Date.now()}_${file.originalname}`;
            const { error: storageErr } = await supabaseAdmin.storage
              .from('enrollment-docs')
              .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: false });

            if (storageErr) {
              console.warn(`Document upload skipped (${fieldname}):`, storageErr.message);
              continue; // skip this file, don't fail the whole request
            }

            const { data: { publicUrl } } = supabaseAdmin.storage
              .from('enrollment-docs')
              .getPublicUrl(fileName);

            const { error: docErr } = await supabase.from('student_documents').insert([{
              application_id: app.id,
              doc_type: fieldname,
              file_url: publicUrl,
              original_name: file.originalname,
            }]);

            if (docErr) console.warn(`Document record insert failed (${fieldname}):`, docErr.message);
          } catch (fileErr: any) {
            console.warn(`File processing error (${fieldname}):`, fileErr.message);
          }
        }
      }
    }

    res.status(201).json({ message: 'Application submitted successfully', application: app });
  } catch (error) { next(error); }
};

// ── Student: Get own application ──────────────────────────────────────────────
export const getMyApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.user?.email;

    // First check enrollment_applications by email
    const { data, error } = await supabase
      .from('enrollment_applications')
      .select('*, student_documents(*)')
      .eq('email', email)
      .maybeSingle();

    if (error) { res.status(500); throw new Error(error.message); }

    if (data) {
      return res.json(data);
    }

    // If no application found by email, check if student is already in students table
    // (could have been created by admin directly)
    const { data: student } = await supabase
      .from('students')
      .select('student_id, name, email_id, department, semester, section, created_at')
      .eq('email_id', email)
      .maybeSingle();

    if (student) {
      // Return a synthetic approved application so the UI shows "Registration Complete"
      return res.json({
        id: 0,
        full_name: student.name,
        email: student.email_id,
        phone: '',
        department: student.department,
        semester: student.semester,
        section: student.section || 'A',
        status: 'approved',
        created_at: student.created_at,
        student_documents: [],
      });
    }

    res.status(404); throw new Error('No application found');
  } catch (error) { next(error); }
};

// ── Admin: Get all applications (with filters) ────────────────────────────────
export const getAllApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, department, search } = req.query;
    let query = supabase
      .from('enrollment_applications')
      .select('*, student_documents(*)')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') query = query.eq('status', status as string);
    if (department) query = query.eq('department', department as string);
    if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data ?? []);
  } catch (error) { next(error); }
};

// ── Admin: Get single application ─────────────────────────────────────────────
export const getApplicationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('enrollment_applications')
      .select('*, student_documents(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) { res.status(500); throw new Error(error.message); }
    if (!data) { res.status(404); throw new Error('Application not found'); }
    res.json(data);
  } catch (error) { next(error); }
};

// ── Admin: Approve / Reject ───────────────────────────────────────────────────
export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      res.status(400); throw new Error('Status must be approved or rejected');
    }

    const { data, error } = await supabase
      .from('enrollment_applications')
      .update({ status, remarks: remarks || null, reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    // Auto-create student record on approval
    if (status === 'approved' && data) {
      const { data: exists } = await supabase
        .from('students').select('student_id').eq('email_id', data.email).maybeSingle();
      if (!exists) {
        const studentId = `STU${Date.now()}`;
        await supabase.from('students').insert([{
          student_id: studentId,
          name: data.full_name,
          email_id: data.email,
          department: data.department,
          semester: data.semester,
          section: data.section,
        }]);
      }
    }

    res.json({ message: `Application ${status}`, application: data });
  } catch (error) { next(error); }
};

// ── Admin: Delete application ─────────────────────────────────────────────────
export const deleteApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('enrollment_applications').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Application deleted' });
  } catch (error) { next(error); }
};
