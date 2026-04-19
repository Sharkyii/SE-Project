import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminCourseEnrollment() {
    const [students, setStudents] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [semester, setSemester] = useState('1');
    const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [studentRes, courseRes] = await Promise.all([
                api.get('/admin/students'),
                api.get('/admin/courses')
            ]);
            setStudents(studentRes.data || []);
            setCourses(courseRes.data || []);
        } catch (error) {
            console.error("Failed to fetch initial data", error);
        }
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/enrollments', {
                studentId: selectedStudent,
                courseId: selectedCourse,
                semester: Number(semester),
                academicYear: Number(academicYear)
            });
            setMessage('Course assigned successfully!');
            setSelectedCourse('');
            
            // Clear message after 3 seconds
            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to assign course.';
            setMessage(`Failed: ${errorMsg}`);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-white">Assign Course to Student</h1>
            <p className="text-gray-400">Manually enroll students into their designated courses.</p>

            <div className="glass-effect p-6 rounded-xl border border-gray-800 shadow-xl">
                {message && (
                    <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${message.includes('success') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {message}
                    </div>
                )}
                
                <form onSubmit={handleAssign} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Select Student</label>
                            <select 
                                value={selectedStudent} 
                                onChange={(e) => setSelectedStudent(e.target.value)} 
                                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-gray-900 text-white outline-none transition-all"
                                required 
                            >
                                <option value="" className="bg-gray-900">-- Select a Student --</option>
                                {students.map(s => (
                                    <option key={s.student_id} value={s.student_id} className="bg-gray-900">{s.name} ({s.student_id})</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Select Course</label>
                            <select 
                                value={selectedCourse} 
                                onChange={(e) => setSelectedCourse(e.target.value)} 
                                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-gray-900 text-white outline-none transition-all"
                                required 
                            >
                                <option value="" className="bg-gray-900">-- Select a Course --</option>
                                {courses.map(c => (
                                    <option key={c.code} value={c.code} className="bg-gray-900">{c.code} - {c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Semester</label>
                            <input 
                                type="number" 
                                min="1"
                                max="10"
                                value={semester} 
                                onChange={(e) => setSemester(e.target.value)} 
                                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-gray-900 text-white outline-none transition-all"
                                required 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Academic Year</label>
                            <input 
                                type="number" 
                                min="2000"
                                value={academicYear} 
                                onChange={(e) => setAcademicYear(e.target.value)} 
                                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-gray-900 text-white outline-none transition-all"
                                required 
                            />
                        </div>
                    </div>
                    
                    <button 
                        type="submit"
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-lg"
                    >
                        Assign Course
                    </button>
                </form>
            </div>
        </div>
    );
}

//export default AdminCourseEnrollment;

