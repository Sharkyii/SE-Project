import { Request, Response, NextFunction } from 'express';
import { supabase, supabaseAdmin } from '../config/db';
import type { Request as ExpressRequest } from 'express';

type MulterRequest = ExpressRequest & { file?: Express.Multer.File };

// Resolve the student_id from the JWT user (email → students table)
const resolveStudentId = async (user: any): Promise<string> => {
  const email = user?.email;
  if (email) {
    const { data } = await supabase.from('students').select('student_id').eq('email_id', email).single();
    if (data?.student_id) return data.student_id;
  }
  return String(user?.id);
};

// Student: upload receipt → stored as 'pending'
export const uploadReceipt = async (req: MulterRequest, res: Response, next: NextFunction) => {
  try {
    const { fee_type, bank, payment_method } = req.body;
    const file = req.file;

    if (!file) { res.status(400); throw new Error('No file uploaded'); }
    if (!fee_type || !bank || !payment_method) {
      res.status(400); throw new Error('fee_type, bank, and payment_method are required');
    }

    const studentId = await resolveStudentId(req.user);
    const fileName = `${studentId}/${fee_type}_${Date.now()}_${file.originalname}`;

    // Upload to Supabase Storage using admin client (bypasses RLS)
    const { error: storageError } = await supabaseAdmin.storage
      .from('fee-receipts')
      .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: false });

    if (storageError) { res.status(500); throw new Error(`Storage upload failed: ${storageError.message}`); }

    const { data: { publicUrl } } = supabaseAdmin.storage.from('fee-receipts').getPublicUrl(fileName);

    // Insert record with status = 'pending' (awaiting admin approval)
    const { data: record, error: dbError } = await supabase
      .from('fee_receipts')
      .insert([{ student_id: studentId, fee_type, bank, payment_method, file_url: publicUrl, status: 'pending' }])
      .select()
      .single();

    if (dbError) { res.status(500); throw new Error(dbError.message); }

    res.status(201).json({ record, fileUrl: publicUrl, status: 'pending' });
  } catch (error) {
    next(error);
  }
};

// Admin: get all students with their fee receipt statuses
export const getPendingReceipts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get all students
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('student_id, name, email_id, department, semester')
      .order('name');
    if (studentsError) throw studentsError;

    // Get all fee receipts
    const { data: receipts, error: receiptsError } = await supabase
      .from('fee_receipts')
      .select('*')
      .order('uploaded_at', { ascending: false });
    if (receiptsError) throw receiptsError;

    // Map receipts by student_id
    const receiptMap: Record<string, { academic?: any; mess?: any }> = {};
    for (const r of receipts || []) {
      if (!receiptMap[r.student_id]) receiptMap[r.student_id] = {};
      // Keep latest per fee_type
      if (!receiptMap[r.student_id][r.fee_type as 'academic' | 'mess']) {
        receiptMap[r.student_id][r.fee_type as 'academic' | 'mess'] = r;
      }
    }

    // Build response: one row per student
    const result = (students || []).map((s) => ({
      student_id: s.student_id,
      name: s.name,
      email: s.email_id,
      department: s.department,
      semester: s.semester,
      academic: receiptMap[s.student_id]?.academic || null,
      mess: receiptMap[s.student_id]?.mess || null,
    }));

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Admin: approve or reject a receipt
export const verifyReceipt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(action)) {
      res.status(400); throw new Error('action must be "approved" or "rejected"');
    }

    const { data, error } = await supabase
      .from('fee_receipts')
      .update({ status: action })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) { res.status(404); throw new Error('Receipt not found'); }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// Student: get their own receipts
export const getMyReceipts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = await resolveStudentId(req.user);
    const { data, error } = await supabase
      .from('fee_receipts')
      .select('*')
      .eq('student_id', studentId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
