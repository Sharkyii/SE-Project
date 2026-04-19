import { Request, Response, NextFunction } from 'express';
import { supabase, supabaseAdmin } from '../config/db';

// Mark Attendance (Bulk)
export const markAttendance = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId, date, records } = req.body;

        // Verify faculty owns course
        const { data: course } = await supabaseAdmin
            .from('courses').select('email_id').eq('code', courseId).single();
        if (!course || course.email_id !== req.user.email) {
            res.status(403); throw new Error('Not authorized for this course');
        }

        // 1. Delete existing records for course & date
        await supabaseAdmin
            .from('attendance')
            .delete()
            .eq('course_id', courseId)
            .eq('date', date);

        // 2. Insert new records
        if (records && records.length > 0) {
            const insertData = records.map((r: any) => ({
                student_id: r.student_id,
                course_id: courseId,
                date,
                status: r.status
            }));

            const { error: insertError } = await supabaseAdmin
                .from('attendance')
                .insert(insertData);

            if (insertError) throw insertError;
        }

        res.status(200).json({ message: 'Attendance saved successfully' });
    } catch (error) {
        next(error);
    }
};

// Get Attendance for a specific course and date
export const getAttendanceByDate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId, date } = req.query;
        if (!courseId || !date) {
            res.status(400); throw new Error('Course ID and Date are required');
        }

        const { data, error } = await supabaseAdmin
            .from('attendance')
            .select('*')
            .eq('course_id', courseId as string)
            .eq('date', date as string);

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

// Upload Grades
export const uploadGrades = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { studentEmail, courseId, examType, score } = req.body;

        // Verify that the currently logged-in faculty is assigned to teach this course
        const { data: course, error: courseError } = await supabaseAdmin
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
        const { data: student, error: studentError } = await supabaseAdmin
            .from('students')
            .select('student_id')
            .eq('email_id', studentEmail)
            .single();
            
        if (studentError || !student) {
            res.status(404);
            throw new Error('Student not found with that email ID');
        }

        const { data, error } = await supabaseAdmin
            .from('grades')
            .insert([{ student_id: student.student_id, course_id: courseId, exam_type: examType, score, status: 'pending' }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
};

// Post Quiz and Notify Students
export const postQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId, title, description, dueDate, facultyId } = req.body;
        
        // Insert Quiz
        const { data: quizData, error: quizError } = await supabaseAdmin
            .from('quizzes')
            .insert([{ course_id: courseId, faculty_id: facultyId, title, description, due_date: dueDate }])
            .select()
            .single();

        if (quizError) throw quizError;

        // Fetch enrolled students
        const { data: enrollments, error: enrollError } = await supabaseAdmin
            .from('enrollments')
            .select('student_id')
            .eq('course_id', courseId);
            
        if (enrollError) throw enrollError;

        if (enrollments && enrollments.length > 0) {
            const notifications = enrollments.map(e => ({
                student_id: e.student_id,
                message: `New quiz posted for ${courseId}: ${title}. Due on ${dueDate}`
            }));
            
            const { error: notifError } = await supabaseAdmin
                .from('notifications')
                .insert(notifications);
                
            if (notifError) console.error("Error sending notifications", notifError);
        }

        res.status(201).json({ message: 'Quiz posted successfully', quiz: quizData });
    } catch (error) {
        next(error);
    }
};


