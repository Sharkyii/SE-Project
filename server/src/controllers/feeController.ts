import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/db';
import type { Request as ExpressRequest } from 'express';

type MulterRequest = ExpressRequest & { file?: Express.Multer.File };

// Student: upload receipt → stored as 'pending'
export const uploadReceipt = async (req: MulterRequest, res: Response, next: NextFunction) => {
  try {
    const { fee_type, bank, payment_method } = req.body;
    const file = req.file;

    if (!file) { res.status(400); throw new Error('No file uploaded'); }
    if (!fee_type || !bank || !payment_method) {
      res.status(400); throw new Error('fee_type, bank, and payment_method are required');
    }

    const studentId: string = req.user?.profile_id || req.user?.id?.toString();
    const fileName = `${studentId}/${fee_type}_${Date.now()}_${file.originalname}`;

    // Upload to Supabase Storage
    const { error: storageError } = await supabase.storage
      .from('fee-receipts')
      .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: false });

    if (storageError) { res.status(500); throw new Error(`Storage upload failed: ${storageError.message}`); }

    const { data: { publicUrl } } = supabase.storage.from('fee-receipts').getPublicUrl(fileName);

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

// Admin: get all pending receipts
export const getPendingReceipts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('fee_receipts')
      .select('*, students(name)')
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
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
    const studentId = req.user?.profile_id || req.user?.id?.toString();
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
