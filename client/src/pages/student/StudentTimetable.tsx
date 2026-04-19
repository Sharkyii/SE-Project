import React, { useState, useEffect } from 'react';
import api from '../../services/api';
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
    courses?: { name: string; code: string };
    faculty?: { name: string };
}

const StudentTimetable = () => {
    const [department, setDepartment] = useState('CSE');
    const [semester, setSemester] = useState(1);
    const [section, setSection] = useState('A');
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(false);

    // We can allow students to view other batches? Plan said yes.

    const token = useStore((state) => state.token);

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            const res = await api.get('/student/timetable', {
                params: { department, semester, section }
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

    const getEntryForSlot = (day: string, time: string) => {
        return timetable.find(t => t.day === day && t.start_time.startsWith(time));
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                <Calendar className="w-8 h-8 text-blue-600" />
                Student Timetable
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
                                                <div className="bg-purple-50 p-2 rounded-md h-full text-sm border-l-4 border-purple-500">
                                                    <div className="font-bold text-purple-900">{entry.courses?.code}</div>
                                                    <div className="text-purple-800">{entry.courses?.name}</div>
                                                    <div className="text-xs text-purple-600 mt-1">{entry.room_no}</div>
                                                    <div className="text-xs text-gray-500">{entry.faculty?.name}</div>
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

export default StudentTimetable;
