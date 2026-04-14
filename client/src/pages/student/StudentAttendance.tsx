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
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-200">{error}</div>;
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
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Attendance</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Track your attendance across all registered courses.</p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center items-center relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-gray-300 dark:text-gray-600">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div className="h-32 w-32 relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={60}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{percentage}%</span>
                        </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mt-2">Overall Attendance</h3>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl shadow-sm text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-20">
                        <CheckCircle className="w-32 h-32" />
                    </div>
                    <h3 className="text-lg font-medium opacity-90">Total Present</h3>
                    <div className="text-5xl font-bold mt-4">{presentClasses}</div>
                    <p className="mt-2 text-green-100 text-sm">classes attended</p>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-rose-600 p-6 rounded-2xl shadow-sm text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-20">
                        <XCircle className="w-32 h-32" />
                    </div>
                    <h3 className="text-lg font-medium opacity-90">Total Absent</h3>
                    <div className="text-5xl font-bold mt-4">{absentClasses}</div>
                    <p className="mt-2 text-red-100 text-sm">classes missed</p>
                </div>
            </div>

            {/* Detailed Records grouped by Course */}
            {Object.keys(groupedByCourse).length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No attendance records found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Your attendance has not been recorded yet.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedByCourse).map(([code, courseData]: [string, any]) => {
                        const cTotal = courseData.records.length;
                        const cPresent = courseData.records.filter((r: any) => r.status === 'present').length;
                        const cPercent = Math.round((cPresent / cTotal) * 100);

                        return (
                            <div key={code} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{courseData.name} ({code})</h3>
                                            <p className="text-sm text-gray-500">{cTotal} classes recorded</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={clsx("text-lg font-bold", cPercent < 75 ? "text-red-500" : "text-green-500")}>
                                            {cPercent}%
                                        </span>
                                        <span className="text-xs text-gray-400">attendance</span>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-white dark:bg-gray-800 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                <th className="px-6 py-3">Date</th>
                                                <th className="px-6 py-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {courseData.records.map((record: AttendanceRecord) => (
                                                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={clsx(
                                                            "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full",
                                                            record.status === 'present' ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400"
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
