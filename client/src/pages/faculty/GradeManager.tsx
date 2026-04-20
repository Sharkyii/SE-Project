import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, GraduationCap, TrendingUp, History, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function GradeManager() {
    const [courses, setCourses] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [examType, setExamType] = useState('mid');
    const [score, setScore] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [loading, setLoading] = useState(false);
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
        setLoading(true);
        setMessage(null);
        try {
            await api.post('/faculty/grades', {
                courseId: selectedCourse,
                studentEmail,
                examType,
                score: Number(score)
            });
            setMessage({ type: 'success', text: 'Grade uploaded successfully! (Pending Admin Approval)' });
            
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
            setMessage({ type: 'error', text: `Failed: ${errorMsg}` });
            console.error(error);
        } finally {
            setLoading(false);
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

    const inputCls = 'w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder-gray-500';
    const labelCls = 'block text-sm font-medium text-gray-400 mb-1';

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <header>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-8 h-8 text-blue-400" />
                    Grade Management
                </h1>
                <p className="text-gray-400 mt-1">Assign grades and view class performance analytics.</p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Form */}
                <div className="glass-effect p-8 rounded-2xl border border-gray-800 shadow-2xl">
                    <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-blue-400" />
                        Upload Grade
                    </h2>
                    
                    {message && (
                        <div className={`p-4 rounded-xl mb-6 text-sm border flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleUpload} className="space-y-5">
                        <div>
                            <label className={labelCls}>Course ID / Code</label>
                            <select 
                                value={selectedCourse} 
                                onChange={(e) => setSelectedCourse(e.target.value)} 
                                className={inputCls}
                                required 
                            >
                                <option value="" className="bg-gray-900">Select a course</option>
                                {courses.map(c => (
                                    <option key={c.code} value={c.code} className="bg-gray-900">{c.code} - {c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Student</label>
                            <select 
                                value={studentEmail} 
                                onChange={(e) => setStudentEmail(e.target.value)} 
                                className={inputCls}
                                required 
                                disabled={students.length === 0}
                            >
                                {students.length === 0 ? (
                                    <option value="" className="bg-gray-900">No students found</option>
                                ) : (
                                    <option value="" className="bg-gray-900">Select a student</option>
                                )}
                                {students.map(s => (
                                    <option key={s.email_id} value={s.email_id} className="bg-gray-900">{s.name} ({s.student_id})</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Exam Type</label>
                                <select 
                                    value={examType} 
                                    onChange={(e) => setExamType(e.target.value)}
                                    className={inputCls}
                                >
                                    <option value="mid" className="bg-gray-900">Mid-Term</option>
                                    <option value="final" className="bg-gray-900">Final Exam</option>
                                    <option value="quiz" className="bg-gray-900">Quiz</option>
                                    <option value="assignment" className="bg-gray-900">Assignment</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Score</label>
                                <input 
                                    type="number" 
                                    value={score} 
                                    onChange={(e) => setScore(e.target.value)} 
                                    className={inputCls}
                                    placeholder="0-100"
                                    required 
                                />
                            </div>
                        </div>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LayoutDashboard size={20} />}
                            Submit Grade
                        </button>
                    </form>
                </div>

                {/* Reports Chart */}
                <div className="glass-effect p-8 rounded-2xl border border-gray-800 shadow-2xl">
                    <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        Class Performance
                    </h2>
                    {chartData.length > 0 ? (
                        <div className="h-72 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                    <Tooltip 
                                        cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} 
                                        contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #374151', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }} 
                                        itemStyle={{ color: '#F3F4F6' }}
                                        labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
                                    />
                                    <Bar dataKey="score" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-72 flex flex-col items-center justify-center text-gray-500 border border-dashed border-gray-800 rounded-xl">
                            <TrendingUp className="w-12 h-12 mb-2 opacity-20" />
                            <p>No grade data available for this course.</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Recent Grades Table */}
            <div className="glass-effect rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                 <div className="px-8 py-5 border-b border-gray-800 flex items-center gap-2">
                     <History className="w-5 h-5 text-blue-400" />
                     <h3 className="font-bold text-white text-lg">Recent Grade Submissions</h3>
                 </div>
                 <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                         <thead className="bg-gray-900/50 text-gray-400 text-xs font-bold uppercase tracking-wider">
                             <tr>
                                 <th className="px-8 py-4">Student ID</th>
                                 <th className="px-8 py-4">Course ID</th>
                                 <th className="px-8 py-4">Type</th>
                                 <th className="px-8 py-4">Score</th>
                                 <th className="px-8 py-4">Status</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-800">
                             {reports.slice().reverse().map((r, i) => (
                                 <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                                     <td className="px-8 py-4 font-mono text-blue-400 font-bold">{r.student_id}</td>
                                     <td className="px-8 py-4 text-gray-300">{r.course_id}</td>
                                     <td className="px-8 py-4 text-gray-400 capitalize">{r.exam_type}</td>
                                     <td className="px-8 py-4 text-white font-bold">{r.score}</td>
                                     <td className="px-8 py-4">
                                         <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md border ${r.status === 'published' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                             {r.status}
                                         </span>
                                     </td>
                                 </tr>
                             ))}
                             {reports.length === 0 && (
                                 <tr>
                                     <td colSpan={5} className="px-8 py-12 text-center text-gray-500 italic">No recent grades found.</td>
                                 </tr>
                             )}
                         </tbody>
                     </table>
                 </div>
            </div>
        </div>
    );
}

