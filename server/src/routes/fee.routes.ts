import express from 'express';
import multer from 'multer';
import { protect } from '../middlewares/auth';
import { authorize } from '../middlewares/roleGuard';
import { uploadReceipt, getMyReceipts, getPendingReceipts, verifyReceipt } from '../controllers/feeController';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Student routes
router.post('/upload', protect, authorize('student'), upload.single('file'), uploadReceipt);
router.get('/my-receipts', protect, authorize('student'), getMyReceipts);

// Admin routes
router.get('/all', protect, authorize('admin'), getPendingReceipts);
router.patch('/:id/verify', protect, authorize('admin'), verifyReceipt);

export default router;
