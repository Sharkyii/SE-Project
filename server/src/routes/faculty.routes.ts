import express from 'express';
import { protect } from '../middlewares/auth';
import { authorize } from '../middlewares/roleGuard';
import { markAttendance, uploadGrades, postQuiz, applyLeave } from '../controllers/facultyController';

const router = express.Router();

router.use(protect);
router.use(authorize('faculty'));

router.post('/attendance', markAttendance);
router.post('/grades', uploadGrades);
router.post('/quizzes', postQuiz);
router.post('/leave', applyLeave);

export default router;
