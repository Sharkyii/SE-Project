import React from 'react';
import { useStore } from '../../app/store';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';

export const Topbar: React.FC = () => {
    const { user, logout } = useStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <h1 className="text-xl font-bold text-gray-800">Academic ERP</h1>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user?.email} ({user?.role})</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
