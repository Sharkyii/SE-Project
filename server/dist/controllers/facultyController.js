"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnrolledStudents = exports.getMyCourses = exports.getFacultyGradeReports = exports.getFacultyTimetable = exports.applyLeave = exports.postQuiz = exports.uploadGrades = exports.getAttendanceByDate = exports.markAttendance = void 0;
const db_1 = require("../config/db");
// Mark Attendance (Bulk)
const markAttendance = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, date, records } = req.body;
        // Verify faculty owns course
        const { data: course } = yield db_1.supabase
            .from('courses').select('email_id').eq('code', courseId).single();
        if (!course || course.email_id !== req.user.email) {
            res.status(403);
            throw new Error('Not authorized for this course');
        }
        // 1. Delete existing records for course & date
        yield db_1.supabase
            .from('attendance')
            .delete()
            .eq('course_id', courseId)
            .eq('date', date);
        // 2. Insert new records
        if (records && records.length > 0) {
            const insertData = records.map((r) => ({
                student_id: r.student_id,
                course_id: courseId,
                date,
                status: r.status
            }));
            const { error: insertError } = yield db_1.supabase
                .from('attendance')
                .insert(insertData);
            if (insertError)
                throw insertError;
        }
        res.status(200).json({ message: 'Attendance saved successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.markAttendance = markAttendance;
// Get Attendance for a specific course and date
const getAttendanceByDate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, date } = req.query;
        if (!courseId || !date) {
            res.status(400);
            throw new Error('Course ID and Date are required');
        }
        const { data, error } = yield db_1.supabase
            .from('attendance')
            .select('*')
            .eq('course_id', courseId)
            .eq('date', date);
        if (error)
            throw error;
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
});
exports.getAttendanceByDate = getAttendanceByDate;
// Upload Grades
const uploadGrades = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentEmail, courseId, examType, score } = req.body;
        // Verify that the currently logged-in faculty is assigned to teach this course
        const { data: course, error: courseError } = yield db_1.supabase
            .from('courses')
            .select('email_id')
            .eq('code', courseId)
            .single();
        if (courseError || !course) {
            res.status(404);
            throw new Error('Course not found');
        }
        if (course.email_id !== req.user.email) {
            res.status(403);
            throw new Error('You are not authorized to upload grades for this course.');
        }
        // Find student ID using email
        const { data: student, error: studentError } = yield db_1.supabase
            .from('students')
            .select('student_id')
            .eq('email_id', studentEmail)
            .single();
        if (studentError || !student) {
            res.status(404);
            throw new Error('Student not found with that email ID');
        }
        const { data, error } = yield db_1.supabase
            .from('grades')
            .insert([{ student_id: student.student_id, course_id: courseId, exam_type: examType, score, status: 'pending' }])
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json(data);
    }
    catch (error) {
        next(error);
    }
});
exports.uploadGrades = uploadGrades;
// Post Quiz and Notify Students
const postQuiz = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, title, description, dueDate, facultyId } = req.body;
        // Insert Quiz
        const { data: quizData, error: quizError } = yield db_1.supabase
            .from('quizzes')
            .insert([{ course_id: courseId, faculty_id: facultyId, title, description, due_date: dueDate }])
            .select()
            .single();
        if (quizError)
            throw quizError;
        // Fetch enrolled students
        const { data: enrollments, error: enrollError } = yield db_1.supabase
            .from('enrollments')
            .select('student_id')
            .eq('course_id', courseId);
        if (enrollError)
            throw enrollError;
        if (enrollments && enrollments.length > 0) {
            const notifications = enrollments.map(e => ({
                student_id: e.student_id,
                message: `New quiz posted for ${courseId}: ${title}. Due on ${dueDate}`
            }));
            const { error: notifError } = yield db_1.supabase
                .from('notifications')
                .insert(notifications);
            if (notifError)
                console.error("Error sending notifications", notifError);
        }
        res.status(201).json({ message: 'Quiz posted successfully', quiz: quizData });
    }
    catch (error) {
        next(error);
    }
});
exports.postQuiz = postQuiz;
// Apply Leave (Placeholder)
const applyLeave = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reason, startDate, endDate } = req.body;
        // Logic to store leave application
        res.status(201).json({ message: 'Leave application submitted' });
    }
    catch (error) {
        next(error);
    }
});
exports.applyLeave = applyLeave;
// Get Faculty Timetable
const getFacultyTimetable = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Assuming the middleware populates user in req.user, and it has email or id
        // For now, let's assume we pass facultyId in query or params or body if not in auth
        // But better is to trust the token. Let's assume req.user.email is available if we extend Request
        // For now, let's accept it as a query param for flexibility in this "personal" view
        const { facultyId } = req.query;
        if (!facultyId) {
            res.status(400);
            throw new Error('Faculty ID is required');
        }
        const { data, error } = yield db_1.supabase
            .from('timetables')
            .select(`
                *,
                courses (name, code),
                faculty (name)
            `)
            .eq('faculty_id', facultyId);
        if (error)
            throw error;
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
});
exports.getFacultyTimetable = getFacultyTimetable;
// Get Faculty Grade Reports
const getFacultyGradeReports = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { facultyId } = req.query;
        if (!facultyId) {
            res.status(400);
            throw new Error('Faculty ID is required');
        }
        // Fetch courses taught by this faculty
        const { data: courses, error: courseError } = yield db_1.supabase
            .from('courses')
            .select('code, name')
            .eq('email_id', facultyId);
        if (courseError)
            throw courseError;
        if (!courses || courses.length === 0) {
            res.status(200).json([]);
            return;
        }
        const courseCodes = courses.map(c => c.code);
        // Fetch grades for these courses
        const { data: grades, error: gradesError } = yield db_1.supabase
            .from('grades')
            .select('*, courses(name)')
            .in('course_id', courseCodes);
        if (gradesError)
            throw gradesError;
        res.status(200).json(grades);
    }
    catch (error) {
        next(error);
    }
});
exports.getFacultyGradeReports = getFacultyGradeReports;
// Get courses assigned to the logged-in faculty
const getMyCourses = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield db_1.supabase
            .from('courses')
            .select('code, name')
            .eq('email_id', req.user.email);
        if (error)
            throw error;
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
});
exports.getMyCourses = getMyCourses;
// Get students enrolled in a specific course
const getEnrolledStudents = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        // Verify faculty owns course
        const { data: course } = yield db_1.supabase
            .from('courses')
            .select('email_id')
            .eq('code', courseId)
            .single();
        if (!course || course.email_id !== req.user.email) {
            res.status(403);
            throw new Error('Not authorized to view students for this course');
        }
        const { data, error } = yield db_1.supabase
            .from('enrollments')
            .select('students(name, email_id, student_id)')
            .eq('course_id', courseId);
        if (error)
            throw error;
        // Also fetch from elective enrollments
        const { data: electiveData } = yield db_1.supabase
            .from('elective_enrollments')
            .select('students(name, email_id, student_id)')
            .eq('course_id', courseId);
        const allStudents = [...(data || []), ...(electiveData || [])]
            .filter(e => e.students)
            .map((e) => e.students)
            .flat();
        // Deduplicate students by email_id
        const uniqueStudents = Array.from(new Map(allStudents.map(s => [s.email_id, s])).values());
        res.status(200).json(uniqueStudents);
    }
    catch (error) {
        next(error);
    }
});
exports.getEnrolledStudents = getEnrolledStudents;
