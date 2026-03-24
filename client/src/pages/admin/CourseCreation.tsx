import React, { useState } from 'react';
import axios from 'axios';
import { useStore } from '../../app/store';
import { BookOpen, CheckCircle, AlertCircle } from 'lucide-react';

const CourseCreation = () => {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [credits, setCredits] = useState(0);
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const token = useStore((state) => state.token);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        try {
            await axios.post('http://localhost:5000/api/admin/courses',
                { name, code, credits, description },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage({ type: 'success', text: 'Course created successfully!' });
            setName('');
            setCode('');
            setCredits(0);
            setDescription('');
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to create course. Code might be duplicate.' });
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                <BookOpen className="w-8 h-8 text-blue-600" />
                Create New Course
            </h1>

            <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
                {message && (
                    <div className={`p-4 mb-6 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                required
                                placeholder="e.g. Data Structures"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Course Code</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                required
                                placeholder="e.g. CS201"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Credits</label>
                            <input
                                type="number"
                                value={credits}
                                onChange={(e) => setCredits(Number(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                required
                                min="1"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all h-32"
                            placeholder="Brief description of the course..."
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200 flex items-center gap-2"
                        >
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
