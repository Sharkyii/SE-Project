import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const TIME_SLOTS = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

interface TimetableEntry {
    id?: number;
    course_id: string;
    faculty_id: string;
    day: string;
    start_time: string;
    end_time: string;
    room_no: string;
    courses?: { name: string; code: string };
    faculty?: { name: string };
}

const StudentTimetable = () => {
    const [department, setDepartment] = useState('CSE');
    const [semester, setSemester] = useState(1);
    const [section, setSection] = useState('A');
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            const res = await api.get('/student/timetable', {
                params: { department, semester, section }
            });
            setTimetable(res.data || []);
        } catch (error) {
            console.error('Failed to fetch timetable', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimetable();
    }, [department, semester, section]);

    const getEntryForSlot = (day: string, time: string) => {
        return timetable.find(t => t.day === day && t.start_time.startsWith(time));
    };

    const inputCls = 'px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all text-white placeholder-gray-500 outline-none';
    const labelCls = 'block text-xs font-medium text-gray-400 mb-1';

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    <Calendar className="w-8 h-8 text-blue-400" />
                    Student Timetable
                </h1>
                <p className="text-gray-400 mt-1">Check your weekly class schedule and room assignments.</p>
            </header>

            {/* Filters */}
            <div className="glass-effect p-6 rounded-xl border border-gray-800 shadow-xl flex flex-wrap gap-6 items-end">
                <div className="flex-1 min-w-[150px]">
                    <label className={labelCls}>Department</label>
                    <select
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        className={`${inputCls} w-full`}
                    >
                        {['CSE', 'ECE', 'ME'].map(d => <option key={d} value={d} className="bg-gray-900">{d}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className={labelCls}>Semester</label>
                    <select
                        value={semester}
                        onChange={e => setSemester(Number(e.target.value))}
                        className={`${inputCls} w-full`}
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className={labelCls}>Section</label>
                    <select
                        value={section}
                        onChange={e => setSection(e.target.value)}
                        className={`${inputCls} w-full`}
                    >
                        {['A', 'B', 'C'].map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
                    </select>
                </div>
                <button 
                    onClick={fetchTimetable}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-bold shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2"
                >
                    <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
                    Refresh
                </button>
            </div>

            {/* Timetable Grid */}
            <div className="glass-effect rounded-2xl border border-gray-800 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-900/80">
                                <th className="p-4 border-b border-r border-gray-800 text-left w-24 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Time</th>
                                {DAYS.map(day => (
                                    <th key={day} className="p-4 border-b border-gray-800 text-center w-1/5 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {TIME_SLOTS.map(time => (
                                <tr key={time} className="group">
                                    <td className="p-4 border-r border-gray-800 font-bold text-gray-400 bg-gray-950/20 text-xs tracking-tighter">{time}</td>
                                    {DAYS.map(day => {
                                        const entry = getEntryForSlot(day, time);
                                        return (
                                            <td key={`${day}-${time}`} className="p-1 border-r border-gray-800/50 h-28 align-top hover:bg-white/5 transition-colors relative group/cell">
                                                {entry ? (
                                                    <div className="bg-blue-600/10 p-3 rounded-xl h-full text-sm border border-blue-500/20 group-hover/cell:bg-blue-600/20 transition-all shadow-lg">
                                                        <div className="font-black text-blue-400 leading-tight">{entry.courses?.code}</div>
                                                        <div className="text-white font-medium mt-1 line-clamp-2 leading-snug">{entry.courses?.name}</div>
                                                        <div className="flex flex-col mt-3 gap-1">
                                                            <div className="text-[10px] font-bold text-blue-300/60 uppercase flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                                                                {entry.room_no}
                                                            </div>
                                                            <div className="text-[10px] font-medium text-gray-500 italic truncate">{entry.faculty?.name}</div>
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentTimetable;
