import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock } from 'lucide-react';
import api from '../../services/api';

const EXAM_TYPES = ['mid', 'final', 'quiz', 'assignment'] as const;
type ExamType = typeof EXAM_TYPES[number];

const EXAM_TYPE_COLORS: Record<ExamType, { card: string; badge: string }> = {
    mid:        { card: 'border-l-blue-500 bg-blue-50',    badge: 'bg-blue-100 text-blue-700' },
    final:      { card: 'border-l-red-500 bg-red-50',      badge: 'bg-red-100 text-red-700' },
    quiz:       { card: 'border-l-yellow-500 bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700' },
    assignment: { card: 'border-l-green-500 bg-green-50',  badge: 'bg-green-100 text-green-700' },
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

const StudentExamTimetable: React.FC = () => {
    const [department, setDepartment] = useState('CSE');
    const [semester, setSemester]     = useState(1);
    const [section, setSection]       = useState('A');
    const [entries, setEntries]       = useState<ExamEntry[]>([]);
    const [loading, setLoading]       = useState(false);

    const fetchEntries = async () => {
        setLoading(true);
        try {
            const res = await api.get('/exams/student', {
                params: { department, semester, section },
            });
            setEntries(res.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchEntries(); }, [department, semester, section]);

    const fmt = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
    });

    const fmtTime = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${ampm}`;
    };

    const today = new Date().toISOString().split('T')[0];
    const upcoming = entries.filter(e => e.exam_date >= today);
    const past     = entries.filter(e => e.exam_date < today);

    // Group by date
    const groupByDate = (list: ExamEntry[]) =>
        list.reduce<Record<string, ExamEntry[]>>((acc, e) => {
            (acc[e.exam_date] = acc[e.exam_date] || []).push(e);
            return acc;
        }, {});

    const renderGroup = (grouped: Record<string, ExamEntry[]>) =>
        Object.keys(grouped).sort().map(date => (
            <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-600">{fmt(date)}</h3>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                    {grouped[date]
                        .sort((a,b) => a.start_time.localeCompare(b.start_time))
                        .map(entry => {
                            const colors = EXAM_TYPE_COLORS[entry.exam_type];
                            const [sh, sm] = entry.start_time.split(':').map(Number);
                            const [eh, em] = entry.end_time.split(':').map(Number);
                            const mins = (eh * 60 + em) - (sh * 60 + sm);
                            const duration = mins >= 60
                                ? `${Math.floor(mins/60)}h${mins%60 ? ` ${mins%60}m` : ''}`
                                : `${mins}m`;
                            return (
                                <div key={entry.id} className={`rounded-xl border-l-4 p-4 shadow-sm ${colors.card}`}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 text-sm">{entry.course_id}</p>
                                            {entry.courses?.name && (
                                                <p className="text-xs text-gray-600 mt-0.5">{entry.courses.name}</p>
                                            )}
                                        </div>
                                        <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
                                            {entry.exam_type.charAt(0).toUpperCase() + entry.exam_type.slice(1)}
                                        </span>
                                    </div>
                                    <div className="mt-3 space-y-1 text-xs text-gray-600">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span className="font-medium">{fmtTime(entry.start_time)} – {fmtTime(entry.end_time)}</span>
                                            <span className="text-gray-400">({duration})</span>
                                        </div>
                                        <div>📍 Room {entry.room_no}</div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        ));

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <BookOpen className="w-7 h-7 text-red-600" /> Exam Timetable
            </h1>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-end border border-gray-200">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
                    <select value={department} onChange={e => setDepartment(e.target.value)} className="px-3 py-2 border rounded-md text-sm">
                        {['CSE','ECE','EEE','ME','CE','IT','MBA','MCA'].map(d => <option key={d}>{d}</option>)}
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
            </div>

            {loading ? (
                <p className="text-center text-gray-400 py-12 text-sm">Loading...</p>
            ) : entries.length === 0 ? (
                <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center">
                    <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No exams scheduled for this selection.</p>
                </div>
            ) : (
                <>
                    {upcoming.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-base font-semibold text-gray-700 mb-4">Upcoming Exams</h2>
                            {renderGroup(groupByDate(upcoming))}
                        </div>
                    )}
                    {past.length > 0 && (
                        <div>
                            <h2 className="text-base font-semibold text-gray-400 mb-4">Past Exams</h2>
                            <div className="opacity-60">
                                {renderGroup(groupByDate(past))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StudentExamTimetable;
