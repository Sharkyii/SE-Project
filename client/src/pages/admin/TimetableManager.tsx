import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Save, Plus, RefreshCw, X } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const TIME_SLOTS = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

interface TimetableEntry {
    id?: number;
    course_id: string;
    faculty_id: string;
    day: string;
    start_time: string;
    end_time: string;
    room_no: string;
    courses?: { name: string; code: string };
    faculty?: { name: string };
}

const TimetableManager = () => {
    const [department, setDepartment] = useState('CSE');
    const [semester, setSemester] = useState(1);
    const [section, setSection] = useState('A');
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Modal state for adding entry
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ day: string, time: string } | null>(null);
    const [formData, setFormData] = useState({
        course_id: '',
        faculty_id: '', // email_id
        room_no: ''
    });

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/timetable', {
                params: { type: 'institute', department, semester, section },
            });
            setTimetable(res.data);
        } catch (error) {
            console.error('Failed to fetch timetable', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimetable();
    }, [department, semester, section]);

    const handleCellClick = (day: string, time: string) => {
        setSelectedSlot({ day, time });
        setIsModalOpen(true);
        setFormData({ course_id: '', faculty_id: '', room_no: '' });
        setMessage(null);
    };

    const handleSave = async () => {
        if (!selectedSlot) return;

        // Calculate end time (assuming 1 hour slots for now)
        const [hour, minute] = selectedSlot.time.split(':').map(Number);
        const endHour = hour + 1;
        const endTime = `${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        try {
            await api.post('/admin/timetable', {
                ...formData,
                day: selectedSlot.day,
                start_time: selectedSlot.time,
                end_time: endTime,
                semester,
                department,
                section
            });

            setMessage({ type: 'success', text: 'Class assigned successfully!' });
            setIsModalOpen(false);
            fetchTimetable();
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to assign class. Check for conflicts.'
            });
        }
    };

    const getEntryForSlot = (day: string, time: string) => {
        return timetable.find(t => t.day === day && t.start_time.startsWith(time)); // Simple check, ideally check ranges
    };

    const inputCls = 'w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all text-white placeholder-gray-500 outline-none';
    const labelCls = 'block text-sm font-medium text-gray-400 mb-1';

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
                <Calendar className="w-8 h-8 text-blue-400" />
                Master Timetable Manager
            </h1>

            {/* Filters */}
            <div className="glass-effect p-6 rounded-xl border border-gray-800 shadow-xl mb-6 flex flex-wrap gap-6 items-end">
                <div className="flex-1 min-w-[150px]">
                    <label className={labelCls}>Department</label>
                    <select
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        className={inputCls}
                    >
                        <option value="CSE" className="bg-gray-900">CSE</option>
                        <option value="ECE" className="bg-gray-900">ECE</option>
                        <option value="ME" className="bg-gray-900">ME</option>
                    </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className={labelCls}>Semester</label>
                    <select
                        value={semester}
                        onChange={e => setSemester(Number(e.target.value))}
                        className={inputCls}
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className={labelCls}>Section</label>
                    <select
                        value={section}
                        onChange={e => setSection(e.target.value)}
                        className={inputCls}
                    >
                        <option value="A" className="bg-gray-900">A</option>
                        <option value="B" className="bg-gray-900">B</option>
                        <option value="C" className="bg-gray-900">C</option>
                    </select>
                </div>
                <button 
                    onClick={fetchTimetable} 
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Timetable Grid */}
            <div className="glass-effect rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-900/50">
                                <th className="p-4 border-b border-r border-gray-800 text-left w-24 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                                {DAYS.map(day => (
                                    <th key={day} className="p-4 border-b border-gray-800 text-center w-1/5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {TIME_SLOTS.map(time => (
                                <tr key={time} className="group">
                                    <td className="p-4 border-r border-gray-800 font-medium text-gray-400 bg-gray-900/20 text-sm">{time}</td>
                                    {DAYS.map(day => {
                                        const entry = getEntryForSlot(day, time);
                                        return (
                                            <td
                                                key={`${day}-${time}`}
                                                className="p-1 border-r border-gray-800 h-28 align-top hover:bg-gray-800/30 transition-colors cursor-pointer relative group"
                                                onClick={() => handleCellClick(day, time)}
                                            >
                                                {entry ? (
                                                    <div className="bg-blue-600/10 p-2 rounded-lg h-full text-sm border border-blue-500/20 group-hover:bg-blue-600/20 transition-all">
                                                        <div className="font-bold text-blue-400">{entry.courses?.code}</div>
                                                        <div className="text-gray-300 line-clamp-2">{entry.courses?.name}</div>
                                                        <div className="text-xs text-blue-300 mt-2 font-medium flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                                            {entry.room_no}
                                                        </div>
                                                        <div className="text-[10px] text-gray-500 mt-1 truncate">{entry.faculty_id}</div>
                                                    </div>
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Plus className="text-gray-600 w-5 h-5" />
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="glass-effect bg-gray-900 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-800 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-white">Assign Class</h2>
                                <p className="text-sm text-gray-400">{selectedSlot?.day} at {selectedSlot?.time}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {message && (
                            <div className={`p-3 mb-6 rounded-lg text-sm border ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className={labelCls}>Course Code</label>
                                <input
                                    className={inputCls}
                                    value={formData.course_id}
                                    onChange={e => setFormData({ ...formData, course_id: e.target.value })}
                                    placeholder="e.g. CS101"
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Faculty Email</label>
                                <input
                                    className={inputCls}
                                    value={formData.faculty_id}
                                    onChange={e => setFormData({ ...formData, faculty_id: e.target.value })}
                                    placeholder="faculty@college.edu"
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Room No</label>
                                <input
                                    className={inputCls}
                                    value={formData.room_no}
                                    onChange={e => setFormData({ ...formData, room_no: e.target.value })}
                                    placeholder="e.g. 301"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2 text-gray-400 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-blue-600/20"
                            >
                                <Save className="w-4 h-4" />
                                Save Class
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimetableManager;