// Apply Leave
export const applyLeave = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { reason, startDate, endDate } = req.body;
        const facultyEmail = req.user.email;

        console.log(`Apply Leave Attempt: facultyEmail=${facultyEmail}, startDate=${startDate}, endDate=${endDate}`);

        if (!reason || !startDate || !endDate) {
            res.status(400); throw new Error('Reason, Start Date, and End Date are required');
        }

        // 1. Insert Leave Record using Admin client to bypass RLS
        const { data: leaveData, error: leaveError } = await supabaseAdmin
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
        const { data: myCourses, error: coursesError } = await supabaseAdmin
            .from('courses')
            .select('code')
            .eq('email_id', facultyEmail);

        if (coursesError) console.error('Error fetching faculty courses:', coursesError);

        if (myCourses && myCourses.length > 0) {
            const courseCodes = myCourses.map(c => c.code);

            const { data: enrollments } = await supabaseAdmin
                .from('enrollments')
                .select('student_id')
                .in('course_id', courseCodes);

            const { data: electiveEnrollments } = await supabaseAdmin
                .from('elective_enrollments')
                .select('student_id')
                .in('course_id', courseCodes);

            const studentIds = Array.from(new Set([
                ...(enrollments || []).map(e => e.student_id),
                ...(electiveEnrollments || []).map(e => e.student_id)
            ]));

            if (studentIds.length > 0) {
                const { data: facultyProfile } = await supabaseAdmin
                    .from('faculty')
                    .select('name')
                    .eq('email_id', facultyEmail)
                    .single();

                const facultyName = facultyProfile?.name || 'A faculty member';
                
                const notifications = studentIds.map(sid => ({
                    student_id: sid,
                    message: `Important: ${facultyName} is on leave from ${startDate} to ${endDate}. Reason: ${reason}`
                }));

                const { error: notifError } = await supabaseAdmin.from('notifications').insert(notifications);
                if (notifError) console.error('Error inserting notifications:', notifError);
                else console.log(`Notified ${studentIds.length} students about leave.`);
            }
        }

        res.status(201).json({ message: 'Leave application submitted and students notified', leave: leaveData });
    } catch (error) {
        next(error);
    }
};


// Get My Leaves
export const getMyLeaves = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('faculty_leaves')
            .select('*')
            .eq('faculty_id', req.user.email)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};



// Get Faculty Timetable
export const getFacultyTimetable = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type, userId, department, semester } = req.query;

        let query = supabaseAdmin
            .from('timetables')
            .select(`
                *,
                courses (name, code),
                faculty (name)
            `);

        if (type === 'institute') {
            if (department) query = query.eq('department', department);
            if (semester) query = query.eq('semester', semester);
        } else {
            // Default to personal
            const facultyEmail = userId || req.user.email;
            query = query.eq('faculty_id', facultyEmail);
        }

        const { data, error } = await query;
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

// Get Faculty Grade Reports
export const getFacultyGradeReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { facultyId } = req.query;

        if (!facultyId) {
            res.status(400);
            throw new Error('Faculty ID is required');
        }

        // Fetch courses taught by this faculty
        const { data: courses, error: courseError } = await supabaseAdmin
            .from('courses')
            .select('code, name')
            .eq('email_id', facultyId);

        if (courseError) throw courseError;
        
        if (!courses || courses.length === 0) {
            res.status(200).json([]);
            return;
        }

        const courseCodes = courses.map(c => c.code);

        // Fetch grades for these courses
        const { data: grades, error: gradesError } = await supabaseAdmin
            .from('grades')
            .select('*, courses(name)')
            .in('course_id', courseCodes);

        if (gradesError) throw gradesError;

        res.status(200).json(grades);
    } catch (error) {
        next(error);
    }
};

// Get courses assigned to the logged-in faculty
export const getMyCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('courses')
            .select('code, name')
            .eq('email_id', req.user.email);
            
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

// Get students enrolled in a specific course
export const getEnrolledStudents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId } = req.params;
        
        // Verify faculty owns course
        const { data: course } = await supabaseAdmin
            .from('courses')
            .select('email_id')
            .eq('code', courseId)
            .single();
            
        if (!course || course.email_id !== req.user.email) {
            res.status(403); 
            throw new Error('Not authorized to view students for this course');
        }

        const { data, error } = await supabaseAdmin
            .from('enrollments')
            .select('students(name, email_id, student_id)')
            .eq('course_id', courseId);
            
        if (error) throw error;
        
        // Also fetch from elective enrollments
        const { data: electiveData } = await supabaseAdmin
            .from('elective_enrollments')
            .select('students(name, email_id, student_id)')
            .eq('course_id', courseId);
            
        const allStudents: any[] = [...(data || []), ...(electiveData || [])]
            .filter(e => e.students)
            .map((e: any) => e.students)
            .flat();
            
        // Deduplicate students by email_id
        const uniqueStudents = Array.from(new Map(allStudents.map(s => [s.email_id, s])).values());
        
        res.status(200).json(uniqueStudents);
    } catch (error) {
        next(error);
    }
};
