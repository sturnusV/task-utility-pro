// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSpinner } from 'react-icons/fa';

const ProtectedRoute: React.FC = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="flex items-center space-x-4">
                    <FaSpinner className="animate-spin text-blue-500 text-4xl" />
                    <span className="text-lg text-gray-600">Authenticating...</span>
                </div>
                <p className="mt-4 text-sm text-gray-500">
                    Please wait while we verify your session
                </p>
            </div>
        );
    }

    // If not authenticated, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.google_id && location.pathname === "/link-accounts") {
        return <Navigate to="/dashboard" replace />;
    }

    // --- Redirection Logic for Special Auth Pages ---

    // Define paths that are "special" and should only be accessed under specific conditions
    const specialAuthPaths = ['/set-app-password', '/link-accounts'];
    const isSpecialAuthPath = specialAuthPaths.includes(location.pathname);

    // Scenario 1: User is authenticated but does NOT have an app password
    // AND they are trying to access a protected route (not a special auth path)
    if (!user.has_password && !isSpecialAuthPath) {
        // Only redirect Google-authed users who haven't set password yet
        if (user.google_id && !user.email_verified) {
            return <Navigate to="/set-app-password" replace />;
        }
        // Allow regular users without passwords (they'll verify via email first)
        return <Outlet />;
    }

    // Scenario 2: User is authenticated AND HAS an app password
    // AND they are trying to access /set-app-password (which they don't need)
    if (user.has_password && location.pathname === '/set-app-password') {
        return <Navigate to="/dashboard" replace />;
    }

    // If authenticated and no special password-setting/linking redirection needed, render nested routes
    return <Outlet />;
};

export default ProtectedRoute;
