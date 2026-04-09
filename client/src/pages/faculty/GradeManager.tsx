import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

export default function GradeManager() {
    const [courses, setCourses] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [examType, setExamType] = useState('mid');
    const [score, setScore] = useState('');
    const [message, setMessage] = useState('');
    const [reports, setReports] = useState<any[]>([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchStudents(selectedCourse);
        } else {
            setStudents([]);
            setStudentEmail('');
        }
    }, [selectedCourse]);

    const fetchInitialData = async () => {
        try {
            const userStr = localStorage.getItem('academic-erp-storage');
            let email = '';
            if (userStr) {
                const parsed = JSON.parse(userStr);
                email = parsed.state?.user?.email || '';
            }
            
            // Fetch Reports
            if (email) {
                const res = await api.get(`/faculty/grades/reports?facultyId=${email}`);
                setReports(res.data || []);
            }

            // Fetch My Courses
            const courseRes = await api.get('/faculty/courses');
            const data = courseRes.data || [];
            setCourses(data);
            if (data.length > 0) {
                setSelectedCourse(data[0].code);
            }
        } catch (error) {
            console.error("Failed to fetch initial data", error);
        }
    };

    const fetchStudents = async (courseId: string) => {
        try {
            const res = await api.get(`/faculty/courses/${courseId}/students`);
            const data = res.data || [];
            setStudents(data);
            if (data.length > 0) {
                setStudentEmail(data[0].email_id);
            } else {
                setStudentEmail('');
            }
        } catch (error) {
            console.error("Failed to fetch students", error);
            setStudents([]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/faculty/grades', {
                courseId: selectedCourse,
                studentEmail,
                examType,
                score: Number(score)
            });
            setMessage('Grade uploaded successfully! (Pending Admin Approval)');
            
            // Reset score but keep selected dropdowns
            setScore('');
            
            // Refresh reports
            const userStr = localStorage.getItem('academic-erp-storage');
            let email = '';
            if (userStr) {
                const parsed = JSON.parse(userStr);
                email = parsed.state?.user?.email || '';
            }
            if (email) {
                const res = await api.get(`/faculty/grades/reports?facultyId=${email}`);
                setReports(res.data || []);
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to upload grade.';
            setMessage(`Failed: ${errorMsg}`);
            console.error(error);
        }
    };

    // Prepare data for the chart based on the selected course
    const chartData = reports
        .filter(r => r.course_id === selectedCourse)
        .map(r => ({
            name: r.student_id,
            score: r.score,
            status: r.status
        }))
        .slice(-10); // show last 10 entries for clarity

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800">Grade Management</h1>
            <p className="text-gray-600">Assign grades and view class performance analytics.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upload Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload Grade</h2>
                    {message && (
                        <div className={`p-3 rounded mb-4 text-sm ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message}
                        </div>
                    )}
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Course ID / Code</label>
                            <select 
                                value={selectedCourse} 
                                onChange={(e) => setSelectedCourse(e.target.value)} 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow bg-white"
                                required 
                            >
                                <option value="" disabled>Select a course</option>
                                {courses.map(c => (
                                    <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                            <select 
                                value={studentEmail} 
                                onChange={(e) => setStudentEmail(e.target.value)} 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow bg-white"
                                required 
                                disabled={students.length === 0}
                            >
                                {students.length === 0 ? (
                                    <option value="">No students found</option>
                                ) : (
                                    <option value="" disabled>Select a student</option>
                                )}
                                {students.map(s => (
                                    <option key={s.email_id} value={s.email_id}>{s.name} ({s.student_id})</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                                <select 
                                    value={examType} 
                                    onChange={(e) => setExamType(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    <option value="mid">Mid-Term</option>
                                    <option value="final">Final Exam</option>
                                    <option value="quiz">Quiz</option>
                                    <option value="assignment">Assignment</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                                <input 
                                    type="number" 
                                    value={score} 
                                    onChange={(e) => setScore(e.target.value)} 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                                    required 
                                />
                            </div>
                        </div>
                        <button 
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors mt-2"
                        >
                            Submit Grade
                        </button>
                    </form>
                </div>

                {/* Reports Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Class Performance (Sample)</h2>
                    {chartData.length > 0 ? (
                        <div className="h-64 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                    <Tooltip 
                                        cursor={{fill: '#F3F4F6'}} 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                                    />
                                    <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            No grade data available for this course.
                        </div>
                    )}
                </div>
            </div>
            
            {/* Recent Grades Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="px-6 py-4 border-b border-gray-100">
                     <h3 className="font-semibold text-gray-800">Recent Grade Submissions</h3>
                 </div>
                 <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm text-gray-600">
                         <thead className="bg-gray-50 text-gray-700">
                             <tr>
                                 <th className="px-6 py-3 font-medium">Student ID</th>
                                 <th className="px-6 py-3 font-medium">Course ID</th>
                                 <th className="px-6 py-3 font-medium">Type</th>
                                 <th className="px-6 py-3 font-medium">Score</th>
                                 <th className="px-6 py-3 font-medium">Status</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                             {reports.slice().reverse().map((r, i) => (
                                 <tr key={i} className="hover:bg-gray-50 transition-colors">
                                     <td className="px-6 py-3">{r.student_id}</td>
                                     <td className="px-6 py-3">{r.course_id}</td>
                                     <td className="px-6 py-3 capitalize">{r.exam_type}</td>
                                     <td className="px-6 py-3">{r.score}</td>
                                     <td className="px-6 py-3">
                                         <span className={`px-2 py-1 text-xs rounded-full font-medium ${r.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                             {r.status}
                                         </span>
                                     </td>
                                 </tr>
                             ))}
                             {reports.length === 0 && (
                                 <tr>
                                     <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No recent grades found.</td>
                                 </tr>
                             )}
                         </tbody>
                     </table>
                 </div>
            </div>
        </div>
    );
}
