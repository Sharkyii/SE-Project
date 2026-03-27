import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Loader2, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../services/api';

const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'Mechanical', 'Civil'];
const DESIGNATIONS = ['Assistant Professor', 'Associate Professor', 'Professor', 'HOD'];
const SECTIONS = ['A', 'B', 'C'];

type Tab = 'student' | 'faculty';

interface Student { id: number; student_id: string; name: string; email_id: string; department: string; semester: number; }
interface Faculty { id: number; name: string; email_id: string; department: string; designation: string; }

const UserManagement: React.FC = () => {
    const [tab, setTab] = useState<Tab>('student');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [faculty, setFaculty] = useState<Faculty[]>([]);
    const [showList, setShowList] = useState(false);

    const [sForm, setSForm] = useState({ name: '', email: '', password: '', student_id: '', department: 'CSE', semester: '1', section: 'A' });
    const [fForm, setFFform] = useState({ name: '', email: '', password: '', department: 'CSE', designation: 'Assistant Professor' });

    const fetchList = async () => {
        if (tab === 'student') {
            const { data } = await api.get<Student[]>('/admin/students');
            setStudents(data);
        } else {
            const { data } = await api.get<Faculty[]>('/admin/faculty');
            setFaculty(data);
        }
    };

    useEffect(() => { if (showList) fetchList(); }, [tab, showList]);

    const handleStudentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setMsg(null);
        try {
            await api.post('/admin/students', sForm);
            setMsg({ type: 'success', text: 'Student account created successfully.' });
            setSForm({ name: '', email: '', password: '', student_id: '', department: 'CSE', semester: '1', section: 'A' });
            fetchList();
        } catch (err: any) {
            setMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to create student.' });
        } finally { setLoading(false); }
    };

    const handleFacultySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setMsg(null);
        try {
            await api.post('/admin/faculty', fForm);
            setMsg({ type: 'success', text: 'Faculty account created successfully.' });
            setFFform({ name: '', email: '', password: '', department: 'CSE', designation: 'Assistant Professor' });
            fetchList();
        } catch (err: any) {
            setMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to create faculty.' });
        } finally { setLoading(false); }
    };

    const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm';
    const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-blue-600" /> User Management
            </h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {(['student', 'faculty'] as Tab[]).map((t) => (
                    <button key={t} onClick={() => { setTab(t); setMsg(null); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {msg && (
                <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {msg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {msg.text}
                </div>
            )}

            {/* Student Form */}
            {tab === 'student' && (
                <form onSubmit={handleStudentSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelCls}>Full Name</label>
                            <input className={inputCls} required value={sForm.name} onChange={e => setSForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Rahul Sharma" /></div>
                        <div><label className={labelCls}>Roll Number / Student ID</label>
                            <input className={inputCls} required value={sForm.student_id} onChange={e => setSForm(p => ({ ...p, student_id: e.target.value }))} placeholder="e.g. 2022BCS001" /></div>
                        <div><label className={labelCls}>Email</label>
                            <input className={inputCls} type="email" required value={sForm.email} onChange={e => setSForm(p => ({ ...p, email: e.target.value }))} placeholder="student@iiitm.ac.in" /></div>
                        <div><label className={labelCls}>Password</label>
                            <input className={inputCls} type="password" required value={sForm.password} onChange={e => setSForm(p => ({ ...p, password: e.target.value }))} placeholder="Set initial password" /></div>
                        <div><label className={labelCls}>Department</label>
                            <select className={inputCls} value={sForm.department} onChange={e => setSForm(p => ({ ...p, department: e.target.value }))}>
                                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                            </select></div>
                        <div><label className={labelCls}>Semester</label>
                            <select className={inputCls} value={sForm.semester} onChange={e => setSForm(p => ({ ...p, semester: e.target.value }))}>
                                {[1,2,3,4,5,6,7,8].map(s => <option key={s}>{s}</option>)}
                            </select></div>
                        <div><label className={labelCls}>Section</label>
                            <select className={inputCls} value={sForm.section} onChange={e => setSForm(p => ({ ...p, section: e.target.value }))}>
                                {SECTIONS.map(s => <option key={s}>{s}</option>)}
                            </select></div>
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                        Create Student Account
                    </button>
                </form>
            )}

            {/* Faculty Form */}
            {tab === 'faculty' && (
                <form onSubmit={handleFacultySubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelCls}>Full Name</label>
                            <input className={inputCls} required value={fForm.name} onChange={e => setFFform(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Dr. Priya Singh" /></div>
                        <div><label className={labelCls}>Email</label>
                            <input className={inputCls} type="email" required value={fForm.email} onChange={e => setFFform(p => ({ ...p, email: e.target.value }))} placeholder="faculty@iiitm.ac.in" /></div>
                        <div><label className={labelCls}>Password</label>
                            <input className={inputCls} type="password" required value={fForm.password} onChange={e => setFFform(p => ({ ...p, password: e.target.value }))} placeholder="Set initial password" /></div>
                        <div><label className={labelCls}>Department</label>
                            <select className={inputCls} value={fForm.department} onChange={e => setFFform(p => ({ ...p, department: e.target.value }))}>
                                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                            </select></div>
                        <div><label className={labelCls}>Designation</label>
                            <select className={inputCls} value={fForm.designation} onChange={e => setFFform(p => ({ ...p, designation: e.target.value }))}>
                                {DESIGNATIONS.map(d => <option key={d}>{d}</option>)}
                            </select></div>
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                        Create Faculty Account
                    </button>
                </form>
            )}

            {/* Existing users list */}
            <button onClick={() => setShowList(p => !p)}
                className="mt-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                <Users className="w-4 h-4" />
                {showList ? 'Hide' : 'Show'} existing {tab}s
                {showList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showList && tab === 'student' && (
                <div className="mt-3 bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600"><tr>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Roll No</th>
                            <th className="px-4 py-2 text-left">Dept</th>
                            <th className="px-4 py-2 text-left">Sem</th>
                        </tr></thead>
                        <tbody>{students.map(s => (
                            <tr key={s.id} className="border-t border-gray-100">
                                <td className="px-4 py-2">{s.name}</td>
                                <td className="px-4 py-2 font-mono text-xs">{s.student_id}</td>
                                <td className="px-4 py-2">{s.department}</td>
                                <td className="px-4 py-2">{s.semester}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}

            {showList && tab === 'faculty' && (
                <div className="mt-3 bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600"><tr>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Email</th>
                            <th className="px-4 py-2 text-left">Dept</th>
                            <th className="px-4 py-2 text-left">Designation</th>
                        </tr></thead>
                        <tbody>{faculty.map(f => (
                            <tr key={f.id} className="border-t border-gray-100">
                                <td className="px-4 py-2">{f.name}</td>
                                <td className="px-4 py-2 text-xs">{f.email_id}</td>
                                <td className="px-4 py-2">{f.department}</td>
                                <td className="px-4 py-2">{f.designation}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
