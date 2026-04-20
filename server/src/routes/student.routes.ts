import express from 'express';
import { protect } from '../middlewares/auth';
import { authorize } from '../middlewares/roleGuard';
import { uploadDocuments, payFee, chooseElectives, getMyElective, getElectiveCourses, viewGrades, submitFeedback, getMyFeedbackStatus, getLeaderboard, getTimetable, getProfile, getNotifications, markNotificationRead, getAttendance } from '../controllers/studentController';
import { getAIReview } from '../controllers/aiReviewController';

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.get('/profile', getProfile);

router.post('/documents', uploadDocuments);
router.post('/pay-fee', payFee);
router.post('/electives', chooseElectives);
router.get('/electives', getElectiveCourses);
router.get('/electives/my', getMyElective);
router.get('/grades', viewGrades);
router.post('/feedback', submitFeedback);
router.get('/feedback/status', getMyFeedbackStatus);
router.get('/leaderboard', getLeaderboard);
router.get('/timetable', getTimetable);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.get('/attendance', getAttendance);
router.get('/ai-review', getAIReview);

export default router;
