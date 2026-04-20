import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, Loader2, TrendingUp, History } from 'lucide-react';
import api from '../../services/api';

const EXAM_TYPES = ['mid', 'final', 'quiz', 'assignment'] as const;
type ExamType = typeof EXAM_TYPES[number];

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
            setEntries(res.data || []);
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

    const inputCls = 'px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-all text-white placeholder-gray-500 outline-none';
    const labelCls = 'block text-xs font-medium text-gray-400 mb-1';

    const renderGroup = (grouped: Record<string, ExamEntry[]>, isPast: boolean = false) =>
        Object.keys(grouped).sort((a, b) => isPast ? b.localeCompare(a) : a.localeCompare(b)).map(date => (
            <div key={date} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-800 rounded-lg">
                        <Calendar className={`w-4 h-4 ${isPast ? 'text-gray-500' : 'text-red-400'}`} />
                    </div>
                    <h3 className={`text-sm font-bold ${isPast ? 'text-gray-500' : 'text-white'}`}>{fmt(date)}</h3>
                    <div className="flex-1 h-px bg-gray-800" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                    {grouped[date]
                        .sort((a,b) => a.start_time.localeCompare(b.start_time))
                        .map(entry => {
                            const typeColors: Record<ExamType, string> = {
                                mid: 'border-l-blue-500 bg-blue-500/10 text-blue-400',
                                final: 'border-l-red-500 bg-red-500/10 text-red-400',
                                quiz: 'border-l-yellow-500 bg-yellow-500/10 text-yellow-400',
                                assignment: 'border-l-green-500 bg-green-500/10 text-green-400',
                            };
                            
                            const [sh, sm] = entry.start_time.split(':').map(Number);
                            const [eh, em] = entry.end_time.split(':').map(Number);
                            const mins = (eh * 60 + em) - (sh * 60 + sm);
                            const duration = mins >= 60
                                ? `${Math.floor(mins/60)}h${mins%60 ? ` ${mins%60}m` : ''}`
                                : `${mins}m`;

                            return (
                                <div key={entry.id} 
                                    className={`rounded-xl border-l-4 p-5 shadow-xl transition-all hover:scale-[1.02] bg-gray-900/40 border-gray-800 ${isPast ? 'opacity-60 grayscale' : ''} ${typeColors[entry.exam_type].split(' ')[0]}`}>
                                    <div className="flex items-start justify-between gap-2 mb-4">
                                        <div className="min-w-0">
                                            <p className="font-bold text-white text-base">{entry.course_id}</p>
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
                                            <span className="font-bold text-gray-200">{fmtTime(entry.start_time)} – {fmtTime(entry.end_time)}</span>
                                            <span className="text-gray-600 font-bold">·</span>
                                            <span className="text-gray-500">{duration}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <div className="p-1 bg-gray-800 rounded">
                                                <div className="w-3 h-3 border-2 border-gray-400 rounded-sm" />
                                            </div>
                                            <span className="font-medium text-gray-300">Room {entry.room_no}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        ));

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-8 h-8 text-red-500" /> Exam Timetable
                </h1>
                <p className="text-gray-400 mt-1 text-sm">View your upcoming and past examination schedules.</p>
            </header>

            {/* Filters */}
            <div className="glass-effect p-6 rounded-xl border border-gray-800 shadow-xl flex flex-wrap gap-6 items-end">
                <div className="flex-1 min-w-[150px]">
                    <label className={labelCls}>Department</label>
                    <select value={department} onChange={e => setDepartment(e.target.value)} className={inputCls}>
                        {['CSE','ECE','EEE','ME','CE','IT','MBA','MCA'].map(d => <option key={d} className="bg-gray-900">{d}</option>)}
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
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                </div>
            ) : entries.length === 0 ? (
                <div className="glass-effect rounded-2xl border border-dashed border-gray-700 p-16 text-center shadow-xl">
                    <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No exams scheduled</h3>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto">There are no exams found for the selected department, semester, and section.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {upcoming.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <TrendingUp size={20} className="text-green-400" />
                                <h2 className="text-xl font-bold text-white">Upcoming Exams</h2>
                            </div>
                            {renderGroup(groupByDate(upcoming))}
                        </div>
                    )}
                    {past.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <History size={20} className="text-gray-500" />
                                <h2 className="text-xl font-bold text-gray-500">Past Exams</h2>
                            </div>
                            {renderGroup(groupByDate(past), true)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentExamTimetable;
