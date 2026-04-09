import React, { useEffect, useState } from 'react';
import { useStore } from '../../app/store';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, Bell } from 'lucide-react';
import api from '../../services/api';

export const Topbar: React.FC = () => {
    const { user, logout } = useStore();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        if (user?.role === 'student') {
            const fetchNotifications = async () => {
                try {
                    const res = await api.get('/student/notifications');
                    setNotifications(res.data || []);
                } catch (error) {
                    console.error("Failed to fetch notifications", error);
                }
            };
            fetchNotifications();
            
            // Setting up a basic interval for demonstration
            const interval = setInterval(fetchNotifications, 60000); 
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleMarkRead = async (id: number) => {
        try {
            await api.put(`/student/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read_status: true } : n));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read_status).length;

    return (
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 relative">
            <h1 className="text-xl font-bold text-gray-800">Academic ERP</h1>
            <div className="flex items-center space-x-6">
                {user?.role === 'student' && (
                    <div className="relative">
                        <button 
                            className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-4 text-sm text-gray-500 text-center">No notifications</div>
                                    ) : (
                                        notifications.map((n) => (
                                            <div 
                                                key={n.id} 
                                                className={`p-4 border-b border-gray-100 ${n.read_status ? 'bg-white' : 'bg-blue-50'} cursor-pointer hover:bg-gray-50 transition-colors`}
                                                onClick={() => !n.read_status && handleMarkRead(n.id)}
                                            >
                                                <p className="text-sm text-gray-800">{n.message}</p>
                                                <span className="text-xs text-gray-500 mt-1 block">
                                                    {new Date(n.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
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
