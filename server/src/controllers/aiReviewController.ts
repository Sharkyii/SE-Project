import { Request, Response, NextFunction } from 'express';
import Groq from 'groq-sdk';
import { supabase, supabaseAdmin } from '../config/db';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export const getAIReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentEmail = req.user.email;

    // Fetch student profile
    const { data: student } = await supabase
      .from('students')
      .select('student_id, name, department, semester')
      .eq('email_id', studentEmail)
      .single();

    if (!student) { res.status(404); throw new Error('Student profile not found'); }

    // Fetch grades
    const { data: grades } = await supabaseAdmin
      .from('grades')
      .select('course_id, exam_type, score, status, courses(name)')
      .eq('student_id', student.student_id)
      .eq('status', 'published');

    // Fetch attendance
    const { data: attendance } = await supabaseAdmin
      .from('attendance')
      .select('course_id, status, courses(name)')
      .eq('student_id', student.student_id);

    // Fetch enrollments
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('course_id, courses(name, credits)')
      .eq('student_id', student.student_id);

    // Fetch placement selections
    const { data: placements } = await supabaseAdmin
      .from('placement_selections')
      .select('round_number, companies(name)')
      .eq('student_id', student.student_id);

    // Process attendance per course
    const attendanceMap: Record<string, { present: number; total: number; name: string }> = {};
    for (const a of attendance || []) {
      if (!attendanceMap[a.course_id]) {
        attendanceMap[a.course_id] = { present: 0, total: 0, name: (a.courses as any)?.name || a.course_id };
      }
      attendanceMap[a.course_id].total++;
      if (a.status === 'present') attendanceMap[a.course_id].present++;
    }

    const attendanceSummary = Object.values(attendanceMap).map(c => ({
      course: c.name,
      percentage: c.total > 0 ? Math.round((c.present / c.total) * 100) : 0,
      present: c.present,
      total: c.total
    }));

    // Process grades per course
    const gradeMap: Record<string, { name: string; scores: { type: string; score: number }[] }> = {};
    for (const g of grades || []) {
      if (!gradeMap[g.course_id]) {
        gradeMap[g.course_id] = { name: (g.courses as any)?.name || g.course_id, scores: [] };
      }
      gradeMap[g.course_id].scores.push({ type: g.exam_type, score: g.score });
    }

    const gradesSummary = Object.values(gradeMap).map(c => ({
      course: c.name,
      scores: c.scores,
      average: c.scores.length > 0
        ? Math.round(c.scores.reduce((s, x) => s + x.score, 0) / c.scores.length)
        : null
    }));

    const overallAvg = gradesSummary.length > 0
      ? Math.round(gradesSummary.reduce((s, c) => s + (c.average || 0), 0) / gradesSummary.filter(c => c.average !== null).length)
      : null;

    const overallAttendance = attendanceSummary.length > 0
      ? Math.round(attendanceSummary.reduce((s, c) => s + c.percentage, 0) / attendanceSummary.length)
      : null;

    // Build prompt for Groq
    const prompt = `You are an academic advisor AI for ABV-IIITM Gwalior. Analyze this student's academic data and provide a comprehensive, personalized review.

STUDENT PROFILE:
- Name: ${student.name}
- Department: ${student.department}
- Semester: ${student.semester}
- Enrolled Courses: ${enrollments?.length || 0}

GRADES (Published):
${gradesSummary.length > 0
  ? gradesSummary.map(c =>
      `- ${c.course}: ${c.scores.map(s => `${s.type}=${s.score}`).join(', ')} | Avg: ${c.average ?? 'N/A'}`
    ).join('\n')
  : '- No published grades yet'}
Overall Average Score: ${overallAvg ?? 'N/A'}

ATTENDANCE:
${attendanceSummary.length > 0
  ? attendanceSummary.map(c => `- ${c.course}: ${c.percentage}% (${c.present}/${c.total} classes)`).join('\n')
  : '- No attendance records yet'}
Overall Attendance: ${overallAttendance ?? 'N/A'}%

PLACEMENT STATUS:
${placements && placements.length > 0
  ? placements.map(p => `- Selected for Round ${p.round_number} at ${(p.companies as any)?.name}`).join('\n')
  : '- No placement selections yet'}

Please provide a structured review with these exact sections:

1. OVERALL PERFORMANCE SUMMARY (2-3 sentences about their current standing)

2. STRENGTHS (bullet points - what they're doing well)

3. AREAS FOR IMPROVEMENT (bullet points - specific weaknesses with actionable advice)

4. ATTENDANCE ANALYSIS (comment on attendance, flag any courses below 75%)

5. ACADEMIC RISK ASSESSMENT (Low/Medium/High risk with reasoning)

6. PERSONALIZED RECOMMENDATIONS (3-5 specific, actionable steps they should take)

7. MOTIVATIONAL MESSAGE (1-2 encouraging sentences tailored to their situation)

Be specific, data-driven, and constructive. Use the actual course names and scores in your analysis.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1500,
    });

    const review = completion.choices[0]?.message?.content || 'Unable to generate review.';

    res.json({
      student,
      academicData: {
        grades: gradesSummary,
        attendance: attendanceSummary,
        overallAverage: overallAvg,
        overallAttendance,
        enrolledCourses: enrollments?.length || 0,
        placements: placements?.length || 0,
      },
      review,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
