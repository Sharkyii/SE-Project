import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '../../app/store';

interface ProtectedRouteProps {
    allowedRoles?: ('admin' | 'faculty' | 'student')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { isAuthenticated, user } = useStore();
    const location = useLocation();

    console.log('ProtectedRoute check - isAuthenticated:', isAuthenticated, 'user:', user, 'allowedRoles:', allowedRoles, 'location:', location.pathname);

    if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        console.log('User role not allowed, redirecting to dashboard');
        // Redirect to their default dashboard if they don't have access
        return <Navigate to="/dashboard" replace />;
    }

    console.log('ProtectedRoute passed, rendering Outlet');
    return <Outlet />;
};
