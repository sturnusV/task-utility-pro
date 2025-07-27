// src/pages/LinkAccountsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSpinner } from 'react-icons/fa';
import { Toast } from './Toast'; // Assuming you have a Toast component

export default function LinkAccountsPage() {
    const { user, loading: authLoading, linkGoogleAccount } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); // To access state passed from navigate

    // States for the form
    const [existingPassword, setExistingPassword] = useState('');
    const [existingPasswordError, setExistingPasswordError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Data passed from LoginPage or RegisterPage
    const googleEmail = location.state?.googleEmail;
    const googleId = location.state?.googleId;
    const googleUsername = location.state?.googleUsername;

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Password validation logic (reused)
    const validatePassword = (password: string): string | null => {
        if (!password) return null;
        if (password.length < 8) return 'Password must be at least 8 characters long';
        if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
        if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
        if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
        if (!/[*\.!@#$%^&(){}[\]:;<>,.?\/~_+\-=|\\]/.test(password)) {
            return 'Password must contain at least one special character (like *, ., !, etc.)';
        }
        return null;
    };

    // Redirect logic if necessary data is missing or user is already linked/logged in
    useEffect(() => {
        if (!authLoading) {
            // If user is already logged in and has google_id, they shouldn't be here
            if (user && user.has_google_id) { // Assuming you'll add has_google_id to user type
                navigate('/dashboard', { replace: true });
                return;
            }
            // If essential Google data is missing from state, redirect to login
            if (!googleEmail || !googleId || !googleUsername) {
                showToast('Missing Google account information. Please try Google Sign-In again.', 'error');
                navigate('/login', { replace: true });
            }
        }
    }, [user, authLoading, googleEmail, googleId, googleUsername, navigate]);

    const handleConfirmLink = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validatePassword(existingPassword);
        setExistingPasswordError(validationError);

        if (validationError) {
            showToast('Please fix the password validation errors.', 'error');
            return;
        }

        if (!googleEmail || !googleId || !googleUsername) {
            showToast('Google account information is missing. Please try again.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            // Call the linkGoogleAccount function from AuthContext
            await linkGoogleAccount(googleEmail, existingPassword, googleId, googleUsername);
            showToast('Google account successfully linked!', 'success');
            navigate('/dashboard', { replace: true }); // Redirect to dashboard
        } catch (err: any) {
            console.error('Failed to link Google account:', err);
            showToast(err.response?.data?.message || 'Failed to link Google account. Please check your password.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show loading state if auth context is still determining user status
    if (authLoading || !googleEmail || !googleId || !googleUsername) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <FaSpinner className="animate-spin text-blue-500 text-4xl" />
                <p className="ml-4 text-lg text-gray-700">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <div className="flex flex-col items-center mb-6">
                    <Link to="/" className="mb-4">
                        <img
                            src="/Logo_L.svg"
                            alt="Task Utility Pro Logo"
                            className="h-30 h-30 rounded-full object-cover"
                        />
                    </Link>
                </div>
                <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">Link Your Google Account</h2>

                <p className="text-center text-gray-700 mb-4">
                    An account with <span className="font-semibold">{googleEmail}</span> already exists.
                    Please enter your **existing app password** to link your Google account.
                </p>
                <small className="block text-center text-gray-500 mb-6">
                    This will connect your Google login to your existing account.
                </small>

                <form onSubmit={handleConfirmLink} className="space-y-4">
                    <div>
                        <label htmlFor="existing-password" className="block mb-1 text-sm font-medium text-gray-700">
                            Existing App Password
                        </label>
                        <input
                            type="password"
                            id="existing-password"
                            value={existingPassword}
                            onChange={(e) => setExistingPassword(e.target.value)}
                            onBlur={() => setExistingPasswordError(validatePassword(existingPassword))}
                            className={`w-full p-2 border ${existingPasswordError ? 'border-red-500' : 'border-gray-300'
                                } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                            required
                        />
                        {existingPasswordError && (
                            <p className="mt-1 text-sm text-red-600">{existingPasswordError}</p>
                        )}
                    </div>
                    <div className="flex flex-col space-y-3">
                        <button
                            type="submit"
                            disabled={isSubmitting || authLoading}
                            className={`w-full flex justify-center items-center bg-green-600 text-white py-2 px-3 rounded-md transition-colors disabled:opacity-50 ${!(isSubmitting || authLoading) && 'hover:bg-green-700'
                                }`}
                        >
                            {(isSubmitting || authLoading) ? (
                                <>
                                    <FaSpinner className="animate-spin mr-2" />
                                    Linking Account...
                                </>
                            ) : (
                                'Confirm and Link Account'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/login', { replace: true })}
                            disabled={isSubmitting || authLoading}
                            className="w-full bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                        >
                            Cancel / Back to Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
