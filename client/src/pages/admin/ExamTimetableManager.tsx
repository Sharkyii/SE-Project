import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Save, Trash2, X, Calendar, Clock } from 'lucide-react';
import api from '../../services/api';

const EXAM_TYPES = ['mid', 'final', 'quiz', 'assignment'] as const;
type ExamType = typeof EXAM_TYPES[number];

const DEPARTMENTS = ['CSE','ECE','EEE','ME','CE','IT','MBA','MCA'];

const EXAM_TYPE_COLORS: Record<ExamType, { card: string; badge: string }> = {
    mid:        { card: 'border-l-blue-500 bg-blue-50',   badge: 'bg-blue-100 text-blue-700' },
    final:      { card: 'border-l-red-500 bg-red-50',     badge: 'bg-red-100 text-red-700' },
    quiz:       { card: 'border-l-yellow-500 bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700' },
    assignment: { card: 'border-l-green-500 bg-green-50', badge: 'bg-green-100 text-green-700' },
};

interface ExamEntry {
    id: number;
    course_id: string;
    exam_type: ExamType;
    exam_date: string;
    start_time: string;
    end_time: string;
    room_no: string;
    semester: number;
    department: string;
    section: string;
    courses?: { name: string; code: string };
}

const emptyForm = {
    course_id: '', course_name: '', exam_type: 'mid' as ExamType,
    exam_date: '', start_time: '09:00', end_time: '12:00', room_no: '',
};

