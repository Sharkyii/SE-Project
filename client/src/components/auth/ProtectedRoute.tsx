import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '../../app/store';

interface ProtectedRouteProps {
    allowedRoles?: ('admin' | 'faculty' | 'student')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { isAuthenticated, user } = useStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect to their default dashboard if they don't have access
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};
