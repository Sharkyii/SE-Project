import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Save, Trash2, X, Calendar, Clock } from 'lucide-react';
import api from '../../services/api';

const EXAM_TYPES = ['mid', 'final', 'quiz', 'assignment'] as const;
type ExamType = typeof EXAM_TYPES[number];

const DEPARTMENTS = ['CSE','ECE','EEE','ME','CE','IT','MBA','MCA'];

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

    const inputCls = 'w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-all text-white placeholder-gray-500 outline-none';
    const labelCls = 'block text-xs font-medium text-gray-400 mb-1';

    // Group entries by date
    const grouped = entries.reduce<Record<string, ExamEntry[]>>((acc, e) => {
        (acc[e.exam_date] = acc[e.exam_date] || []).push(e);
        return acc;
    }, {});
    const sortedDates = Object.keys(grouped).sort();

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-8 h-8 text-red-500" /> Exam Timetable Manager
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Schedule exams with custom time slots</p>
                </div>
                <button onClick={openModal}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-red-600/20 active:scale-95">
                    <Plus className="w-5 h-5" /> Schedule Exam
                </button>
            </div>

            {/* Filters */}
            <div className="glass-effect p-6 rounded-xl border border-gray-800 shadow-xl mb-8 flex flex-wrap gap-6 items-end">
                <div className="flex-1 min-w-[150px]">
                    <label className={labelCls}>Department</label>
                    <select value={department} onChange={e => setDepartment(e.target.value)} className={inputCls}>
                        {DEPARTMENTS.map(d => <option key={d} className="bg-gray-900">{d}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className={labelCls}>Semester</label>
                    <select value={semester} onChange={e => setSemester(Number(e.target.value))} className={inputCls}>
                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s} className="bg-gray-900">Sem {s}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className={labelCls}>Section</label>
                    <select value={section} onChange={e => setSection(e.target.value)} className={inputCls}>
                        {['A','B','C','D'].map(s => <option key={s} className="bg-gray-900">{s}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className={labelCls}>Exam Type</label>
                    <select value={examType} onChange={e => setExamType(e.target.value as ExamType | '')} className={inputCls}>
                        <option value="" className="bg-gray-900">All Types</option>
                        {EXAM_TYPES.map(t => <option key={t} value={t} className="bg-gray-900">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                </div>
            </div>

            {/* Entries */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                </div>
            ) : sortedDates.length === 0 ? (
                <div className="glass-effect rounded-2xl border border-dashed border-gray-700 p-16 text-center shadow-xl">
                    <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No exams scheduled</h3>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto mb-8">Start by scheduling your first exam for this department and semester.</p>
                    <button onClick={openModal} className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">
                        Schedule First Exam
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {sortedDates.map(date => (
                        <div key={date} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-2 bg-gray-800 rounded-lg">
                                    <Calendar className="w-5 h-5 text-red-400" />
                                </div>
                                <h2 className="text-lg font-bold text-white tracking-tight">{fmt(date)}</h2>
                                <div className="flex-1 h-px bg-gray-800" />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {grouped[date]
                                    .sort((a,b) => a.start_time.localeCompare(b.start_time))
                                    .map(entry => {
                                        const duration = (() => {
                                            const [sh, sm] = entry.start_time.split(':').map(Number);
                                            const [eh, em] = entry.end_time.split(':').map(Number);
                                            const mins = (eh * 60 + em) - (sh * 60 + sm);
                                            return mins >= 60 ? `${Math.floor(mins/60)}h ${mins%60 ? mins%60+'m' : ''}`.trim() : `${mins}m`;
                                        })();
                                        
                                        const typeColors: Record<ExamType, string> = {
                                            mid: 'border-l-blue-500 bg-blue-500/10 text-blue-400',
                                            final: 'border-l-red-500 bg-red-500/10 text-red-400',
                                            quiz: 'border-l-yellow-500 bg-yellow-500/10 text-yellow-400',
                                            assignment: 'border-l-green-500 bg-green-500/10 text-green-400',
                                        };

                                        return (
                                            <div key={entry.id}
                                                className={`group relative rounded-xl border-l-4 p-5 shadow-xl transition-all hover:scale-[1.02] bg-gray-900/40 border-gray-800 ${typeColors[entry.exam_type].split(' ')[0]}`}>
                                                <div className="flex items-start justify-between gap-2 mb-4">
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-white text-base group-hover:text-red-400 transition-colors">{entry.course_id}</p>
                                                        {entry.courses?.name && (
                                                            <p className="text-xs text-gray-500 mt-1 truncate font-medium">{entry.courses.name}</p>
                                                        )}
                                                    </div>
                                                    <span className={`shrink-0 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md bg-gray-800 ${typeColors[entry.exam_type].split(' ').slice(2).join(' ')}`}>
                                                        {entry.exam_type}
                                                    </span>
                                                </div>
                                                <div className="space-y-3 text-xs">
                                                    <div className="flex items-center gap-2 text-gray-300">
                                                        <div className="p-1 bg-gray-800 rounded">
                                                            <Clock className="w-3 h-3 text-gray-400" />
                                                        </div>
                                                        <span className="font-medium">{fmtTime(entry.start_time)} – {fmtTime(entry.end_time)}</span>
                                                        <span className="text-gray-600 font-bold">·</span>
                                                        <span className="text-gray-500">{duration}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-300">
                                                        <div className="p-1 bg-gray-800 rounded">
                                                            <div className="w-3 h-3 border-2 border-gray-400 rounded-sm" />
                                                        </div>
                                                        <span className="font-medium">Room {entry.room_no}</span>
                                                    </div>
                                                    <div className="pt-2 flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                                                        {entry.department} <span className="text-gray-800">|</span> SEM {entry.semester} <span className="text-gray-800">|</span> SEC {entry.section}
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDelete(entry.id)}
                                                    className="absolute top-4 right-4 p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all">
                                                    <Trash2 className="w-4 h-4" />
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="glass-effect bg-gray-900 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-800 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-white">Schedule Exam</h2>
                            <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Course Code *</label>
                                    <input className={inputCls}
                                        value={form.course_id}
                                        onChange={e => setForm(f => ({ ...f, course_id: e.target.value.toUpperCase() }))}
                                        placeholder="e.g. CS201" />
                                </div>
                                <div>
                                    <label className={labelCls}>Exam Type *</label>
                                    <select className={inputCls}
                                        value={form.exam_type}
                                        onChange={e => setForm(f => ({ ...f, exam_type: e.target.value as ExamType }))}>
                                        {EXAM_TYPES.map(t => <option key={t} value={t} className="bg-gray-900">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className={labelCls}>Exam Date *</label>
                                <input type="date" className={inputCls}
                                    value={form.exam_date}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={e => setForm(f => ({ ...f, exam_date: e.target.value }))} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Start Time *</label>
                                    <input type="time" className={inputCls}
                                        value={form.start_time}
                                        onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
                                </div>
                                <div>
                                    <label className={labelCls}>End Time *</label>
                                    <input type="time" className={inputCls}
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
                                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
                                        <Clock className="w-3 h-3 text-gray-500" />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                            Duration: <span className="text-gray-300">
                                                {Math.floor(mins/60) > 0 ? `${Math.floor(mins/60)}h ` : ''}{mins%60 > 0 ? `${mins%60}m` : ''}
                                            </span>
                                        </span>
                                    </div>
                                );
                            })()}

                            <div>
                                <label className={labelCls}>Room / Hall *</label>
                                <input className={inputCls}
                                    value={form.room_no}
                                    onChange={e => setForm(f => ({ ...f, room_no: e.target.value }))}
                                    placeholder="e.g. Hall-A, Room 302" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setModalOpen(false)}
                                className="px-6 py-2 text-gray-400 hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg shadow-red-600/20 transition-all active:scale-95">
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
