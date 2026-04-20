import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { BookOpen, GraduationCap, Award, TrendingUp } from 'lucide-react';

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
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                         <Award className="w-8 h-8 text-blue-400" />
                         My Grades
                    </h1>
                    <p className="text-gray-400 mt-1">View your academic performance and published grades.</p>
                </div>
                <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30">
                    <GraduationCap className="w-8 h-8 text-blue-400" />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
                    <p className="font-medium">Loading grades...</p>
                </div>
            ) : grades.length === 0 ? (
                <div className="glass-effect rounded-2xl border border-dashed border-gray-700 p-20 text-center shadow-xl">
                    <GraduationCap className="w-16 h-16 text-gray-600 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-white mb-2">No grades published yet</h3>
                    <p className="text-gray-400 max-w-md mx-auto">Grades will appear here once faculty uploads and admin approves them.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Transcript Table */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-effect rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                            <div className="px-8 py-5 border-b border-gray-800 flex items-center bg-gray-900/50 text-white">
                                <BookOpen className="w-5 h-5 mr-3 text-blue-400" />
                                <h3 className="font-bold text-lg">Official Transcript</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-950/50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-8 py-4">Course</th>
                                            <th className="px-8 py-4">Title</th>
                                            <th className="px-8 py-4">Assessment</th>
                                            <th className="px-8 py-4 text-right">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {grades.map((g, i) => (
                                            <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                                                <td className="px-8 py-5 font-bold text-blue-400 font-mono">{g.course_id}</td>
                                                <td className="px-8 py-5 text-gray-300 font-medium">{g.courses?.name || 'Unknown'}</td>
                                                <td className="px-8 py-5 capitalize">
                                                    <span className="px-3 py-1 rounded-md bg-gray-800 text-gray-400 text-[10px] font-bold uppercase tracking-wider border border-gray-700">
                                                        {g.exam_type}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 font-bold text-white text-right text-xl">{g.score}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Chart Dashboard */}
                    <div className="glass-effect p-8 rounded-2xl border border-gray-800 flex flex-col shadow-2xl">
                        <div className="flex items-center gap-2 mb-8 text-white">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            <h3 className="font-bold text-lg">Performance Visualization</h3>
                        </div>
                        <div className="flex-1 min-h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                    <Tooltip 
                                        cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} 
                                        contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #374151', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }} 
                                        itemStyle={{ color: '#F3F4F6' }}
                                        labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
                                    />
                                    <Bar dataKey="score" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-center text-xs font-medium text-gray-500 mt-6 uppercase tracking-widest">Score spread across subjects</p>
                    </div>
                </div>
            )}
        </div>
    );
}
