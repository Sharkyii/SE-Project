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
            if (showList) fetchList();
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
            if (showList) fetchList();
        } catch (err: any) {
            setMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to create faculty.' });
        } finally { setLoading(false); }
    };

    const inputCls = 'w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all text-white placeholder-gray-500 outline-none';
    const labelCls = 'block text-sm font-medium text-gray-400 mb-1';

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
                <UserPlus className="w-8 h-8 text-blue-400" /> User Management
            </h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 bg-gray-900/30 p-1 rounded-xl w-fit border border-gray-800">
                {(['student', 'faculty'] as Tab[]).map((t) => (
                    <button key={t} onClick={() => { setTab(t); setMsg(null); }}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${tab === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {msg && (
                <div className={`flex items-center gap-2 p-4 rounded-xl mb-6 text-sm border animate-in fade-in slide-in-from-top-2 duration-300 ${msg.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {msg.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                    {msg.text}
                </div>
            )}

            {/* Student Form */}
            {tab === 'student' && (
                <form onSubmit={handleStudentSubmit} className="glass-effect rounded-2xl border border-gray-800 p-8 space-y-6 shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                {DEPARTMENTS.map(d => <option key={d} className="bg-gray-900">{d}</option>)}
                            </select></div>
                        <div><label className={labelCls}>Semester</label>
                            <select className={inputCls} value={sForm.semester} onChange={e => setSForm(p => ({ ...p, semester: e.target.value }))}>
                                {[1,2,3,4,5,6,7,8].map(s => <option key={s} className="bg-gray-900">{s}</option>)}
                            </select></div>
                        <div className="md:col-span-2">
                            <label className={labelCls}>Section</label>
                            <select className={inputCls} value={sForm.section} onChange={e => setSForm(p => ({ ...p, section: e.target.value }))}>
                                {SECTIONS.map(s => <option key={s} className="bg-gray-900">{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                        Create Student Account
                    </button>
                </form>
            )}

            {/* Faculty Form */}
            {tab === 'faculty' && (
                <form onSubmit={handleFacultySubmit} className="glass-effect rounded-2xl border border-gray-800 p-8 space-y-6 shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className={labelCls}>Full Name</label>
                            <input className={inputCls} required value={fForm.name} onChange={e => setFFform(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Dr. Priya Singh" /></div>
                        <div><label className={labelCls}>Email</label>
                            <input className={inputCls} type="email" required value={fForm.email} onChange={e => setFFform(p => ({ ...p, email: e.target.value }))} placeholder="faculty@iiitm.ac.in" /></div>
                        <div><label className={labelCls}>Password</label>
                            <input className={inputCls} type="password" required value={fForm.password} onChange={e => setFFform(p => ({ ...p, password: e.target.value }))} placeholder="Set initial password" /></div>
                        <div><label className={labelCls}>Department</label>
                            <select className={inputCls} value={fForm.department} onChange={e => setFFform(p => ({ ...p, department: e.target.value }))}>
                                {DEPARTMENTS.map(d => <option key={d} className="bg-gray-900">{d}</option>)}
                            </select></div>
                        <div className="md:col-span-2">
                            <label className={labelCls}>Designation</label>
                            <select className={inputCls} value={fForm.designation} onChange={e => setFFform(p => ({ ...p, designation: e.target.value }))}>
                                {DESIGNATIONS.map(d => <option key={d} className="bg-gray-900">{d}</option>)}
                            </select>
                        </div>
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                        Create Faculty Account
                    </button>
                </form>
            )}

            {/* Existing users list */}
            <div className="mt-12">
                <button onClick={() => setShowList(p => !p)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900/50 text-sm text-gray-400 hover:text-white border border-gray-800 transition-all">
                    <Users className="w-4 h-4" />
                    {showList ? 'Hide' : 'Show'} existing {tab}s
                    {showList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showList && (
                    <div className="mt-4 glass-effect rounded-2xl border border-gray-800 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-900/80 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Name</th>
                                        {tab === 'student' ? (
                                            <>
                                                <th className="px-6 py-4 text-left">Roll No</th>
                                                <th className="px-6 py-4 text-left">Dept</th>
                                                <th className="px-6 py-4 text-left">Sem</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-6 py-4 text-left">Email</th>
                                                <th className="px-6 py-4 text-left">Dept</th>
                                                <th className="px-6 py-4 text-left">Designation</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {tab === 'student' ? (
                                        students.map(s => (
                                            <tr key={s.id} className="hover:bg-gray-800/30 transition-colors">
                                                <td className="px-6 py-4 text-white font-medium">{s.name}</td>
                                                <td className="px-6 py-4 font-mono text-xs text-blue-400 font-bold">{s.student_id}</td>
                                                <td className="px-6 py-4 text-gray-400">{s.department}</td>
                                                <td className="px-6 py-4 text-gray-400">{s.semester}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        faculty.map(f => (
                                            <tr key={f.id} className="hover:bg-gray-800/30 transition-colors">
                                                <td className="px-6 py-4 text-white font-medium">{f.name}</td>
                                                <td className="px-6 py-4 text-xs text-blue-400 font-bold">{f.email_id}</td>
                                                <td className="px-6 py-4 text-gray-400">{f.department}</td>
                                                <td className="px-6 py-4 text-gray-400 font-medium">{f.designation}</td>
                                            </tr>
                                        ))
                                    )}
                                    {(tab === 'student' ? students : faculty).length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-600 italic">No records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
