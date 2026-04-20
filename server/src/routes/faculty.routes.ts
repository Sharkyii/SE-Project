import express from 'express';
import { protect } from '../middlewares/auth';
import { authorize } from '../middlewares/roleGuard';
import { 
    markAttendance, 
    uploadGrades, 
    postQuiz, 
    applyLeave, 
    getMyLeaves,
    getFacultyGradeReports, 
    getFacultyTimetable, 
    getMyCourses, 
    getEnrolledStudents, 
    getAttendanceByDate 
} from '../controllers/facultyController';

const router = express.Router();

router.use(protect);
router.use(authorize('faculty'));

router.get('/courses', getMyCourses);
router.get('/courses/:courseId/students', getEnrolledStudents);

router.get('/timetable', getFacultyTimetable);
router.get('/attendance', getAttendanceByDate);
router.post('/attendance', markAttendance);
router.post('/grades', uploadGrades);
router.get('/grades/reports', getFacultyGradeReports);
router.post('/quizzes', postQuiz);
router.post('/leave', applyLeave);
router.get('/leave/my', getMyLeaves);

export default router;
