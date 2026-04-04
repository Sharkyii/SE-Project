import React, { useState } from 'react';
import api from '../../services/api';

export default function QuizUpload() {
    const [courseId, setCourseId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userStr = localStorage.getItem('academic-erp-storage');
            let facultyId = '';
            if (userStr) {
                const parsed = JSON.parse(userStr);
                facultyId = parsed.state?.user?.email || '';
            }

            await api.post('/faculty/quizzes', {
                courseId,
                title,
                description,
                dueDate,
                facultyId
            });
            setMessage({ type: 'success', text: `Quiz "${title}" created successfully! Notifications sent to enrolled students.` });
            setCourseId('');
            setTitle('');
            setDescription('');
            setDueDate('');
        } catch (error) {
            console.error("Failed to post quiz", error);
            setMessage({ type: 'error', text: 'Failed to create quiz. Please try again.' });
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Quiz Management</h1>
                <p className="text-gray-600 mt-2">Assign quizzes to courses. Students enrolled in the course will be notified automatically.</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                {message && (
                    <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {message.text}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Course ID / Code</label>
                            <input 
                                type="text"
                                required
                                value={courseId}
                                onChange={e => setCourseId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                                placeholder="E.g. CS101"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                            <input 
                                type="date"
                                required
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow text-gray-700"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title</label>
                        <input 
                            type="text"
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                            placeholder="E.g. Mid-term Assessment"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea 
                            rows={4}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow resize-none"
                            placeholder="Provide any specific instructions or syllabus covered..."
                        />
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit"
                            className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                        >
                            Publish Quiz & Notify Students
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
