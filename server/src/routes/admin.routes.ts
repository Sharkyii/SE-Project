import express from 'express';
import { protect } from '../middlewares/auth';
import { authorize as roleGuard } from '../middlewares/roleGuard';
import { createCourse, assignFaculty, verifyUser, getReports, createTimetable, getTimetable } from '../controllers/adminController';

const router = express.Router();

// All routes require login and 'admin' role
router.use(protect);
router.use(roleGuard('admin'));

router.post('/courses', createCourse);
router.post('/assign-faculty', assignFaculty);
router.post('/verify-user', verifyUser);
router.get('/reports', getReports);
router.post('/timetable', createTimetable);
router.get('/timetable', getTimetable);

export default router;
