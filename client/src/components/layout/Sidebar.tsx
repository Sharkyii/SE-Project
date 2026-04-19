import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../../app/store';
import { LayoutDashboard, BookOpen, Users, FileText, Calendar, CheckSquare, GraduationCap, ClipboardList, Award, Upload, BadgeCheck, UserPlus, BookMarked, UserCheck, LogOut } from 'lucide-react';
import clsx from 'clsx';

export const Sidebar: React.FC = () => {
    const { user, logout } = useStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const adminLinks = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Course Management', path: '/admin/courses', icon: BookOpen },
        { name: 'Assign Courses', path: '/admin/enrollments', icon: CheckSquare },
        { name: 'Enrollment Management', path: '/admin/enrollment-management', icon: UserPlus },
        { name: 'Course Allocation', path: '/admin/course-allocation', icon: UserCheck },
        { name: 'Master Timetable', path: '/admin/timetable', icon: Calendar },
        { name: 'Exam Timetable', path: '/admin/exam-timetable', icon: BookMarked },
        { name: 'User Management', path: '/admin/users', icon: Users },
        { name: 'Fee Verification', path: '/admin/fee-verification', icon: BadgeCheck },
        { name: 'Reports', path: '/admin/reports', icon: ClipboardList },
        { name: 'Attendance View', path: '/admin/attendance', icon: CheckSquare },
    ];

    const facultyLinks = [
        { name: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
        { name: 'My Timetable', path: '/faculty/timetable', icon: Calendar },
        { name: 'Attendance', path: '/faculty/attendance', icon: ClipboardList },
        { name: 'Grades', path: '/faculty/grades', icon: CheckSquare },
        { name: 'Quiz Upload', path: '/faculty/quiz', icon: Upload },
        { name: 'Leave', path: '/faculty/leave', icon: Calendar },
    ];

    const studentLinks = [
        { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
        { name: 'Registration', path: '/student/registration', icon: FileText },
        { name: 'Fees', path: '/student/fees', icon: CheckSquare },
        { name: 'Electives', path: '/student/electives', icon: BookOpen },
        { name: 'Attendance', path: '/student/attendance', icon: Users },
        { name: 'My Timetable', path: '/student/timetable', icon: Calendar },
        { name: 'Exam Timetable', path: '/student/exam-timetable', icon: BookMarked },
        { name: 'Grades', path: '/student/grades', icon: GraduationCap },
        { name: 'Feedback', path: '/student/feedback', icon: FileText },
        { name: 'Leaderboard', path: '/student/leaderboard', icon: Award },
    ];

    let links: typeof adminLinks = [];
    if (user?.role === 'admin') links = adminLinks;
    if (user?.role === 'faculty') links = facultyLinks;
    if (user?.role === 'student') links = studentLinks;

    return (
        <div className="w-64 glass-effect border-r border-gray-800/50 h-screen flex flex-col">
            <div className="p-6 border-b border-gray-800/50">
                <span className="text-2xl font-bold tracking-wider text-gradient">ERP SYSTEM</span>
            </div>
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
                {links.map((link) => {
                    const Icon = link.icon;
                    return (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                clsx(
                                    'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all',
                                    isActive
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                                )
                            }
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{link.name}</span>
                        </NavLink>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-gray-800/50 space-y-2">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
                <span className="block text-xs text-gray-500 text-center">© 2026 Academic ERP</span>
            </div>
        </div>
    );
};
