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
exports.getAttendance = exports.markNotificationRead = exports.getNotifications = exports.getTimetable = exports.getLeaderboard = exports.submitFeedback = exports.viewGrades = exports.getElectiveCourses = exports.getMyElective = exports.chooseElectives = exports.payFee = exports.uploadDocuments = exports.getProfile = void 0;
const db_1 = require("../config/db");
const getProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield db_1.supabase
            .from('students')
            .select('student_id, name, email_id, department, semester, section')
            .eq('email_id', req.user.email)
            .single();
        if (error || !data) {
            res.status(404);
            throw new Error('Student profile not found');
        }
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
});
exports.getProfile = getProfile;
const uploadDocuments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).json({ message: 'Document upload functionality ready' });
    }
    catch (error) {
        next(error);
    }
});
exports.uploadDocuments = uploadDocuments;
const payFee = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).json({ message: 'Fee payment successful' });
    }
    catch (error) {
        next(error);
    }
});
exports.payFee = payFee;
const chooseElectives = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, semester, academicYear } = req.body;
        // Resolve student_id from email
        const { data: studentData } = yield db_1.supabase
            .from('students').select('student_id').eq('email_id', req.user.email).single();
        const studentId = studentData === null || studentData === void 0 ? void 0 : studentData.student_id;
        if (!studentId) {
            res.status(404);
            throw new Error('Student profile not found');
        }
        // Check course is elective
        const { data: course } = yield db_1.supabase
            .from('courses').select('code, name, is_elective, max_seats').eq('code', courseId).single();
        if (!(course === null || course === void 0 ? void 0 : course.is_elective)) {
            res.status(400);
            throw new Error('Course is not an elective');
        }
        // Check seats available
        const { count } = yield db_1.supabase
            .from('elective_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', courseId)
            .eq('semester', semester)
            .eq('academic_year', academicYear);
        if ((count || 0) >= (course.max_seats || 30)) {
            res.status(409);
            throw new Error('No seats available for this elective');
        }
        // Upsert — replace previous elective choice for same semester/year
        const { data, error } = yield db_1.supabase
            .from('elective_enrollments')
            .upsert([{ student_id: studentId, course_id: courseId, semester, academic_year: academicYear }], { onConflict: 'student_id,semester,academic_year' })
            .select().single();
        if (error)
            throw error;
        res.status(200).json({ enrollment: data, course });
    }
    catch (error) {
        next(error);
    }
});
exports.chooseElectives = chooseElectives;
const getMyElective = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { semester, academicYear } = req.query;
        const { data: studentData } = yield db_1.supabase
            .from('students').select('student_id').eq('email_id', req.user.email).single();
        const studentId = studentData === null || studentData === void 0 ? void 0 : studentData.student_id;
        const { data, error } = yield db_1.supabase
            .from('elective_enrollments')
            .select('*, courses(name, code, description, credits)')
            .eq('student_id', studentId)
            .eq('semester', semester)
            .eq('academic_year', academicYear)
            .maybeSingle();
        if (error)
            throw error;
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
});
exports.getMyElective = getMyElective;
const getElectiveCourses = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { semester, academicYear } = req.query;
        const { data: courses, error } = yield db_1.supabase
            .from('courses')
            .select('id, name, code, description, credits, max_seats, elective_semester')
            .eq('is_elective', true);
        if (error)
            throw error;
        // Filter by semester in JS — show electives for this semester or untagged ones
        const filtered = (courses || []).filter(c => c.elective_semester === null || c.elective_semester === undefined || c.elective_semester === Number(semester));
        // Get seat counts for each elective
        const enriched = yield Promise.all(filtered.map((c) => __awaiter(void 0, void 0, void 0, function* () {
            const { count } = yield db_1.supabase
                .from('elective_enrollments')
                .select('*', { count: 'exact', head: true })
                .eq('course_id', c.code)
                .eq('semester', semester)
                .eq('academic_year', academicYear);
            return Object.assign(Object.assign({}, c), { enrolled: count || 0, available_seats: (c.max_seats || 30) - (count || 0) });
        })));
        res.status(200).json(enriched);
    }
    catch (error) {
        next(error);
    }
});
exports.getElectiveCourses = getElectiveCourses;
const viewGrades = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield db_1.supabase
            .from('grades')
            .select('*, courses(name)')
            .eq('student_id', req.user.profile_id)
            .eq('status', 'published');
        if (error)
            throw error;
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
});
exports.viewGrades = viewGrades;
const submitFeedback = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { facultyId, courseId, semester, rating, comments } = req.body;
        const { data, error } = yield db_1.supabase
            .from('feedback')
            .insert([{ student_id: req.user.profile_id, faculty_id: facultyId, course_id: courseId, semester, rating, comments }])
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
exports.submitFeedback = submitFeedback;
const getLeaderboard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield db_1.supabase
            .from('leaderboard')
            .select('*, students(name)')
            .order('gpa', { ascending: false })
            .limit(10);
        if (error)
            throw error;
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
});
exports.getLeaderboard = getLeaderboard;
// Get Student Timetable
const getTimetable = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { semester, department, section } = req.query;
        let query = db_1.supabase.from('timetables').select(`
            *,
            courses (name, code),
            faculty (name)
        `);
        if (department && semester && section) {
            query = query
                .eq('department', department)
                .eq('semester', semester)
                .eq('section', section);
        }
        else {
            if (req.user && req.user.profile_id) {
                const { data: studentData, error: studentError } = yield db_1.supabase
                    .from('students')
                    .select('department, semester')
                    .eq('student_id', req.user.profile_id)
                    .single();
                if (studentData) {
                    query = query
                        .eq('department', studentData.department)
                        .eq('semester', studentData.semester);
                }
            }
        }
        const { data, error } = yield query;
        if (error)
            throw error;
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
});
exports.getTimetable = getTimetable;
// Get Notifications
const getNotifications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield db_1.supabase
            .from('notifications')
            .select('*')
            .eq('student_id', req.user.profile_id)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
});
exports.getNotifications = getNotifications;
// Mark Notification as Read
const markNotificationRead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { data, error } = yield db_1.supabase
            .from('notifications')
            .update({ read_status: true })
            .eq('id', id)
            .eq('student_id', req.user.profile_id)
            .select();
        if (error)
            throw error;
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
});
exports.markNotificationRead = markNotificationRead;
// Get Attendance
const getAttendance = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data: student, error: studentError } = yield db_1.supabase
            .from('students')
            .select('student_id')
            .eq('email_id', req.user.email)
            .single();
        if (studentError || !student) {
            res.status(404);
            throw new Error('Student profile not found');
        }
        const { data, error } = yield db_1.supabase
            .from('attendance')
            .select('*, courses(name, code)')
            .eq('student_id', student.student_id)
            .order('date', { ascending: false });
        if (error)
            throw error;
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
});
exports.getAttendance = getAttendance;
