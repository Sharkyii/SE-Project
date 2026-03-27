import express from 'express';
import multer from 'multer';
import { protect } from '../middlewares/auth';
import { authorize } from '../middlewares/roleGuard';
import {
  submitApplication, getMyApplication,
  getAllApplications, getApplicationById,
  updateApplicationStatus, deleteApplication,
} from '../controllers/enrollmentController';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const docFields = upload.fields([
  { name: 'aadhar_card', maxCount: 1 },
  { name: 'college_id', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'other', maxCount: 2 },
]);

// Student
router.post('/apply', protect, authorize('student'), docFields, submitApplication);
router.get('/my', protect, authorize('student'), getMyApplication);

// Admin
router.get('/', protect, authorize('admin'), getAllApplications);
router.get('/:id', protect, authorize('admin'), getApplicationById);
router.patch('/:id/status', protect, authorize('admin'), updateApplicationStatus);
router.delete('/:id', protect, authorize('admin'), deleteApplication);

export default router;
