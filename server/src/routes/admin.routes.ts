import express from 'express';
import { protect } from '../middlewares/auth';
import { authorize as roleGuard } from '../middlewares/roleGuard';
import { createCourse, getCourses, assignFaculty, unassignFaculty, verifyUser, getReports, createTimetable, getTimetable, createStudent, createFaculty, getStudents, getFaculty, getElectiveSummary } from '../controllers/adminController';

const router = express.Router();

router.use(protect);
router.use(roleGuard('admin'));

router.post('/courses', createCourse);
router.get('/courses', getCourses);
router.post('/assign-faculty', assignFaculty);
router.patch('/courses/:courseId/unassign', unassignFaculty);
router.post('/verify-user', verifyUser);
router.get('/reports', getReports);
router.post('/timetable', createTimetable);
router.get('/timetable', getTimetable);
router.post('/students', createStudent);
router.get('/students', getStudents);
router.post('/faculty', createFaculty);
router.get('/faculty', getFaculty);
router.get('/electives/summary', getElectiveSummary);

export default router;

