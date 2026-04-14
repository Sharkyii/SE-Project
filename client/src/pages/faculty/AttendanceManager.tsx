import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Users, Save, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Course {
    code: string;
    name: string;
}

interface Student {
    student_id: string;
    name: string;
    email_id: string;
}

interface AttendanceRecord {
    student_id: string;
    name: string;
    status: 'present' | 'absent' | 'unmarked';
}

export default function AttendanceManager() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse && date) {
            loadAttendanceData();
        } else {
            setStudents([]);
            setAttendance([]);
        }
    }, [selectedCourse, date]);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/faculty/courses');
            setCourses(res.data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    };

    const loadAttendanceData = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            // 1. Fetch Enrolled Students
            const studentsRes = await api.get(`/faculty/courses/${selectedCourse}/students`);
            const enrolledStudents: Student[] = studentsRes.data;

            // 2. Fetch Existing Attendance
            const attendanceRes = await api.get(`/faculty/attendance?courseId=${selectedCourse}&date=${date}`);
            const existingRecords = attendanceRes.data;

            // Map existing records or default to 'unmarked'
            const mergedRecords: AttendanceRecord[] = enrolledStudents.map(student => {
                const existing = existingRecords.find((r: any) => r.student_id === student.student_id);
                return {
                    student_id: student.student_id,
                    name: student.name,
                    status: existing ? existing.status : 'unmarked'
                };
            });

            setStudents(enrolledStudents);
            setAttendance(mergedRecords);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to load attendance data' });
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const setGlobalStatus = (status: 'present' | 'absent' | 'unmarked') => {
        setAttendance(prev => prev.map(rec => ({ ...rec, status })));
    };

    const updateStatus = (studentId: string, status: 'present' | 'absent' | 'unmarked') => {
        setAttendance(prev => prev.map(rec => {
            if (rec.student_id === studentId) {
                return { ...rec, status };
            }
            return rec;
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        
        try {
            await api.post('/faculty/attendance', {
                courseId: selectedCourse,
                date,
                // Only send records that are actively marked (ignore 'unmarked')
                records: attendance
                    .filter(a => a.status !== 'unmarked')
                    .map(a => ({ student_id: a.student_id, status: a.status }))
            });
            setMessage({ type: 'success', text: 'Attendance saved successfully!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save attendance' });
        } finally {
            setSaving(false);
        }
    };

    const presentCount = attendance.filter(a => a.status === 'present').length;
    const absentCount = attendance.filter(a => a.status === 'absent').length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Attendance Manager</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Quickly mark and overview student attendance for your courses.</p>
            </div>

            {/* Selection Controls */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Course</label>
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                        <option value="">-- Choose a Course --</option>
                        {courses.map(course => (
                            <option key={course.code} value={course.code}>
                                {course.code} - {course.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl flex items-center space-x-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            {/* Attendance List */}
            {selectedCourse && date && !loading && students.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="bg-blue-50 dark:bg-blue-900/50 p-3 rounded-xl flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                                <Users className="w-5 h-5" />
                                <span className="font-semibold">{students.length} Enrolled</span>
                            </div>
                            <div className="flex space-x-3 text-sm">
                                <span className="flex items-center space-x-1 text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">
                                    <CheckCircle className="w-4 h-4" /> <span>{presentCount} Present</span>
                                </span>
                                <span className="flex items-center space-x-1 text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full">
                                    <XCircle className="w-4 h-4" /> <span>{absentCount} Absent</span>
                                </span>
                            </div>
                        </div>
                        <div className="flex space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            <button
                                onClick={() => setGlobalStatus('present')}
                                className="bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-800/40 text-green-700 dark:text-green-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                            >
                                All Present
                            </button>
                            <button
                                onClick={() => setGlobalStatus('absent')}
                                className="bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/40 text-red-700 dark:text-red-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                            >
                                All Absent
                            </button>
                            <button
                                onClick={() => setGlobalStatus('unmarked')}
                                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                            >
                                No Class / Clear
                            </button>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center justify-center space-x-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed w-full md:w-auto"
                        >
                            <Save className="w-5 h-5" />
                            <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900/50 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">
                                    <th className="px-6 py-4">Student ID</th>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4 text-right">Status Option</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {attendance.map((record) => (
                                    <tr key={record.student_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                            {record.student_id}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                            {record.name}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                                <button
                                                    onClick={() => updateStatus(record.student_id, 'present')}
                                                    className={`px-4 py-1.5 text-xs font-bold transition-colors ${record.status === 'present' ? 'bg-green-500 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                                >
                                                    PRESENT
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(record.student_id, 'absent')}
                                                    className={`px-4 py-1.5 text-xs font-bold transition-colors border-l border-gray-200 dark:border-gray-700 ${record.status === 'absent' ? 'bg-red-500 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                                >
                                                    ABSENT
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(record.student_id, 'unmarked')}
                                                    className={`px-4 py-1.5 text-xs font-bold transition-colors border-l border-gray-200 dark:border-gray-700 ${record.status === 'unmarked' ? 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                                >
                                                    NO CLASS
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loading && selectedCourse && students.length === 0 && (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No students enrolled</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">There are currently no students enrolled in this course.</p>
                </div>
            )}
            
            {loading && (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            )}
        </div>
    );
}
