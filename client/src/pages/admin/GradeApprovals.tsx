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
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Pending Grade Approvals</h1>
                    <p className="text-gray-600 mt-2">Review grades submitted by faculty before publishing them to students.</p>
                </div>
                {pendingGrades.length > 0 && (
                    <button 
                        onClick={handleApproveAll}
                        className="mt-4 md:mt-0 flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors font-medium shadow-sm"
                    >
                        <CheckCircle className="w-5 h-5" />
                        <span>Approve All ({pendingGrades.length})</span>
                    </button>
                )}
            </div>

            {message && (
                <div className={`p-4 rounded-lg bg-green-50 text-green-700 border border-green-200`}>
                    {message}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading pending grades...</div>
                    ) : pendingGrades.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center">
                            <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-800">All Caught Up!</h3>
                            <p className="text-gray-500">There are no pending grades awaiting approval.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Student</th>
                                    <th className="px-6 py-4 font-medium">Course</th>
                                    <th className="px-6 py-4 font-medium">Exam Type</th>
                                    <th className="px-6 py-4 font-medium">Score</th>
                                    <th className="px-6 py-4 font-medium">Submitted On</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pendingGrades.map((g) => (
                                    <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-800">{g.students?.name || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">{g.student_id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-800">{g.courses?.name || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">{g.course_id}</div>
                                        </td>
                                        <td className="px-6 py-4 capitalize">{g.exam_type}</td>
                                        <td className="px-6 py-4 font-bold text-gray-800">{g.score}</td>
                                        <td className="px-6 py-4 text-xs font-mono text-gray-500">
                                            {new Date(g.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button 
                                                    onClick={() => handleApprove(g.id)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                                                >
                                                    Approve
                                                </button>
                                                {/* Rejection could be added here later */}
                                            </div>
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
