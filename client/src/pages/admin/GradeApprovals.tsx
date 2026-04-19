import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CheckCircle, XCircle } from 'lucide-react';

export default function GradeApprovals() {
    const [pendingGrades, setPendingGrades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchPendingGrades();
    }, []);

    const fetchPendingGrades = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/grades/pending');
            setPendingGrades(res.data || []);
        } catch (error) {
            console.error("Failed to fetch pending grades", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            setMessage('');
            await api.post('/admin/grades/approve', { gradeIds: [id] });
            setMessage('Grade published successfully');
            setPendingGrades(pendingGrades.filter(g => g.id !== id));
        } catch (error) {
            console.error("Failed to approve", error);
            setMessage('Failed to approve grade');
        }
    };

    const handleApproveAll = async () => {
        try {
            setMessage('');
            const ids = pendingGrades.map(g => g.id);
            if (ids.length === 0) return;
            await api.post('/admin/grades/approve', { gradeIds: ids });
            setMessage('All grades published successfully');
            setPendingGrades([]);
        } catch (error) {
            console.error("Failed to bulk approve format", error);
            setMessage('Failed to approve grades');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Pending Grade Approvals</h1>
                    <p className="text-gray-400 mt-2">Review grades submitted by faculty before publishing them to students.</p>
                </div>
                {pendingGrades.length > 0 && (
                    <button 
                        onClick={handleApproveAll}
                        className="mt-4 md:mt-0 flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition-all font-bold shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        <CheckCircle className="w-5 h-5" />
                        <span>Approve All ({pendingGrades.length})</span>
                    </button>
                )}
            </div>

            {message && (
                <div className={`p-4 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-300 ${message.includes('success') ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {message}
                </div>
            )}

            <div className="glass-effect rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-20 text-center text-gray-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            Loading pending grades...
                        </div>
                    ) : pendingGrades.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center">
                            <div className="p-4 bg-green-500/10 rounded-full mb-6">
                                <CheckCircle className="w-12 h-12 text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">All Caught Up!</h3>
                            <p className="text-gray-400 mt-2">There are no pending grades awaiting approval.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-900/50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Course</th>
                                    <th className="px-6 py-4">Exam Type</th>
                                    <th className="px-6 py-4">Score</th>
                                    <th className="px-6 py-4">Submitted On</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {pendingGrades.map((g) => (
                                    <tr key={g.id} className="hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white">{g.students?.name || 'Unknown'}</div>
                                            <div className="text-xs text-blue-400 font-mono mt-0.5">{g.student_id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-300">{g.courses?.name || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{g.course_id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-md bg-gray-800 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                                                {g.exam_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-lg font-bold text-white">{g.score}</span>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase">
                                            {new Date(g.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleApprove(g.id)}
                                                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg shadow-lg shadow-green-600/20 transition-all active:scale-95"
                                            >
                                                Approve
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

