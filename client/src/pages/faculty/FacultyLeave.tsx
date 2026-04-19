import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Send, CheckCircle, Clock, AlertCircle, Loader2, History } from 'lucide-react';
import api from '../../services/api';

interface LeaveRequest {
    id: number;
    reason: string;
    start_date: string;
    end_date: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

export default function FacultyLeave() {
    const [reason, setReason] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            // Need to add this endpoint to faculty controller or use a generic one
            // For now, let's assume we might need to add it or it's empty
            const res = await api.get('/faculty/leave/my');
            setLeaves(res.data || []);
        } catch (error) {
            console.error('Failed to fetch leaves:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason || !startDate || !endDate) return;

        setSubmitting(true);
        setMessage(null);
        try {
            await api.post('/faculty/leave', {
                reason,
                startDate,
                endDate
            });
            setMessage({ type: 'success', text: 'Leave application submitted! Students have been notified.' });
            setReason('');
            setStartDate('');
            setEndDate('');
            fetchLeaves();
        } catch (error: any) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to submit leave application.' 
            });
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls = 'w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder-gray-500';
    const labelCls = 'block text-sm font-medium text-gray-400 mb-2';

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    <Calendar className="w-8 h-8 text-blue-400" />
                    Leave Application
                </h1>
                <p className="text-gray-400 mt-1">Apply for leave and automatically notify your students.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Application Form */}
                <div className="lg:col-span-2">
                    <div className="glass-effect p-8 rounded-2xl border border-gray-800 shadow-2xl">
                        <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-400" />
                            Apply for New Leave
                        </h2>

                        {message && (
                            <div className={`p-4 rounded-xl mb-6 text-sm border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelCls}>Start Date</label>
                                    <input 
                                        type="date" 
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>End Date</label>
                                    <input 
                                        type="date" 
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate || new Date().toISOString().split('T')[0]}
                                        className={inputCls}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelCls}>Reason for Leave</label>
                                <textarea 
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Briefly explain the reason for your leave..."
                                    rows={4}
                                    className={`${inputCls} resize-none`}
                                    required
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={18} />}
                                Submit Application & Notify Students
                            </button>
                        </form>
                    </div>
                </div>

                {/* History/Status */}
                <div className="lg:col-span-1">
                    <div className="glass-effect p-6 rounded-2xl border border-gray-800 shadow-2xl h-full">
                        <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                            <History className="w-5 h-5 text-blue-400" />
                            Leave History
                        </h2>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                </div>
                            ) : leaves.length === 0 ? (
                                <div className="text-center py-10">
                                    <Clock className="w-10 h-10 text-gray-700 mx-auto mb-3 opacity-20" />
                                    <p className="text-gray-500 text-sm italic">No leave applications found.</p>
                                </div>
                            ) : (
                                leaves.map((leave) => (
                                    <div key={leave.id} className="p-4 bg-gray-900/30 border border-gray-800 rounded-xl space-y-2 group hover:border-gray-700 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                                leave.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                                                leave.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                                                'bg-yellow-500/10 text-yellow-400'
                                            }`}>
                                                {leave.status}
                                            </span>
                                            <span className="text-[10px] text-gray-500 font-bold">{new Date(leave.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-white text-sm font-medium line-clamp-1 group-hover:line-clamp-none transition-all">{leave.reason}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                            <Calendar size={10} />
                                            {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