const ExamTimetableManager: React.FC = () => {
    const [department, setDepartment] = useState('CSE');
    const [semester, setSemester]     = useState(1);
    const [section, setSection]       = useState('A');
    const [examType, setExamType]     = useState<ExamType | ''>('');
    const [entries, setEntries]       = useState<ExamEntry[]>([]);
    const [loading, setLoading]       = useState(false);
    const [modalOpen, setModalOpen]   = useState(false);
    const [form, setForm]             = useState({ ...emptyForm });
    const [saving, setSaving]         = useState(false);
    const [error, setError]           = useState('');

    const fetchEntries = async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = { department, semester, section };
            if (examType) params.exam_type = examType;
            const res = await api.get('/exams/admin', { params });
            setEntries(res.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchEntries(); }, [department, semester, section, examType]);

    const openModal = () => {
        setForm({ ...emptyForm });
        setError('');
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.course_id || !form.exam_date || !form.start_time || !form.end_time || !form.room_no) {
            setError('All fields are required.'); return;
        }
        if (form.end_time <= form.start_time) {
            setError('End time must be after start time.'); return;
        }
        setSaving(true); setError('');
        try {
            await api.post('/exams/', {
                course_id: form.course_id,
                exam_type: form.exam_type,
                exam_date: form.exam_date,
                start_time: form.start_time,
                end_time: form.end_time,
                room_no: form.room_no,
                semester, department, section,
            });
            setModalOpen(false);
            fetchEntries();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to schedule exam.');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this exam entry?')) return;
        try { await api.delete(`/exams/${id}`); fetchEntries(); }
        catch { /* silent */ }
    };

    const fmt = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
    });

    const fmtTime = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${ampm}`;
    };

    // Group entries by date
    const grouped = entries.reduce<Record<string, ExamEntry[]>>((acc, e) => {
        (acc[e.exam_date] = acc[e.exam_date] || []).push(e);
        return acc;
    }, {});
    const sortedDates = Object.keys(grouped).sort();

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <BookOpen className="w-7 h-7 text-red-600" /> Exam Timetable Manager
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Schedule exams with custom time slots</p>
                </div>
                <button onClick={openModal}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" /> Schedule Exam
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-end border border-gray-200">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
                    <select value={department} onChange={e => setDepartment(e.target.value)} className="px-3 py-2 border rounded-md text-sm">
                        {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Semester</label>
                    <select value={semester} onChange={e => setSemester(Number(e.target.value))} className="px-3 py-2 border rounded-md text-sm">
                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Section</label>
                    <select value={section} onChange={e => setSection(e.target.value)} className="px-3 py-2 border rounded-md text-sm">
                        {['A','B','C','D'].map(s => <option key={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Exam Type</label>
                    <select value={examType} onChange={e => setExamType(e.target.value as ExamType | '')} className="px-3 py-2 border rounded-md text-sm">
                        <option value="">All Types</option>
                        {EXAM_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                </div>
            </div>

            {/* Entries */}
            {loading ? (
                <p className="text-center text-gray-400 py-12 text-sm">Loading...</p>
            ) : sortedDates.length === 0 ? (
                <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center">
                    <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No exams scheduled yet.</p>
                    <button onClick={openModal} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                        Schedule First Exam
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {sortedDates.map(date => (
                        <div key={date}>
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <h2 className="text-sm font-semibold text-gray-600">{fmt(date)}</h2>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {grouped[date]
                                    .sort((a,b) => a.start_time.localeCompare(b.start_time))
                                    .map(entry => {
                                        const colors = EXAM_TYPE_COLORS[entry.exam_type];
                                        const duration = (() => {
                                            const [sh, sm] = entry.start_time.split(':').map(Number);
                                            const [eh, em] = entry.end_time.split(':').map(Number);
                                            const mins = (eh * 60 + em) - (sh * 60 + sm);
                                            return mins >= 60 ? `${Math.floor(mins/60)}h ${mins%60 ? mins%60+'m' : ''}`.trim() : `${mins}m`;
                                        })();
                                        return (
                                            <div key={entry.id}
                                                className={`relative rounded-xl border-l-4 p-4 shadow-sm ${colors.card}`}>
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-gray-900 text-sm">{entry.course_id}</p>
                                                        {entry.courses?.name && (
                                                            <p className="text-xs text-gray-600 mt-0.5 truncate">{entry.courses.name}</p>
                                                        )}
                                                    </div>
                                                    <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
                                                        {entry.exam_type.charAt(0).toUpperCase() + entry.exam_type.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="mt-3 space-y-1 text-xs text-gray-600">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>{fmtTime(entry.start_time)} – {fmtTime(entry.end_time)}</span>
                                                        <span className="text-gray-400">({duration})</span>
                                                    </div>
                                                    <div>📍 Room {entry.room_no}</div>
                                                    <div className="text-gray-400">{entry.department} · Sem {entry.semester} · Sec {entry.section}</div>
                                                </div>
                                                <button onClick={() => handleDelete(entry.id)}
                                                    className="absolute top-2 right-2 p-1 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-800">Schedule Exam</h2>
                            <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 mb-4">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Course Code *</label>
                                    <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
                                        value={form.course_id}
                                        onChange={e => setForm(f => ({ ...f, course_id: e.target.value.toUpperCase() }))}
                                        placeholder="e.g. CS201" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Exam Type *</label>
                                    <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
                                        value={form.exam_type}
                                        onChange={e => setForm(f => ({ ...f, exam_type: e.target.value as ExamType }))}>
                                        {EXAM_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Exam Date *</label>
                                <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
                                    value={form.exam_date}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={e => setForm(f => ({ ...f, exam_date: e.target.value }))} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Start Time *</label>
                                    <input type="time" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
                                        value={form.start_time}
                                        onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">End Time *</label>
                                    <input type="time" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
                                        value={form.end_time}
                                        onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
                                </div>
                            </div>

                            {/* Duration preview */}
                            {form.start_time && form.end_time && form.end_time > form.start_time && (() => {
                                const [sh, sm] = form.start_time.split(':').map(Number);
                                const [eh, em] = form.end_time.split(':').map(Number);
                                const mins = (eh * 60 + em) - (sh * 60 + sm);
                                return (
                                    <p className="text-xs text-gray-500 -mt-2">
                                        Duration: <span className="font-medium text-gray-700">
                                            {Math.floor(mins/60) > 0 ? `${Math.floor(mins/60)}h ` : ''}{mins%60 > 0 ? `${mins%60}m` : ''}
                                        </span>
                                    </p>
                                );
                            })()}

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Room / Hall *</label>
                                <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
                                    value={form.room_no}
                                    onChange={e => setForm(f => ({ ...f, room_no: e.target.value }))}
                                    placeholder="e.g. Hall-A, Room 302" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 text-sm font-medium">
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Schedule Exam'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamTimetableManager;
