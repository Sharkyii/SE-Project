import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../../app/store';
import { Calendar } from 'lucide-react';

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
    department: string;
    semester: number;
    section: string;
    courses?: { name: string; code: string };
}

const FacultyTimetable = () => {
    const [viewMode, setViewMode] = useState<'personal' | 'institute'>('personal');
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters for Institute View
    const [department, setDepartment] = useState('CSE');
    const [semester, setSemester] = useState(1);

    const { token, user } = useStore();

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            const params: any = { type: viewMode };
            if (viewMode === 'personal') {
                params.userId = user?.email; // Assuming email is used as ID or we need actual ID
            } else {
                params.department = department;
                params.semester = semester;
            }

            const res = await axios.get('http://localhost:5000/api/admin/timetable', {
                params,
                headers: { Authorization: `Bearer ${token}` }
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
    }, [viewMode, department, semester]);

    const getEntryForSlot = (day: string, time: string) => {
        return timetable.find(t => t.day === day && t.start_time.startsWith(time));
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                <Calendar className="w-8 h-8 text-blue-600" />
                Faculty Timetable
            </h1>

            {/* View Toggle & Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-center border border-gray-200 justify-between">
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('personal')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'personal' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        My Schedule
                    </button>
                    <button
                        onClick={() => setViewMode('institute')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'institute' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        Institute View
                    </button>
                </div>

                {viewMode === 'institute' && (
                    <div className="flex gap-4 items-center">
                        <select
                            value={department}
                            onChange={e => setDepartment(e.target.value)}
                            className="px-3 py-2 border rounded-md text-sm"
                        >
                            <option value="CSE">CSE</option>
                            <option value="ECE">ECE</option>
                            <option value="ME">ME</option>
                        </select>
                        <select
                            value={semester}
                            onChange={e => setSemester(Number(e.target.value))}
                            className="px-3 py-2 border rounded-md text-sm"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                        </select>
                    </div>
                )}
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
                                        <td key={`${day}-${time}`} className="p-1 border h-24 align-top hover:bg-gray-50 transition-colors">
                                            {entry ? (
                                                <div className="bg-green-50 p-2 rounded-md h-full text-sm border-l-4 border-green-500">
                                                    <div className="font-bold text-green-900">{entry.courses?.code}</div>
                                                    <div className="text-green-800">{entry.courses?.name}</div>
                                                    <div className="text-xs text-green-600 mt-1">
                                                        {entry.room_no} • {entry.department}-{entry.semester}{entry.section}
                                                    </div>
                                                </div>
                                            ) : null}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FacultyTimetable;
