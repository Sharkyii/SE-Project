import React, { useState } from 'react';
import { useStore } from '../../app/store';
import { BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const CourseCreation = () => {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [credits, setCredits] = useState(0);
    const [description, setDescription] = useState('');
    const [isElective, setIsElective] = useState(false);
    const [maxSeats, setMaxSeats] = useState(30);
    const [electiveSemester, setElectiveSemester] = useState(1);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        try {
            await api.post('/admin/courses', { name, code, credits, description, is_elective: isElective, max_seats: isElective ? maxSeats : null, elective_semester: isElective ? electiveSemester : null });
            setMessage({ type: 'success', text: 'Course created successfully!' });
            setName(''); setCode(''); setCredits(0); setDescription(''); setIsElective(false); setMaxSeats(30); setElectiveSemester(1);
        } catch (error: any) {
            setMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to create course. Code might be duplicate.' });
        }
    };

    const inputCls = 'w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder-gray-400';

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
                <BookOpen className="w-8 h-8 text-blue-400" />
                Create New Course
            </h1>

            <div className="glass-effect rounded-xl p-8 border border-gray-800">
                {message && (
                    <div className={`p-4 mb-6 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Course Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} required placeholder="e.g. Data Structures" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Course Code</label>
                            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className={inputCls} required placeholder="e.g. CS201" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Credits</label>
                            <input type="number" value={credits} onChange={(e) => setCredits(Number(e.target.value))} className={inputCls} required min="1" />
                        </div>

                        {/* Elective toggle */}
                        <div className="flex flex-col justify-center">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Course Type</label>
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={() => setIsElective(false)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${!isElective ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:border-gray-600'}`}>
                                    Regular
                                </button>
                                <button type="button" onClick={() => setIsElective(true)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${isElective ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:border-gray-600'}`}>
                                    Elective
                                </button>
                            </div>
                        </div>
                    </div>

                    {isElective && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Max Seats</label>
                                <input type="number" value={maxSeats} onChange={(e) => setMaxSeats(Number(e.target.value))} className={inputCls} min="1" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">For Semester</label>
                                <select value={electiveSemester} onChange={(e) => setElectiveSemester(Number(e.target.value))} className={inputCls}>
                                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                            className={`${inputCls} h-32`} placeholder="Brief description of the course..." />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200 flex items-center gap-2">
                            <BookOpen size={20} />
                            Create Course
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseCreation;
