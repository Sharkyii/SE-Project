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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAttendance = exports.assignCourseToStudent = exports.approveGrades = exports.getPendingGrades = exports.getElectiveSummary = exports.getReports = exports.verifyUser = exports.getTimetable = exports.createTimetable = exports.assignFaculty = exports.unassignFaculty = exports.getCourses = exports.createCourse = exports.getFaculty = exports.getStudents = exports.createFaculty = exports.createStudent = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../config/db");
// Create Student (admin only)
const createStudent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, student_id, department, semester, section } = req.body;
        if (!name || !email || !password || !student_id || !department || !semester) {
            res.status(400);
            throw new Error('All fields are required');
        }
        const { data: exists } = yield db_1.supabaseAdmin.from('users').select('id').eq('email', email).single();
        if (exists) {
            res.status(400);
            throw new Error('Email already registered');
        }
        const hashed = yield bcryptjs_1.default.hash(password, 10);
        const { data: userRes, error: userErr } = yield db_1.supabaseAdmin
            .from('users').insert([{ email, password: hashed, role: 'student' }]).select().single();
        if (userErr)
            throw userErr;
        const { data: studentRes, error: studentErr } = yield db_1.supabaseAdmin
            .from('students')
            .insert([{ student_id, name, email_id: email, department, semester: Number(semester), section: section || 'A' }])
            .select().single();
        if (studentErr)
            throw studentErr;
        yield db_1.supabaseAdmin.from('users').update({ profile_id: student_id }).eq('id', userRes.id);
        res.status(201).json({ message: 'Student created', student: studentRes });
    }
    catch (error) {
        next(error);
    }
});
exports.createStudent = createStudent;
// Create Faculty (admin only)
const createFaculty = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, department, designation } = req.body;
        if (!name || !email || !password || !department || !designation) {
            res.status(400);
            throw new Error('All fields are required');
        }
        const { data: exists } = yield db_1.supabaseAdmin.from('users').select('id').eq('email', email).single();
        if (exists) {
            res.status(400);
            throw new Error('Email already registered');
        }
        const hashed = yield bcryptjs_1.default.hash(password, 10);
        const { data: userRes, error: userErr } = yield db_1.supabaseAdmin
            .from('users').insert([{ email, password: hashed, role: 'faculty' }]).select().single();
        if (userErr)
            throw userErr;
        const { data: facultyRes, error: facultyErr } = yield db_1.supabaseAdmin
            .from('faculty')
            .insert([{ user_id: String(userRes.id), email_id: email, name, department, designation }])
            .select().single();
        if (facultyErr)
            throw facultyErr;
        yield db_1.supabaseAdmin.from('users').update({ profile_id: email }).eq('id', userRes.id);
        res.status(201).json({ message: 'Faculty created', faculty: facultyRes });
    }
    catch (error) {
        next(error);
    }
});
exports.createFaculty = createFaculty;
// Get all students
const getStudents = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield db_1.supabaseAdmin.from('students').select('*').order('created_at', { ascending: false });
        if (error)
            throw error;
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
});
exports.getStudents = getStudents;
// Get all faculty
const getFaculty = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield db_1.supabaseAdmin.from('faculty').select('*').order('created_at', { ascending: false });
        if (error)
            throw error;
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
});
exports.getFaculty = getFaculty;
// Create Course
const createCourse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, code, description, credits, email_id, is_elective, max_seats, elective_semester } = req.body;
        const { data, error } = yield db_1.supabaseAdmin
            .from('courses')
            .insert([{ name, code, description, credits, email_id: email_id || null, is_elective: is_elective || false, max_seats: max_seats || 30, elective_semester: elective_semester || null }])
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
exports.createCourse = createCourse;
// Get all courses (with faculty info)
const getCourses = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data: courses, error: coursesError } = yield db_1.supabaseAdmin
            .from('courses')
            .select('*')
            .order('created_at', { ascending: false });
        if (coursesError)
            throw coursesError;
        const { data: facultyData, error: facultyError } = yield db_1.supabaseAdmin
            .from('faculty')
            .select('name, email_id, department, designation');
        if (facultyError)
            throw facultyError;
        // Build a lookup map for faculty by email_id
        const facultyMap = new Map();
        if (facultyData) {
            for (const f of facultyData) {
                facultyMap.set(f.email_id, f);
            }
        }
        // Merge faculty info into each course
        const result = (courses || []).map(course => (Object.assign(Object.assign({}, course), { faculty: course.email_id ? (facultyMap.get(course.email_id) || null) : null })));
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.getCourses = getCourses;
// Unassign Faculty from Course
const unassignFaculty = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        const { data, error } = yield db_1.supabase
            .from('courses')
            .update({ email_id: null })
            .eq('id', courseId)
            .select()
            .single();
        if (error)
            throw error;
        if (!data) {
            res.status(404);
            throw new Error('Course not found');
        }
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
});
exports.unassignFaculty = unassignFaculty;
// Assign Faculty to Course
const assignFaculty = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, facultyId } = req.body; // facultyId here is the email_id
        const { data, error } = yield db_1.supabase
            .from('courses')
            .update({ email_id: facultyId })
            .eq('id', courseId)
            .select()
            .single();
        if (error)
            throw error;
        if (!data) {
            res.status(404);
            throw new Error('Course not found');
        }
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
});
exports.assignFaculty = assignFaculty;
// Create Timetable Entry
const createTimetable = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { course_id, faculty_id, day, start_time, end_time, semester, department, section, room_no } = req.body;
        // Conflict Validation
        // Check if faculty is already booked at this time
        const { data: conflicts, error: conflictError } = yield db_1.supabase
            .from('timetables')
            .select('*')
            .eq('faculty_id', faculty_id)
            .eq('day', day)
            .or(`and(start_time.lte.${start_time},end_time.gt.${start_time}),and(start_time.lt.${end_time},end_time.gte.${end_time})`);
        if (conflictError)
            throw conflictError;
        if (conflicts && conflicts.length > 0) {
            res.status(409);
            throw new Error(`Faculty is already assigned to another class on ${day} between ${start_time} and ${end_time}`);
        }
        const { data, error } = yield db_1.supabase
            .from('timetables')
            .insert([{ course_id, faculty_id, day, start_time, end_time, semester, department, section, room_no }])
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
exports.createTimetable = createTimetable;
// Get Timetable
const getTimetable = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, userId, department, semester, section } = req.query;
        let query = db_1.supabase.from('timetables').select(`
            *,
            courses (name, code),
            faculty (name)
        `);
        if (type === 'personal' && userId) {
            // Assuming userId passed is the faculty email_id for now, or we need to look it up.
            // If userId is the internal ID, we need to join. But let's assume valid email_id or we fetch it.
            // For simplicity, let's assume the frontend passes the faculty's email_id as userId for now
            // Or better, we use the auth middleware to get the user's email if they are faculty.
            query = query.eq('faculty_id', userId);
        }
        else if (type === 'student' && department && semester && section) {
            query = query.eq('department', department).eq('semester', semester).eq('section', section);
        }
        else if (type === 'institute') {
            if (department)
                query = query.eq('department', department);
            if (semester)
                query = query.eq('semester', semester);
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
// Verify User (e.g., mark as active or verified - adding a column if needed, but for now just a dummy update)
const verifyUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        // Assuming we might have a verified column, or just toggling something.
        // For now, let's just log it or update a placeholder.
        res.status(200).json({ message: `User ${userId} verified` });
    }
    catch (error) {
        next(error);
    }
});
exports.verifyUser = verifyUser;
// Get Reports (Basic counts for now)
const getReports = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { count: studentsCount } = yield db_1.supabase.from('students').select('*', { count: 'exact', head: true });
        const { count: facultyCount } = yield db_1.supabase.from('faculty').select('*', { count: 'exact', head: true });
        const { count: coursesCount } = yield db_1.supabase.from('courses').select('*', { count: 'exact', head: true });
        res.status(200).json({
            stats: {
                students: studentsCount || 0,
                faculty: facultyCount || 0,
                courses: coursesCount || 0,
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getReports = getReports;
// Get elective enrollment summary
const getElectiveSummary = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { semester, academicYear } = req.query;
        const { data, error } = yield db_1.supabase
            .from('elective_enrollments')
            .select('*, courses(name, code, max_seats), students(name, student_id, department)')
            .eq('semester', semester)
            .eq('academic_year', academicYear)
            .order('course_id');
        if (error)
            throw error;
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
});
exports.getElectiveSummary = getElectiveSummary;
// Get Pending Grades
const getPendingGrades = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield db_1.supabase
            .from('grades')
            .select(`
                *,
                students (name, student_id),
                courses (name, code)
            `)
            .eq('status', 'pending');
        if (error)
            throw error;
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
});
exports.getPendingGrades = getPendingGrades;
// Approve Grades (Publish)
const approveGrades = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { gradeIds } = req.body; // Array of grade IDs to approve
        if (!gradeIds || !Array.isArray(gradeIds) || gradeIds.length === 0) {
            res.status(400);
            throw new Error('No grade IDs provided');
        }
        const { data, error } = yield db_1.supabase
            .from('grades')
            .update({ status: 'published' })
            .in('id', gradeIds)
            .select();
        res.status(200).json({ message: 'Grades published successfully', data });
    }
    catch (error) {
        next(error);
    }
});
exports.approveGrades = approveGrades;
// Assign Course to Student (Enrollment)
const assignCourseToStudent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { studentId, courseId, semester, academicYear } = req.body;
        if (!studentId || !courseId || !semester || !academicYear) {
            res.status(400);
            throw new Error('Please provide all required fields');
        }
        // Check if student exists
        const { data: student, error: studentError } = yield db_1.supabase
            .from('students')
            .select('student_id')
            .eq('student_id', studentId)
            .single();
        if (studentError || !student) {
            res.status(404);
            throw new Error('Student not found');
        }
        // Check if course exists
        const { data: course, error: courseError } = yield db_1.supabase
            .from('courses')
            .select('code')
            .eq('code', courseId)
            .single();
        if (courseError || !course) {
            res.status(404);
            throw new Error('Course not found');
        }
        // Insert enrollment
        const { data, error } = yield db_1.supabase
            .from('enrollments')
            .insert([{
                student_id: studentId,
                course_id: courseId,
                semester,
                academic_year: academicYear
            }])
            .select()
            .single();
        // Handle unique constraint violation (already enrolled)
        if (error) {
            if (error.code === '23505') {
                res.status(409);
                throw new Error('Student is already enrolled in this course for this semester.');
            }
            throw error;
        }
        res.status(201).json({ message: 'Course assigned successfully', enrollment: data });
    }
    catch (error) {
        next(error);
    }
});
exports.assignCourseToStudent = assignCourseToStudent;
// Get All Attendance
const getAllAttendance = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, date } = req.query;
        let query = db_1.supabase
            .from('attendance')
            .select(`
                *,
                students (name, department, semester),
                courses (name, code)
            `)
            .order('date', { ascending: false })
            .limit(1000);
        if (courseId)
            query = query.eq('course_id', courseId);
        if (date)
            query = query.eq('date', date);
        const { data, error } = yield query;
        if (error)
            throw error;
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllAttendance = getAllAttendance;
