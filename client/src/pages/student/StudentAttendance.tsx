import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Calendar, CheckCircle, XCircle, Activity, BookOpen } from 'lucide-react';
import clsx from 'clsx';

interface AttendanceRecord {
    id: string;
    course_id: string;
    date: string;
    status: 'present' | 'absent';
    courses: {
        code: string;
        name: string;
    };
}

export default function StudentAttendance() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const res = await api.get('/student/attendance');
            setRecords(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch attendance');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
                <p className="font-medium">Loading attendance...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-2">
                <XCircle size={18} />
                {error}
            </div>
        );
    }

    const totalClasses = records.length;
    const presentClasses = records.filter(r => r.status === 'present').length;
    const absentClasses = totalClasses - presentClasses;
    const percentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

    const chartData = [
        { name: 'Present', value: presentClasses, color: '#10B981' },
        { name: 'Absent', value: absentClasses, color: '#EF4444' }
    ];

    // Group records by Course Code
    const groupedByCourse = records.reduce((acc: any, record) => {
        const code = record.courses?.code || record.course_id || 'Unknown';
        const name = record.courses?.name || 'Unknown Course';
        if (!acc[code]) acc[code] = { name, records: [] };
        acc[code].records.push(record);
        return acc;
    }, {});

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    <Activity className="w-8 h-8 text-emerald-400" />
                    My Attendance
                </h1>
                <p className="text-gray-400 mt-1">Track your attendance across all registered courses.</p>
            </header>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-effect p-8 rounded-2xl shadow-2xl flex flex-col justify-center items-center relative overflow-hidden group">
                    <div className="absolute top-4 right-4 text-gray-700 group-hover:text-emerald-500/20 transition-colors">
                        <Activity className="w-8 h-8" />
                    </div>
                    <div className="h-40 w-40 relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #374151', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }} 
                                    itemStyle={{ color: '#F3F4F6' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-4xl font-black text-white">{percentage}%</span>
                        </div>
                    </div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mt-4">Overall Ratio</h3>
                </div>

                <div className="bg-emerald-600/10 border border-emerald-500/20 p-8 rounded-2xl shadow-2xl text-white flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute -right-8 -bottom-8 opacity-5 text-white group-hover:opacity-10 transition-opacity">
                        <CheckCircle className="w-48 h-48" />
                    </div>
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Total Present</h3>
                    <div className="text-6xl font-black mt-4 text-white">{presentClasses}</div>
                    <p className="mt-4 text-emerald-500/60 text-xs font-medium uppercase">classes attended</p>
                </div>

                <div className="bg-rose-600/10 border border-rose-500/20 p-8 rounded-2xl shadow-2xl text-white flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute -right-8 -bottom-8 opacity-5 text-white group-hover:opacity-10 transition-opacity">
                        <XCircle className="w-48 h-48" />
                    </div>
                    <h3 className="text-sm font-bold text-rose-400 uppercase tracking-widest">Total Absent</h3>
                    <div className="text-6xl font-black mt-4 text-white">{absentClasses}</div>
                    <p className="mt-4 text-rose-500/60 text-xs font-medium uppercase">classes missed</p>
                </div>
            </div>

            {/* Detailed Records grouped by Course */}
            {Object.keys(groupedByCourse).length === 0 ? (
                <div className="glass-effect rounded-2xl border border-dashed border-gray-700 p-20 text-center shadow-xl">
                    <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-6 opacity-20" />
                    <h3 className="text-xl font-bold text-white mb-2">No attendance records found</h3>
                    <p className="text-gray-400">Your attendance hasn't been logged in the system yet.</p>
                </div>
            ) : (
                <div className="space-y-10">
                    {Object.entries(groupedByCourse).map(([code, courseData]: [string, any]) => {
                        const cTotal = courseData.records.length;
                        const cPresent = courseData.records.filter((r: any) => r.status === 'present').length;
                        const cPercent = Math.round((cPresent / cTotal) * 100);

                        return (
                            <div key={code} className="glass-effect rounded-2xl border border-gray-800 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="p-6 border-b border-gray-800 bg-gray-950/40 flex justify-between items-center">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/20">
                                            <BookOpen size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-white tracking-tight">{courseData.name}</h3>
                                            <p className="text-xs font-bold text-blue-400 font-mono tracking-widest mt-0.5 uppercase">{code} · {cTotal} Sessions</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={clsx("text-3xl font-black tracking-tighter", cPercent < 75 ? "text-rose-500" : "text-emerald-500")}>
                                            {cPercent}%
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Attendance</span>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-900/50 text-gray-500 text-[10px] font-bold uppercase tracking-[0.15em]">
                                                <th className="px-8 py-4 text-left">Session Date</th>
                                                <th className="px-8 py-4 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800/50">
                                            {courseData.records.map((record: AttendanceRecord) => (
                                                <tr key={record.id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="px-8 py-5 text-gray-300 font-medium">
                                                        {new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <span className={clsx(
                                                            "px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border",
                                                            record.status === 'present' 
                                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                        )}>
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

