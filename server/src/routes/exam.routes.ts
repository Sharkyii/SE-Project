import express from 'express';
import { protect } from '../middlewares/auth';
import { authorize } from '../middlewares/roleGuard';
import { createExamEntry, getExamTimetable, deleteExamEntry, getStudentExamTimetable } from '../controllers/examController';

const router = express.Router();

// Admin routes
router.post('/', protect, authorize('admin'), createExamEntry);
router.get('/admin', protect, authorize('admin'), getExamTimetable);
router.delete('/:id', protect, authorize('admin'), deleteExamEntry);

// Student route
router.get('/student', protect, authorize('student', 'admin'), getStudentExamTimetable);

export default router;
