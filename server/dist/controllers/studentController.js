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
exports.getAttendance = exports.markNotificationRead = exports.getNotifications = exports.getTimetable = exports.getLeaderboard = exports.getMyFeedbackStatus = exports.submitFeedback = exports.viewGrades = exports.getElectiveCourses = exports.getMyElective = exports.chooseElectives = exports.payFee = exports.uploadDocuments = exports.getProfile = void 0;
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
        const { data: student } = yield db_1.supabase
            .from('students')
            .select('student_id')
            .eq('email_id', req.user.email)
            .single();
        if (!student) {
            res.status(404);
            throw new Error('Student profile not found');
        }
        const { data, error } = yield db_1.supabase
            .from('grades')
            .select('*, courses(name)')
            .eq('student_id', student.student_id)
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
        if (!facultyId || !courseId || !semester || !rating) {
            res.status(400);
            throw new Error('facultyId, courseId, semester and rating are required');
        }
        if (rating < 1 || rating > 5) {
            res.status(400);
            throw new Error('Rating must be between 1 and 5');
        }
        // Resolve student_id from email
        const { data: student } = yield db_1.supabase
            .from('students')
            .select('student_id')
            .eq('email_id', req.user.email)
            .single();
        if (!student) {
            res.status(404);
            throw new Error('Student profile not found');
        }
        // Check if already submitted for this faculty+course+semester
        const { data: existing } = yield db_1.supabase
            .from('feedback')
            .select('id')
            .eq('student_id', student.student_id)
            .eq('email_id', facultyId)
            .eq('course_id', courseId)
            .eq('semester', semester)
            .maybeSingle();
        if (existing) {
            res.status(409);
            throw new Error('You have already submitted feedback for this course this semester');
        }
        const { data, error } = yield db_1.supabase
            .from('feedback')
            .insert([{
                student_id: student.student_id,
                email_id: facultyId,
                course_id: courseId,
                semester: Number(semester),
                rating: Number(rating),
                comments: comments || null
            }])
            .select()
            .single();
        if (error)
            throw error;
        // Return without student_id to keep it anonymous from client perspective
        res.status(201).json({ message: 'Feedback submitted anonymously', id: data.id });
    }
    catch (error) {
        next(error);
    }
});
exports.submitFeedback = submitFeedback;
const getMyFeedbackStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { semester } = req.query;
        const { data: student } = yield db_1.supabase
            .from('students')
            .select('student_id')
            .eq('email_id', req.user.email)
            .single();
        if (!student) {
            res.status(404);
            throw new Error('Student not found');
        }
        // Get courses the student is enrolled in this semester
        const { data: enrollments } = yield db_1.supabase
            .from('enrollments')
            .select('course_id, courses(name, email_id, faculty(name))')
            .eq('student_id', student.student_id);
        // Get already submitted feedback
        const { data: submitted } = yield db_1.supabase
            .from('feedback')
            .select('course_id, email_id')
            .eq('student_id', student.student_id)
            .eq('semester', Number(semester));
        const submittedSet = new Set((submitted || []).map(f => `${f.course_id}_${f.email_id}`));
        const courses = (enrollments || [])
            .filter((e) => { var _a; return (_a = e.courses) === null || _a === void 0 ? void 0 : _a.email_id; })
            .map((e) => {
            var _a, _b, _c, _d, _e;
            return ({
                courseId: e.course_id,
                courseName: (_a = e.courses) === null || _a === void 0 ? void 0 : _a.name,
                facultyId: (_b = e.courses) === null || _b === void 0 ? void 0 : _b.email_id,
                facultyName: ((_d = (_c = e.courses) === null || _c === void 0 ? void 0 : _c.faculty) === null || _d === void 0 ? void 0 : _d.name) || 'Unknown Faculty',
                submitted: submittedSet.has(`${e.course_id}_${(_e = e.courses) === null || _e === void 0 ? void 0 : _e.email_id}`)
            });
        });
        res.status(200).json({ courses, semester });
    }
    catch (error) {
        next(error);
    }
});
exports.getMyFeedbackStatus = getMyFeedbackStatus;
const getLeaderboard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { department, semester } = req.query;
        // Get current student's profile for context
        const { data: me } = yield db_1.supabase
            .from('students')
            .select('student_id, department, semester')
            .eq('email_id', req.user.email)
            .single();
        const dept = department || (me === null || me === void 0 ? void 0 : me.department);
        const sem = semester ? Number(semester) : me === null || me === void 0 ? void 0 : me.semester;
        // Get all students in the same department+semester
        const { data: students, error: studentsErr } = yield db_1.supabase
            .from('students')
            .select('student_id, name, department, semester, section')
            .eq('department', dept)
            .eq('semester', sem);
        if (studentsErr)
            throw studentsErr;
        if (!students || students.length === 0) {
            return res.status(200).json({ leaderboard: [], myRank: null, department: dept, semester: sem });
        }
        const studentIds = students.map(s => s.student_id);
        // Get all published grades for these students
        const { data: grades } = yield db_1.supabase
            .from('grades')
            .select('student_id, score, exam_type')
            .in('student_id', studentIds)
            .eq('status', 'published');
        // Get attendance for these students
        const { data: attendance } = yield db_1.supabase
            .from('attendance')
            .select('student_id, status')
            .in('student_id', studentIds);
        // Calculate average score and attendance per student
        const scoreMap = {};
        const attendanceMap = {};
        for (const g of grades || []) {
            if (!scoreMap[g.student_id])
                scoreMap[g.student_id] = [];
            scoreMap[g.student_id].push(g.score);
        }
        for (const a of attendance || []) {
            if (!attendanceMap[a.student_id])
                attendanceMap[a.student_id] = { present: 0, total: 0 };
            attendanceMap[a.student_id].total++;
            if (a.status === 'present')
                attendanceMap[a.student_id].present++;
        }
        // Build ranked list
        const ranked = students.map(s => {
            const scores = scoreMap[s.student_id] || [];
            const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
            const att = attendanceMap[s.student_id];
            const attPct = att && att.total > 0 ? Math.round((att.present / att.total) * 100) : 0;
            // Composite score: 70% grades + 30% attendance
            const composite = scores.length > 0 ? Math.round(avg * 0.7 + attPct * 0.3) : 0;
            return {
                student_id: s.student_id,
                name: s.name,
                department: s.department,
                semester: s.semester,
                section: s.section,
                averageScore: scores.length > 0 ? Math.round(avg) : null,
                attendancePercentage: att ? attPct : null,
                compositeScore: composite,
                totalGrades: scores.length,
            };
        })
            .sort((a, b) => b.compositeScore - a.compositeScore)
            .map((s, i) => (Object.assign(Object.assign({}, s), { rank: i + 1 })));
        const myRank = ranked.find(s => s.student_id === (me === null || me === void 0 ? void 0 : me.student_id)) || null;
        res.status(200).json({ leaderboard: ranked, myRank, department: dept, semester: sem });
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
        const { data: me, error: meError } = yield db_1.supabase
            .from('users')
            .select('profile_id')
            .eq('id', req.user.id)
            .single();
        if (meError || !(me === null || me === void 0 ? void 0 : me.profile_id)) {
            res.status(404);
            throw new Error('User profile not found');
        }
        const { data, error } = yield db_1.supabase
            .from('notifications')
            .select('*')
            .eq('profile_id', me.profile_id)
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
        const { data: me, error: meError } = yield db_1.supabase
            .from('users')
            .select('profile_id')
            .eq('id', req.user.id)
            .single();
        if (meError || !(me === null || me === void 0 ? void 0 : me.profile_id)) {
            res.status(404);
            throw new Error('User profile not found');
        }
        const { data, error } = yield db_1.supabase
            .from('notifications')
            .update({ read_status: true })
            .eq('id', id)
            .eq('profile_id', me.profile_id)
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
