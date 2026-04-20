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
exports.markFacultyNotificationRead = exports.getFacultyNotifications = exports.getEnrolledStudents = exports.getMyCourses = exports.getFacultyGradeReports = exports.getFacultyTimetable = exports.getMyLeaves = exports.applyLeave = exports.postQuiz = exports.uploadGrades = exports.getAttendanceByDate = exports.markAttendance = void 0;
const db_1 = require("../config/db");
const emailService_1 = require("../services/emailService");
// Mark Attendance (Bulk)
const markAttendance = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, date, records } = req.body;
        // Verify faculty owns course
        const { data: course } = yield db_1.supabaseAdmin
            .from('courses').select('email_id').eq('code', courseId).single();
        if (!course || course.email_id !== req.user.email) {
            res.status(403);
            throw new Error('Not authorized for this course');
        }
        // 1. Delete existing records for course & date
        yield db_1.supabaseAdmin
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
            const { error: insertError } = yield db_1.supabaseAdmin
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
        const { data, error } = yield db_1.supabaseAdmin
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
        const { data: course, error: courseError } = yield db_1.supabaseAdmin
            .from('courses')
            .select('email_id, name')
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
        const { data: student, error: studentError } = yield db_1.supabaseAdmin
            .from('students')
            .select('student_id, name, email_id')
            .eq('email_id', studentEmail)
            .single();
        if (studentError || !student) {
            res.status(404);
            throw new Error('Student not found with that email ID');
        }
        const { data, error } = yield db_1.supabaseAdmin
            .from('grades')
            .insert([{ student_id: student.student_id, course_id: courseId, exam_type: examType, score, status: 'pending' }])
            .select()
            .single();
        if (error)
            throw error;
        // Send email notification to student (when grade is approved, not pending)
        // Note: You might want to send this when admin approves the grade instead
        try {
            if (student.email_id) {
                const emailContent = emailService_1.emailTemplates.gradePublished(student.name, course.name, `${score} (${examType})`, 'Current');
                yield (0, emailService_1.sendEmail)(Object.assign({ to: student.email_id }, emailContent));
            }
        }
        catch (emailError) {
            console.error('Failed to send grade notification email:', emailError);
        }
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
        const { data: quizData, error: quizError } = yield db_1.supabaseAdmin
            .from('quizzes')
            .insert([{ course_id: courseId, faculty_id: facultyId, title, description, due_date: dueDate }])
            .select()
            .single();
        if (quizError)
            throw quizError;
        // Fetch enrolled students
        const { data: enrollments, error: enrollError } = yield db_1.supabaseAdmin
            .from('enrollments')
            .select('student_id')
            .eq('course_id', courseId);
        if (enrollError)
            throw enrollError;
        // Get course and faculty details
        const { data: course } = yield db_1.supabaseAdmin
            .from('courses')
            .select('name')
            .eq('code', courseId)
            .single();
        const { data: faculty } = yield db_1.supabaseAdmin
            .from('faculty')
            .select('name')
            .eq('email_id', facultyId)
            .single();
        if (enrollments && enrollments.length > 0) {
            const notifications = enrollments.map(e => ({
                profile_id: e.student_id,
                message: `New quiz posted for ${courseId}: ${title}. Due on ${dueDate}`
            }));
            const { error: notifError } = yield db_1.supabaseAdmin
                .from('notifications')
                .insert(notifications);
            if (notifError)
                console.error("Error sending notifications", notifError);
            // Send emails to all enrolled students
            try {
                const studentIds = enrollments.map(e => e.student_id);
                const { data: students } = yield db_1.supabaseAdmin
                    .from('students')
                    .select('name, email_id')
                    .in('student_id', studentIds);
                if (students) {
                    const emailPromises = students.map(student => {
                        if (student.email_id) {
                            const emailContent = emailService_1.emailTemplates.quizAssignment(student.name, (course === null || course === void 0 ? void 0 : course.name) || courseId, title, new Date(dueDate).toLocaleDateString(), (faculty === null || faculty === void 0 ? void 0 : faculty.name) || 'Faculty');
                            return (0, emailService_1.sendEmail)(Object.assign({ to: student.email_id }, emailContent));
                        }
                        return Promise.resolve();
                    });
                    yield Promise.allSettled(emailPromises);
                }
            }
            catch (emailError) {
                console.error('Failed to send quiz notification emails:', emailError);
            }
        }
        res.status(201).json({ message: 'Quiz posted successfully', quiz: quizData });
    }
    catch (error) {
        next(error);
    }
});
exports.postQuiz = postQuiz;
// Apply Leave
const applyLeave = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reason, startDate, endDate } = req.body;
        const facultyEmail = req.user.email;
        console.log(`Apply Leave Attempt: facultyEmail=${facultyEmail}, startDate=${startDate}, endDate=${endDate}`);
        if (!reason || !startDate || !endDate) {
            res.status(400);
            throw new Error('Reason, Start Date, and End Date are required');
        }
        // 1. Insert Leave Record using Admin client to bypass RLS
        const { data: leaveData, error: leaveError } = yield db_1.supabaseAdmin
            .from('faculty_leaves')
            .insert([{ faculty_id: facultyEmail, reason, start_date: startDate, end_date: endDate, status: 'pending' }])
            .select()
            .single();
        if (leaveError) {
            console.error('Error inserting faculty leave:', leaveError);
            res.status(500);
            throw new Error(`Database error: ${leaveError.message}. Ensure faculty exists with email ${facultyEmail}`);
        }
        console.log('Leave record inserted successfully:', leaveData.id);
        // 2. Fetch all students enrolled in this faculty's courses
        const { data: myCourses, error: coursesError } = yield db_1.supabaseAdmin
            .from('courses')
            .select('code, name')
            .eq('email_id', facultyEmail);
        if (coursesError)
            console.error('Error fetching faculty courses:', coursesError);
        if (myCourses && myCourses.length > 0) {
            const courseCodes = myCourses.map(c => c.code);
            const { data: enrollments } = yield db_1.supabaseAdmin
                .from('enrollments')
                .select('student_id')
                .in('course_id', courseCodes);
            const { data: electiveEnrollments } = yield db_1.supabaseAdmin
                .from('elective_enrollments')
                .select('student_id')
                .in('course_id', courseCodes);
            const studentIds = Array.from(new Set([
                ...(enrollments || []).map(e => e.student_id),
                ...(electiveEnrollments || []).map(e => e.student_id)
            ]));
            if (studentIds.length > 0) {
                const { data: facultyProfile } = yield db_1.supabaseAdmin
                    .from('faculty')
                    .select('name')
                    .eq('email_id', facultyEmail)
                    .single();
                const facultyName = (facultyProfile === null || facultyProfile === void 0 ? void 0 : facultyProfile.name) || 'A faculty member';
                const notifications = studentIds.map(sid => ({
                    profile_id: sid,
                    message: `Important: ${facultyName} is on leave from ${startDate} to ${endDate}. Reason: ${reason}`
                }));
                const { error: notifError } = yield db_1.supabaseAdmin.from('notifications').insert(notifications);
                if (notifError)
                    console.error('Error inserting notifications:', notifError);
                else
                    console.log(`Notified ${studentIds.length} students about leave.`);
                // Send emails to all affected students
                try {
                    const { data: students } = yield db_1.supabaseAdmin
                        .from('students')
                        .select('name, email_id')
                        .in('student_id', studentIds);
                    if (students) {
                        const emailPromises = students.map(student => {
                            if (student.email_id && myCourses.length > 0) {
                                const emailContent = emailService_1.emailTemplates.classCancelled(student.name, myCourses.map(c => c.name).join(', '), new Date(startDate).toLocaleDateString(), `${startDate} to ${endDate}`, reason);
                                return (0, emailService_1.sendEmail)(Object.assign({ to: student.email_id }, emailContent));
                            }
                            return Promise.resolve();
                        });
                        yield Promise.allSettled(emailPromises);
                    }
                }
                catch (emailError) {
                    console.error('Failed to send leave notification emails:', emailError);
                }
            }
        }
        res.status(201).json({ message: 'Leave application submitted and students notified', leave: leaveData });
    }
    catch (error) {
        next(error);
    }
});
exports.applyLeave = applyLeave;
// Get My Leaves
const getMyLeaves = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield db_1.supabaseAdmin
            .from('faculty_leaves')
            .select('*')
            .eq('faculty_id', req.user.email)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
});
exports.getMyLeaves = getMyLeaves;
// Get Faculty Timetable
const getFacultyTimetable = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, userId, department, semester } = req.query;
        let query = db_1.supabaseAdmin
            .from('timetables')
            .select(`
                *,
                courses (name, code),
                faculty (name)
            `);
        if (type === 'institute') {
            if (department)
                query = query.eq('department', department);
            if (semester)
                query = query.eq('semester', semester);
        }
        else {
            // Default to personal
            const facultyEmail = userId || req.user.email;
            query = query.eq('faculty_id', facultyEmail);
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
        const { data: courses, error: courseError } = yield db_1.supabaseAdmin
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
        const { data: grades, error: gradesError } = yield db_1.supabaseAdmin
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
        const { data, error } = yield db_1.supabaseAdmin
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
        const { data: course } = yield db_1.supabaseAdmin
            .from('courses')
            .select('email_id')
            .eq('code', courseId)
            .single();
        if (!course || course.email_id !== req.user.email) {
            res.status(403);
            throw new Error('Not authorized to view students for this course');
        }
        const { data, error } = yield db_1.supabaseAdmin
            .from('enrollments')
            .select('students(name, email_id, student_id)')
            .eq('course_id', courseId);
        if (error)
            throw error;
        // Also fetch from elective enrollments
        const { data: electiveData } = yield db_1.supabaseAdmin
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
const getFacultyNotifications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data: me, error: meError } = yield db_1.supabaseAdmin
            .from('users')
            .select('profile_id')
            .eq('id', req.user.id)
            .single();
        if (meError || !(me === null || me === void 0 ? void 0 : me.profile_id)) {
            res.status(404);
            throw new Error('Faculty profile not found');
        }
        const { data, error } = yield db_1.supabaseAdmin
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
exports.getFacultyNotifications = getFacultyNotifications;
const markFacultyNotificationRead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { data: me, error: meError } = yield db_1.supabaseAdmin
            .from('users')
            .select('profile_id')
            .eq('id', req.user.id)
            .single();
        if (meError || !(me === null || me === void 0 ? void 0 : me.profile_id)) {
            res.status(404);
            throw new Error('Faculty profile not found');
        }
        const { data, error } = yield db_1.supabaseAdmin
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
exports.markFacultyNotificationRead = markFacultyNotificationRead;
