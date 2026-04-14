import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Calendar, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';

interface AdminAttendanceRecord {
    id: string;
    date: string;
    status: 'present' | 'absent';
    student_id: string;
    course_id: string;
    students: {
        name: string;
        department: string;
        semester: number;
    };
    courses: {
        name: string;
        code: string;
    };
}

export default function AdminAttendance() {
    const [records, setRecords] = useState<AdminAttendanceRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<AdminAttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterCourse, setFilterCourse] = useState('');

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/attendance');
            setRecords(res.data);
            setFilteredRecords(res.data);
        } catch (error) {
            console.error('Failed to fetch admin attendance', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = records;

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(r => 
                r.students?.name.toLowerCase().includes(lower) || 
                r.student_id.toLowerCase().includes(lower)
            );
        }

        if (filterDate) {
            result = result.filter(r => r.date === filterDate);
        }

        if (filterCourse) {
            const lowerC = filterCourse.toLowerCase();
            result = result.filter(r => r.course_id.toLowerCase().includes(lowerC));
        }

        setFilteredRecords(result);
    }, [searchTerm, filterDate, filterCourse, records]);

    const uniqueCourses = Array.from(new Set(records.map(r => r.course_id)));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Institute Attendance</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Monitor and query student attendance records across all courses.</p>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Search Student</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-shadow outline-none dark:text-white"
                        />
                    </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Filter Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-shadow outline-none dark:text-white"
                        />
                    </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Filter Course</label>
                    <div className="relative">
                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={filterCourse}
                            onChange={(e) => setFilterCourse(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 transition-shadow outline-none dark:text-white appearance-none"
                        >
                            <option value="">All Courses</option>
                            {uniqueCourses.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Course</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {filteredRecords.length > 0 ? (
                                    filteredRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                {new Date(record.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{record.students?.name}</div>
                                                <div className="text-xs text-gray-500">{record.student_id} • Sem {record.students?.semester}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 dark:text-white">{record.courses?.name}</div>
                                                <div className="text-xs text-gray-500">{record.course_id}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={clsx(
                                                    "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full gap-1 items-center",
                                                    record.status === 'present' 
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400" 
                                                        : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400"
                                                )}>
                                                    {record.status === 'present' ? <CheckCircle className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            No attendance records match your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
