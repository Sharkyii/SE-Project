import React from 'react';
import { NavLink } from 'react-router-dom';
import { useStore } from '../../app/store';
import { LayoutDashboard, BookOpen, Users, FileText, Calendar, CheckSquare, GraduationCap, ClipboardList, Award, Upload, BadgeCheck } from 'lucide-react';
import clsx from 'clsx';

export const Sidebar: React.FC = () => {
    const { user } = useStore();

    const adminLinks = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Course Management', path: '/admin/courses', icon: BookOpen },
        { name: 'Assign Courses', path: '/admin/enrollments', icon: CheckSquare },
        { name: 'Master Timetable', path: '/admin/timetable', icon: Calendar },
        { name: 'User Management', path: '/admin/users', icon: Users },
        { name: 'Fee Verification', path: '/admin/fee-verification', icon: BadgeCheck },
        { name: 'Reports', path: '/admin/reports', icon: ClipboardList },
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
        { name: 'Documents', path: '/student/documents', icon: Upload },
        { name: 'Fees', path: '/student/fees', icon: CheckSquare },
        { name: 'Electives', path: '/student/electives', icon: BookOpen },
        { name: 'Attendance', path: '/student/attendance', icon: Users },
        { name: 'My Timetable', path: '/student/timetable', icon: Calendar },
        { name: 'Grades', path: '/student/grades', icon: GraduationCap },
        { name: 'Feedback', path: '/student/feedback', icon: FileText },
        { name: 'Leaderboard', path: '/student/leaderboard', icon: Award },
    ];

    let links: typeof adminLinks = [];
    if (user?.role === 'admin') links = adminLinks;
    if (user?.role === 'faculty') links = facultyLinks;
    if (user?.role === 'student') links = studentLinks;

    return (
        <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
            <div className="p-6">
                <span className="text-2xl font-bold tracking-wider">ERP SYSTEM</span>
            </div>
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                {links.map((link) => {
                    const Icon = link.icon;
                    return (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                clsx(
                                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                                    isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                )
                            }
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{link.name}</span>
                        </NavLink>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-gray-800">
                <span className="text-xs text-gray-500">© 2024 Academic ERP</span>
            </div>
        </div>
    );
};
