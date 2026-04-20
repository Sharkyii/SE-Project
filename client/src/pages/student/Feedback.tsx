import React, { useEffect, useState } from 'react';
import { MessageSquare, Star, CheckCircle, Lock, Send, Loader2 } from 'lucide-react';
import api from '../../services/api';

interface CourseEntry {
  courseId: string;
  courseName: string;
  facultyId: string;
  facultyName: string;
  submitted: boolean;
}

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const StarRating: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`w-8 h-8 transition-colors ${s <= (hovered || value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
          />
        </button>
      ))}
    </div>
  );
};

const ratingLabel = (r: number) => ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][r] || '';

const Feedback: React.FC = () => {
  const [semester, setSemester] = useState(String(new Date().getMonth() < 6 ? 2 : 1));
  const [courses, setCourses] = useState<CourseEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<CourseEntry | null>(null);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStatus = async (sem: string) => {
    setLoading(true);
    setCourses([]);
    setSelected(null);
    try {
      const res = await api.get(`/student/feedback/status?semester=${sem}`);
      setCourses(res.data.courses || []);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(semester); }, [semester]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || rating === 0) return;
    setSubmitting(true);
    setMsg(null);
    try {
      await api.post('/student/feedback', {
        facultyId: selected.facultyId,
        courseId: selected.courseId,
        semester: Number(semester),
        rating,
        comments: comments.trim() || undefined
      });
      setMsg({ type: 'success', text: 'Feedback submitted anonymously. Thank you!' });
      setCourses(prev => prev.map(c =>
        c.courseId === selected.courseId && c.facultyId === selected.facultyId
          ? { ...c, submitted: true } : c
      ));
      setSelected(null);
      setRating(0);
      setComments('');
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to submit feedback.' });
    } finally {
      setSubmitting(false);
    }
  };

  const pending = courses.filter(c => !c.submitted);
  const done = courses.filter(c => c.submitted);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-green-600/30 to-teal-600/30 rounded-2xl border border-green-500/20">
          <MessageSquare className="w-8 h-8 text-green-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Anonymous Feedback</h1>
          <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Your identity is never revealed to faculty
          </p>
        </div>
      </div>

      {/* Semester selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-400">Semester:</label>
        <select
          value={semester}
          onChange={e => setSemester(e.target.value)}
          className="px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm text-white outline-none focus:border-blue-500"
        >
          {SEMESTERS.map(s => <option key={s} value={s} className="bg-gray-900">Semester {s}</option>)}
        </select>
      </div>

      {/* Message */}
      {msg && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm ${msg.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {msg.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : null}
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="glass-effect rounded-2xl border border-gray-800 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-3" />
          <p className="text-gray-400">Loading your courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="glass-effect rounded-2xl border border-gray-800 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No enrolled courses found for Semester {semester}.</p>
          <p className="text-gray-600 text-sm mt-2">Feedback is available for courses you're enrolled in.</p>
        </div>
      ) : (
        <>
          {/* Pending feedback */}
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Pending ({pending.length})</h2>
              {pending.map(c => (
                <button
                  key={`${c.courseId}_${c.facultyId}`}
                  onClick={() => { setSelected(c); setRating(0); setComments(''); setMsg(null); }}
                  className={`w-full glass-effect rounded-xl border p-4 text-left transition-all hover:border-blue-500/50 ${selected?.courseId === c.courseId ? 'border-blue-500/50 bg-blue-500/5' : 'border-gray-800'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{c.courseName}</p>
                      <p className="text-gray-400 text-sm mt-0.5">{c.facultyName}</p>
                    </div>
                    <span className="text-xs px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full">Pending</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Feedback form */}
          {selected && (
            <form onSubmit={handleSubmit} className="glass-effect rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6 space-y-6">
              <div>
                <p className="text-white font-semibold text-lg">{selected.courseName}</p>
                <p className="text-gray-400 text-sm">{selected.facultyName}</p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-3">Overall Rating</label>
                <StarRating value={rating} onChange={setRating} />
                {rating > 0 && <p className="text-yellow-400 text-sm mt-2 font-medium">{ratingLabel(rating)}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Comments <span className="text-gray-600">(optional)</span></label>
                <textarea
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  rows={4}
                  placeholder="Share your thoughts about the course and teaching... (anonymous)"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={rating === 0 || submitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Anonymously
                </button>
                <button type="button" onClick={() => setSelected(null)} className="px-4 py-2.5 text-gray-400 hover:text-white text-sm transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Completed */}
          {done.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Submitted ({done.length})</h2>
              {done.map(c => (
                <div key={`${c.courseId}_${c.facultyId}`} className="glass-effect rounded-xl border border-green-500/20 bg-green-500/5 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{c.courseName}</p>
                    <p className="text-gray-400 text-sm mt-0.5">{c.facultyName}</p>
                  </div>
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" /> Submitted
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Privacy note */}
      <div className="flex items-start gap-3 p-4 bg-gray-900/30 rounded-xl border border-gray-800 text-xs text-gray-500">
        <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>Your feedback is completely anonymous. Only administrators can view aggregated results. Faculty only see average ratings and comments — never individual student identities.</p>
      </div>
    </div>
  );
};

export default Feedback;
