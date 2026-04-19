import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useStore } from '../../app/store';
import { Calendar, Save, Plus } from 'lucide-react';

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
    const token = useStore((state) => state.token);

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
                params: { type: 'institute', department, semester, section }
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

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                <Calendar className="w-8 h-8 text-blue-600" />
                Master Timetable Manager
            </h1>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4 items-end border border-gray-200">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                    >
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="ME">ME</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <select
                        value={semester}
                        onChange={e => setSemester(Number(e.target.value))}
                        className="px-3 py-2 border rounded-md"
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                    <select
                        value={section}
                        onChange={e => setSection(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                    >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                    </select>
                </div>
                <button onClick={fetchTimetable} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Refresh</button>
            </div>

            {/* Timetable Grid */}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="p-3 border bg-gray-50 text-left w-20">Time</th>
                            {DAYS.map(day => (
                                <th key={day} className="p-3 border bg-gray-50 text-center w-1/5">{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {TIME_SLOTS.map(time => (
                            <tr key={time}>
                                <td className="p-3 border font-medium text-gray-600 bg-gray-50">{time}</td>
                                {DAYS.map(day => {
                                    const entry = getEntryForSlot(day, time);
                                    return (
                                        <td
                                            key={`${day}-${time}`}
                                            className="p-1 border h-24 align-top hover:bg-gray-50 transition-colors cursor-pointer relative group"
                                            onClick={() => handleCellClick(day, time)}
                                        >
                                            {entry ? (
                                                <div className="bg-blue-100 p-2 rounded-md h-full text-sm border-l-4 border-blue-500">
                                                    <div className="font-bold text-blue-900">{entry.courses?.code}</div>
                                                    <div className="text-blue-800">{entry.courses?.name}</div>
                                                    <div className="text-xs text-blue-600 mt-1">{entry.room_no}</div>
                                                    <div className="text-xs text-gray-500">{entry.faculty_id}</div>
                                                </div>
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <Plus className="text-gray-400" />
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Assign Class ({selectedSlot?.day} @ {selectedSlot?.time})</h2>

                        {message && (
                            <div className={`p-3 mb-4 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Course Code</label>
                                <input
                                    className="w-full border rounded px-3 py-2"
                                    value={formData.course_id}
                                    onChange={e => setFormData({ ...formData, course_id: e.target.value })}
                                    placeholder="e.g. CS101"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Faculty Email</label>
                                <input
                                    className="w-full border rounded px-3 py-2"
                                    value={formData.faculty_id}
                                    onChange={e => setFormData({ ...formData, faculty_id: e.target.value })}
                                    placeholder="faculty@college.edu"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Room No</label>
                                <input
                                    className="w-full border rounded px-3 py-2"
                                    value={formData.room_no}
                                    onChange={e => setFormData({ ...formData, room_no: e.target.value })}
                                    placeholder="e.g. 301"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Save size={18} />
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
