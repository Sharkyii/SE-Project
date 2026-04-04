import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/db';

// Mark Attendance
export const markAttendance = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { studentId, courseId, date, status } = req.body;
        const { data, error } = await supabase
            .from('attendance')
            .insert([{ student_id: studentId, course_id: courseId, date, status }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
};

// Upload Grades
export const uploadGrades = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { studentEmail, courseId, examType, score } = req.body;

        // Verify that the currently logged-in faculty is assigned to teach this course
        const { data: course, error: courseError } = await supabase
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
        const { data: student, error: studentError } = await supabase
            .from('students')
            .select('student_id')
            .eq('email_id', studentEmail)
            .single();
            
        if (studentError || !student) {
            res.status(404);
            throw new Error('Student not found with that email ID');
        }

        const { data, error } = await supabase
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
        const { data: quizData, error: quizError } = await supabase
            .from('quizzes')
            .insert([{ course_id: courseId, faculty_id: facultyId, title, description, due_date: dueDate }])
            .select()
            .single();

        if (quizError) throw quizError;

        // Fetch enrolled students
        const { data: enrollments, error: enrollError } = await supabase
            .from('enrollments')
            .select('student_id')
            .eq('course_id', courseId);
            
        if (enrollError) throw enrollError;

        if (enrollments && enrollments.length > 0) {
            const notifications = enrollments.map(e => ({
                student_id: e.student_id,
                message: `New quiz posted for ${courseId}: ${title}. Due on ${dueDate}`
            }));
            
            const { error: notifError } = await supabase
                .from('notifications')
                .insert(notifications);
                
            if (notifError) console.error("Error sending notifications", notifError);
        }

        res.status(201).json({ message: 'Quiz posted successfully', quiz: quizData });
    } catch (error) {
        next(error);
    }
};


// Apply Leave (Placeholder)
export const applyLeave = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { reason, startDate, endDate } = req.body;
        // Logic to store leave application
        res.status(201).json({ message: 'Leave application submitted' });
    } catch (error) {
        next(error);
    }
};

// Get Faculty Timetable
export const getFacultyTimetable = async (req: Request, res: Response, next: NextFunction) => {
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

        const { data, error } = await supabase
            .from('timetables')
            .select(`
                *,
                courses (name, code),
                faculty (name)
            `)
            .eq('faculty_id', facultyId);

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
        const { data: courses, error: courseError } = await supabase
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
        const { data: grades, error: gradesError } = await supabase
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
        const { data, error } = await supabase
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
        const { data: course } = await supabase
            .from('courses')
            .select('email_id')
            .eq('code', courseId)
            .single();
            
        if (!course || course.email_id !== req.user.email) {
            res.status(403); 
            throw new Error('Not authorized to view students for this course');
        }

        const { data, error } = await supabase
            .from('enrollments')
            .select('students(name, email_id, student_id)')
            .eq('course_id', courseId);
            
        if (error) throw error;
        
        // Also fetch from elective enrollments
        const { data: electiveData } = await supabase
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
