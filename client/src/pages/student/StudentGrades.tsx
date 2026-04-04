import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { BookOpen, GraduationCap, Award } from 'lucide-react';

export default function StudentGrades() {
    const [grades, setGrades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const res = await api.get('/student/grades');
                setGrades(res.data || []);
            } catch (error) {
                console.error("Failed to fetch student grades", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGrades();
    }, []);

    const chartData = grades.map(g => ({
        name: g.course_id,
        score: g.score,
        type: g.exam_type
    }));

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">My Grades</h1>
                    <p className="text-gray-600 mt-2">View your academic performance and published grades.</p>
                </div>
                <div className="bg-blue-50 text-blue-700 p-3 rounded-full">
                    <Award className="w-8 h-8" />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12 text-gray-500 font-medium">Loading grades...</div>
            ) : grades.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
                    <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>No grades have been published yet.</p>
                    <p className="text-sm mt-1">Grades will appear here once faculty uploads and admin approves them.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Transcript Table */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center bg-gray-50 text-gray-700">
                                <BookOpen className="w-5 h-5 mr-2" />
                                <h3 className="font-semibold text-lg">Official Transcript</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-white text-gray-500 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">Course</th>
                                            <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">Title</th>
                                            <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">Assessment</th>
                                            <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs text-right">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {grades.map((g, i) => (
                                            <tr key={i} className="hover:bg-blue-50 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-gray-700">{g.course_id}</td>
                                                <td className="px-6 py-4 text-gray-800">{g.courses?.name || 'Unknown'}</td>
                                                <td className="px-6 py-4 capitalize">
                                                    <span className="px-2.5 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                                                        {g.exam_type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-900 text-right text-base">{g.score}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Chart Dashboard */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col pt-8">
                        <div className="flex items-center mb-6 text-gray-800 px-2">
                            <h3 className="font-semibold text-lg">Performance Visualization</h3>
                        </div>
                        <div className="flex-1 min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                    <Tooltip 
                                        cursor={{fill: '#F3F4F6'}} 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                                    />
                                    <Bar dataKey="score" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-center text-sm text-gray-500 mt-4">Score spread across subjects.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
