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
    setCourses(coursesRes.data || []);
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
    <div className="p-6 flex flex-col items-center justify-center py-20 text-gray-500">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
      <p className="font-medium">Loading electives...</p>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-purple-400" />
            Elective Selection
        </h1>
        <p className="text-gray-400 mt-1">
            Semester {semester} · A.Y. {CURRENT_YEAR - 1}–{CURRENT_YEAR} &nbsp;·&nbsp; Choose one elective course
        </p>
      </header>

      {/* Currently selected */}
      {myElective && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-start gap-4 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/20">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">Your current selection</p>
            <h2 className="text-white font-bold text-xl">{myElective.courses.name}</h2>
            <p className="text-gray-400 text-xs font-mono font-bold mt-1 uppercase tracking-tighter">{myElective.course_id} · {myElective.courses.credits} Credits</p>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed max-w-2xl">{myElective.courses.description}</p>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-4 opacity-60">You can change your selection until the enrollment deadline.</p>
          </div>
        </div>
      )}

      {msg && (
        <div className={clsx('flex items-center gap-3 p-4 rounded-xl text-sm border animate-in fade-in slide-in-from-top-2 duration-300',
          msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20')}>
          {msg.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          {msg.text}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="glass-effect rounded-2xl border border-dashed border-gray-700 p-20 text-center shadow-xl">
          <BookOpen className="w-16 h-16 text-gray-700 mx-auto mb-6 opacity-20" />
          <h3 className="text-xl font-bold text-white mb-2">No electives available</h3>
          <p className="text-gray-400 max-w-xs mx-auto">Elective courses haven't been published for this semester yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {courses.map((course) => {
            const isSelected = myElective?.course_id === course.code;
            const isFull = course.available_seats <= 0;
            const isSubmitting = submitting === course.code;

            return (
              <div key={course.code} className={clsx(
                'glass-effect rounded-2xl border p-6 flex flex-col gap-4 transition-all hover:scale-[1.02] shadow-xl group',
                isSelected ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-gray-800 hover:border-gray-600'
              )}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors truncate">{course.name}</h3>
                    <p className="text-xs font-bold text-gray-500 font-mono tracking-tighter uppercase mt-1">{course.code} · {course.credits} Credits</p>
                  </div>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-md flex-shrink-0">
                      Enrolled
                    </span>
                  )}
                </div>

                {course.description && (
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{course.description}</p>
                )}

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center">
                            <Users size={10} className="text-gray-400" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Enrollment</span>
                        <span className="text-xs font-bold text-gray-300">{course.enrolled} / {course.max_seats}</span>
                    </div>
                    {isFull ? (
                         <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-2 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">Full</span>
                    ) : (
                         <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest ml-2">{course.available_seats} Left</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleChoose(course.code)}
                    disabled={isSelected || isFull || !!submitting}
                    className={clsx(
                      'px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95',
                      isSelected
                        ? 'bg-emerald-600 text-white cursor-default shadow-emerald-600/20'
                        : isFull
                          ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 disabled:opacity-50'
                    )}
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (isSelected ? 'Selected' : isFull ? 'No Seats' : 'Enroll Now')}
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
