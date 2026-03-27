import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, Users, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import clsx from 'clsx';

interface ElectiveCourse {
  id: number;
  name: string;
  code: string;
  description: string;
  credits: number;
  max_seats: number;
  enrolled: number;
  available_seats: number;
}

interface MyElective {
  course_id: string;
  courses: { name: string; code: string; description: string; credits: number };
}

interface StudentProfile {
  semester: number;
  department: string;
}

const CURRENT_YEAR = new Date().getFullYear();

const Electives: React.FC = () => {
  const [courses, setCourses] = useState<ElectiveCourse[]>([]);
  const [myElective, setMyElective] = useState<MyElective | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async (semester: number, year: number) => {
    const [coursesRes, myRes] = await Promise.all([
      api.get<ElectiveCourse[]>(`/student/electives?semester=${semester}&academicYear=${year}`),
      api.get<MyElective | null>(`/student/electives/my?semester=${semester}&academicYear=${year}`),
    ]);
    setCourses(coursesRes.data);
    setMyElective(myRes.data);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data: studentData } = await api.get<StudentProfile>('/student/profile');
        setProfile(studentData);
        await fetchData(studentData.semester, CURRENT_YEAR);
      } catch {
        // profile fetch failed, try with semester 1
        try { await fetchData(1, CURRENT_YEAR); } catch { /* silent */ }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const semester = profile?.semester ?? 1;

  const handleChoose = async (courseCode: string) => {
    setSubmitting(courseCode);
    setMsg(null);
    try {
      await api.post('/student/electives', {
        courseId: courseCode,
        semester,
        academicYear: CURRENT_YEAR,
      });
      setMsg({ type: 'success', text: 'Elective registered successfully.' });
      await fetchData(semester, CURRENT_YEAR);
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to register elective.' });
    } finally { setSubmitting(null); }
  };

  if (loading) return (
    <div className="p-6 flex items-center gap-2 text-gray-400">
      <Loader2 className="w-5 h-5 animate-spin" /> Loading electives...
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Elective Course Selection</h1>
      <p className="text-gray-400 text-sm mb-6">
        Semester {semester} · A.Y. {CURRENT_YEAR - 1}–{CURRENT_YEAR} &nbsp;·&nbsp; Choose one elective course
      </p>

      {/* Currently selected */}
      {myElective && (
        <div className="bg-green-900/30 border border-green-700 rounded-xl p-4 mb-6 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-300 font-medium text-sm">Your current elective</p>
            <p className="text-white font-semibold">{myElective.courses.name}
              <span className="text-gray-400 font-normal text-sm ml-2">({myElective.course_id})</span>
            </p>
            <p className="text-gray-400 text-xs mt-0.5">{myElective.courses.credits} credits · {myElective.courses.description}</p>
            <p className="text-gray-500 text-xs mt-1">You can change your selection until the deadline.</p>
          </div>
        </div>
      )}

      {msg && (
        <div className={clsx('flex items-center gap-2 p-3 rounded-lg mb-4 text-sm',
          msg.type === 'success' ? 'bg-green-900/30 text-green-300 border border-green-700' : 'bg-red-900/30 text-red-300 border border-red-700')}>
          {msg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
          <BookOpen className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No elective courses available yet.</p>
          <p className="text-gray-500 text-sm mt-1">Check back later or contact your administrator.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => {
            const isSelected = myElective?.course_id === course.code;
            const isFull = course.available_seats <= 0;
            const isSubmitting = submitting === course.code;

            return (
              <div key={course.code} className={clsx(
                'bg-gray-800 rounded-xl border p-5 flex flex-col gap-3 transition-colors',
                isSelected ? 'border-green-600 bg-green-900/10' : 'border-gray-700 hover:border-gray-500'
              )}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-white font-semibold">{course.name}</h3>
                    <p className="text-gray-400 text-xs mt-0.5">{course.code} · {course.credits} credits</p>
                  </div>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-xs text-green-400 bg-green-900/40 border border-green-700 px-2 py-0.5 rounded-full flex-shrink-0">
                      <CheckCircle className="w-3 h-3" /> Selected
                    </span>
                  )}
                </div>

                {course.description && (
                  <p className="text-gray-400 text-sm leading-relaxed">{course.description}</p>
                )}

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-700">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{course.enrolled}/{course.max_seats} enrolled</span>
                    {isFull && <span className="text-red-400 font-medium ml-1">· Full</span>}
                    {!isFull && <span className="text-gray-500 ml-1">· {course.available_seats} seats left</span>}
                  </div>

                  <button
                    onClick={() => handleChoose(course.code)}
                    disabled={isSelected || isFull || !!submitting}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5',
                      isSelected
                        ? 'bg-green-800 text-green-300 cursor-default'
                        : isFull
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-60'
                    )}
                  >
                    {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                    {isSelected ? 'Enrolled' : isFull ? 'Full' : 'Choose'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Electives;
