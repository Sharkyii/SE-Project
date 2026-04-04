import express from 'express';
import { protect } from '../middlewares/auth';
import { authorize } from '../middlewares/roleGuard';
import { markAttendance, uploadGrades, postQuiz, applyLeave, getFacultyGradeReports, getFacultyTimetable, getMyCourses, getEnrolledStudents } from '../controllers/facultyController';

const router = express.Router();

router.use(protect);
router.use(authorize('faculty'));

router.get('/courses', getMyCourses);
router.get('/courses/:courseId/students', getEnrolledStudents);

router.get('/timetable', getFacultyTimetable);
router.post('/attendance', markAttendance);
router.post('/grades', uploadGrades);
router.get('/grades/reports', getFacultyGradeReports);
router.post('/quizzes', postQuiz);
router.post('/leave', applyLeave);

export default router;
