import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, UserCheck, UserX, Search, Filter, CheckCircle, AlertCircle, Loader2, X, ChevronDown } from 'lucide-react';
import api from '../../services/api';

interface FacultyInfo {
    name: string;
    email_id: string;
    department: string;
    designation: string;
}

interface Course {
    id: number;
    name: string;
    code: string;
    credits: number;
    description: string | null;
    email_id: string | null;
    is_elective: boolean;
    faculty: FacultyInfo | null;
}

type FilterStatus = 'all' | 'assigned' | 'unassigned';

const CourseAllocation: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [facultyList, setFacultyList] = useState<FacultyInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

    // Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [selectedFacultyEmail, setSelectedFacultyEmail] = useState('');
    const [facultySearch, setFacultySearch] = useState('');

    const fetchCourses = async () => {
        try {
            const { data } = await api.get<Course[]>('/admin/courses');
            setCourses(data);
        } catch {
            setMsg({ type: 'error', text: 'Failed to fetch courses.' });
        } finally {
            setLoading(false);
        }
    };

    const fetchFaculty = async () => {
        try {
            const { data } = await api.get<FacultyInfo[]>('/admin/faculty');
            setFacultyList(data);
        } catch {
            // silent
        }
    };

    useEffect(() => {
        fetchCourses();
        fetchFaculty();
    }, []);

    // Filtered courses
    const filteredCourses = useMemo(() => {
        return courses.filter(c => {
            const matchesSearch = searchQuery === '' ||
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.code.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filterStatus === 'all' ||
                (filterStatus === 'assigned' && c.email_id) ||
                (filterStatus === 'unassigned' && !c.email_id);
            return matchesSearch && matchesFilter;
        });
    }, [courses, searchQuery, filterStatus]);

    // Stats
    const stats = useMemo(() => ({
        total: courses.length,
        assigned: courses.filter(c => c.email_id).length,
        unassigned: courses.filter(c => !c.email_id).length,
    }), [courses]);

    // Filtered faculty for modal dropdown
    const filteredFaculty = useMemo(() => {
        if (!facultySearch) return facultyList;
        const q = facultySearch.toLowerCase();
        return facultyList.filter(f =>
            f.name.toLowerCase().includes(q) ||
            f.email_id.toLowerCase().includes(q) ||
            f.department.toLowerCase().includes(q)
        );
    }, [facultyList, facultySearch]);

    const openAssignModal = (course: Course) => {
        setSelectedCourse(course);
        setSelectedFacultyEmail(course.email_id || '');
        setFacultySearch('');
        setModalOpen(true);
        setMsg(null);
    };

    const handleAssign = async () => {
        if (!selectedCourse || !selectedFacultyEmail) return;
        setActionLoading(true);
        try {
            await api.post('/admin/assign-faculty', {
                courseId: selectedCourse.id,
                facultyId: selectedFacultyEmail,
            });
            setMsg({ type: 'success', text: `Faculty assigned to ${selectedCourse.code} successfully!` });
            setModalOpen(false);
            fetchCourses();
        } catch (err: any) {
            setMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to assign faculty.' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnassign = async (course: Course) => {
        if (!confirm(`Remove faculty assignment from ${course.code} - ${course.name}?`)) return;
        setActionLoading(true);
        try {
            await api.patch(`/admin/courses/${course.id}/unassign`);
            setMsg({ type: 'success', text: `Faculty unassigned from ${course.code}.` });
            fetchCourses();
        } catch (err: any) {
            setMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to unassign faculty.' });
        } finally {
            setActionLoading(false);
        }
    };

    const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all';

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <UserCheck className="w-7 h-7 text-blue-600" />
                Course Allocation
            </h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Courses</p>
                        <p className="text-xl font-bold text-gray-800">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Assigned</p>
                        <p className="text-xl font-bold text-green-700">{stats.assigned}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Unassigned</p>
                        <p className="text-xl font-bold text-amber-700">{stats.unassigned}</p>
                    </div>
                </div>
            </div>

            {/* Message */}
            {msg && (
                <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {msg.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                    {msg.text}
                    <button onClick={() => setMsg(null)} className="ml-auto"><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Search & Filter Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by course name or code..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className={`${inputCls} pl-9`}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value as FilterStatus)}
                        className={`${inputCls} pl-9 pr-8 appearance-none`}
                    >
                        <option value="all">All Courses</option>
                        <option value="assigned">Assigned</option>
                        <option value="unassigned">Unassigned</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Course Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {filteredCourses.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-medium">No courses found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filter criteria.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Code</th>
                                <th className="px-4 py-3 text-left font-medium">Course Name</th>
                                <th className="px-4 py-3 text-left font-medium">Credits</th>
                                <th className="px-4 py-3 text-left font-medium">Type</th>
                                <th className="px-4 py-3 text-left font-medium">Assigned Faculty</th>
                                <th className="px-4 py-3 text-left font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCourses.map(course => (
                                <tr key={course.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">{course.code}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-800">{course.name}</div>
                                        {course.description && (
                                            <div className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{course.description}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{course.credits}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${course.is_elective ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {course.is_elective ? 'Elective' : 'Regular'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {course.faculty ? (
                                            <div>
                                                <div className="font-medium text-gray-800">{course.faculty.name}</div>
                                                <div className="text-xs text-gray-400">{course.faculty.email_id}</div>
                                                <div className="text-xs text-gray-400">{course.faculty.department} · {course.faculty.designation}</div>
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                <AlertCircle className="w-3 h-3" />
                                                Unassigned
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openAssignModal(course)}
                                                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1"
                                            >
                                                <UserCheck className="w-3 h-3" />
                                                {course.email_id ? 'Reassign' : 'Assign'}
                                            </button>
                                            {course.email_id && (
                                                <button
                                                    onClick={() => handleUnassign(course)}
                                                    disabled={actionLoading}
                                                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1 disabled:opacity-50"
                                                >
                                                    <UserX className="w-3 h-3" />
                                                    Unassign
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <p className="text-xs text-gray-400 mt-3 text-right">
                Showing {filteredCourses.length} of {courses.length} courses
            </p>

            {/* Assignment Modal */}
            {modalOpen && selectedCourse && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-200">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">Assign Faculty</h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {selectedCourse.code} — {selectedCourse.name}
                                </p>
                            </div>
                            <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 space-y-4">
                            {selectedCourse.faculty && (
                                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                                    <span className="text-gray-500">Currently assigned:</span>
                                    <span className="ml-2 font-medium text-gray-800">{selectedCourse.faculty.name}</span>
                                    <span className="text-gray-400 ml-1">({selectedCourse.faculty.email_id})</span>
                                </div>
                            )}

                            {/* Faculty Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Search Faculty</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or department..."
                                        value={facultySearch}
                                        onChange={e => setFacultySearch(e.target.value)}
                                        className={`${inputCls} pl-9`}
                                    />
                                </div>
                            </div>

                            {/* Faculty List */}
                            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                                {filteredFaculty.length === 0 ? (
                                    <div className="p-4 text-center text-gray-400 text-sm">No faculty found</div>
                                ) : (
                                    filteredFaculty.map(f => (
                                        <label
                                            key={f.email_id}
                                            className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-blue-50 transition-colors ${selectedFacultyEmail === f.email_id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name="faculty"
                                                value={f.email_id}
                                                checked={selectedFacultyEmail === f.email_id}
                                                onChange={() => setSelectedFacultyEmail(f.email_id)}
                                                className="accent-blue-600"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-800 text-sm">{f.name}</div>
                                                <div className="text-xs text-gray-400">{f.email_id}</div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="text-xs text-gray-500">{f.department}</div>
                                                <div className="text-xs text-gray-400">{f.designation}</div>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-5 border-t border-gray-200">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssign}
                                disabled={!selectedFacultyEmail || actionLoading}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                                Assign Faculty
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseAllocation;
