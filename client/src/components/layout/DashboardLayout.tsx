import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const DashboardLayout: React.FC = () => {
    console.log('DashboardLayout rendering');
    return (
        <div className="flex h-screen overflow-hidden bg-gray-950">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-gray-950">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
