import express from 'express';
import { protect } from '../middlewares/auth';
import { authorize } from '../middlewares/roleGuard';
import { uploadDocuments, payFee, chooseElectives, viewGrades, submitFeedback, getLeaderboard, getTimetable } from '../controllers/studentController';

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.post('/documents', uploadDocuments);
router.post('/pay-fee', payFee);
router.post('/electives', chooseElectives);
router.get('/grades', viewGrades);
router.post('/feedback', submitFeedback);
router.get('/leaderboard', getLeaderboard);
router.get('/timetable', getTimetable);

export default router;
