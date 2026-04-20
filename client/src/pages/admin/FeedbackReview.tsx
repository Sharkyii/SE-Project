import React, { useEffect, useState } from 'react';
import { MessageSquare, Star, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import api from '../../services/api';

interface CourseStats {
  courseId: string;
  courseName: string;
  totalResponses: number;
  averageRating: number;
  ratingDistribution: { rating: number; count: number }[];
  comments: string[];
}

interface FacultyFeedback {
  facultyId: string;
  facultyName: string;
  courses: CourseStats[];
}

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const StarDisplay: React.FC<{ value: number }> = ({ value }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <Star key={s} className={`w-4 h-4 ${s <= Math.round(value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
    ))}
  </div>
);

const ratingColor = (r: number) => r >= 4 ? 'text-green-400' : r >= 3 ? 'text-yellow-400' : 'text-red-400';

const FeedbackReview: React.FC = () => {
  const [data, setData] = useState<FacultyFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [semester, setSemester] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchFeedback = async (sem?: string) => {
    setLoading(true);
    try {
      const params = sem ? `?semester=${sem}` : '';
      const res = await api.get(`/admin/feedback${params}`);
      setData(res.data);
    } catch { setData([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFeedback(); }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-green-600/30 to-teal-600/30 rounded-2xl border border-green-500/20">
            <MessageSquare className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Faculty Feedback</h1>
            <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Anonymous student feedback — admin view only
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={semester}
            onChange={e => { setSemester(e.target.value); fetchFeedback(e.target.value || undefined); }}
            className="px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="" className="bg-gray-900">All Semesters</option>
            {SEMESTERS.map(s => <option key={s} value={s} className="bg-gray-900">Semester {s}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="glass-effect rounded-2xl border border-gray-800 p-12 text-center">
          <div className="w-8 h-8 border-4 border-t-green-500 border-gray-700 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Loading feedback...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="glass-effect rounded-2xl border border-gray-800 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No feedback submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map(faculty => {
            const avgOverall = faculty.courses.length > 0
              ? (faculty.courses.reduce((s, c) => s + c.averageRating, 0) / faculty.courses.length).toFixed(2)
              : 'N/A';
            const totalResponses = faculty.courses.reduce((s, c) => s + c.totalResponses, 0);
            const isOpen = expanded === faculty.facultyId;

            return (
              <div key={faculty.facultyId} className="glass-effect rounded-2xl border border-gray-800 overflow-hidden">
                {/* Faculty header */}
                <button
                  onClick={() => setExpanded(isOpen ? null : faculty.facultyId)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {faculty.facultyName.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold">{faculty.facultyName}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{faculty.courses.length} course{faculty.courses.length !== 1 ? 's' : ''} · {totalResponses} response{totalResponses !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${ratingColor(Number(avgOverall))}`}>{avgOverall}</p>
                      <p className="text-xs text-gray-500">avg rating</p>
                    </div>
                    <StarDisplay value={Number(avgOverall)} />
                    {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </button>

                {/* Expanded courses */}
                {isOpen && (
                  <div className="border-t border-gray-800 divide-y divide-gray-800">
                    {faculty.courses.map(course => (
                      <div key={course.courseId} className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{course.courseName}</p>
                            <p className="text-gray-500 text-xs">{course.totalResponses} response{course.totalResponses !== 1 ? 's' : ''}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <StarDisplay value={course.averageRating} />
                            <span className={`text-xl font-bold ${ratingColor(course.averageRating)}`}>{course.averageRating}</span>
                          </div>
                        </div>

                        {/* Rating distribution */}
                        <div className="space-y-1.5">
                          {[5, 4, 3, 2, 1].map(r => {
                            const item = course.ratingDistribution.find(d => d.rating === r);
                            const count = item?.count || 0;
                            const pct = course.totalResponses > 0 ? (count / course.totalResponses) * 100 : 0;
                            return (
                              <div key={r} className="flex items-center gap-3 text-xs">
                                <span className="text-gray-400 w-4">{r}</span>
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                <div className="flex-1 bg-gray-800 rounded-full h-2">
                                  <div
                                    className="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-gray-500 w-6 text-right">{count}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Anonymous comments */}
                        {course.comments.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Student Comments</p>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {course.comments.map((c, i) => (
                                <div key={i} className="bg-gray-900/50 rounded-lg px-4 py-3 text-sm text-gray-300 border border-gray-800">
                                  "{c}"
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FeedbackReview;
