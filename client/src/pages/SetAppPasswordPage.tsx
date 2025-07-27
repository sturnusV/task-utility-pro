// src/pages/SetAppPasswordPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { FaSpinner } from 'react-icons/fa';
import { Toast } from './Toast';
import { RiCloseCircleLine, RiQuestionLine, RiEyeLine, RiEyeCloseLine } from "react-icons/ri";

export default function SetAppPasswordPage() {
    const { user, loading: authLoading, setAppPassword } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [newPassword, setNewPassword] = useState('');
    const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordRulesPopup, setShowPasswordRulesPopup] = useState(false);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);

    const debouncedPassword = useDebounce(newPassword, 1000);
    const googleUserEmail = location.state?.email || user?.email || 'your account';

    const passwordRequirements = [
        { id: 1, text: 'At least 8 characters', valid: newPassword.length >= 8 },
        { id: 2, text: 'At least one uppercase letter', valid: /[A-Z]/.test(newPassword) },
        { id: 3, text: 'At least one lowercase letter', valid: /[a-z]/.test(newPassword) },
        { id: 4, text: 'At least one number', valid: /[0-9]/.test(newPassword) },
        { id: 5, text: 'At least one special character', valid: /[*\.!@#$%^&(){}[\]:;<>,.?\/~_+\-=|\\]/.test(newPassword) },
    ];

    // Effect to update popup position
    useEffect(() => {
        const updatePosition = () => {
            if (passwordInputRef.current) {
                const rect = passwordInputRef.current.getBoundingClientRect();
                setPopupPosition({
                    top: rect.top + window.scrollY - 10,
                    left: rect.left + window.scrollX,
                });
            }
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);

        return () => window.removeEventListener('resize', updatePosition);
    }, [showPasswordRulesPopup]);

    // Debounced password validation
    useEffect(() => {
        if (debouncedPassword) {
            setNewPasswordError(validatePassword(debouncedPassword));
        } else {
            setNewPasswordError(null);
        }
    }, [debouncedPassword]);

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

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        // Redirect if:
        // 1. Not a Google-authed user needing password
        // 2. Regular user who already has password
        if (!authLoading && user) {
            const shouldRedirect = !(user.google_id && !user.has_password && !user.email_verified);
            if (shouldRedirect) {
                navigate('/dashboard', { replace: true });
            }
        }
    }, [user, authLoading, navigate]);

    const handleSetPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validatePassword(newPassword);
        setNewPasswordError(validationError);

        if (validationError) {
            showToast('Please fix the password validation errors.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            await setAppPassword(newPassword);
            showToast('App password set successfully!', 'success');
            navigate('/dashboard', { replace: true });
        } catch (err: any) {
            console.error('Failed to set app password:', err);
            showToast(err.response?.data?.message || 'Failed to set app password. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        navigate('/dashboard', { replace: true });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPass = e.target.value;
        setNewPassword(newPass);
        if (newPasswordError) setNewPasswordError(null);
    };

    if (authLoading || !user || user.has_password) {
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
                <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">Set Your App Password</h2>

                <p className="text-center text-gray-700 mb-4">
                    Welcome, <span className="font-semibold">{googleUserEmail}</span>!
                    <br />
                    You've signed in with Google. You can set an app-specific password now to enable traditional email/password logins in the future.
                </p>
                <small className="block text-center text-gray-500 mb-6">
                    This password is only for this application and not your Google account.
                </small>

                <form onSubmit={handleSetPasswordSubmit} className="space-y-4">
                    <div className="relative">
                        <label htmlFor="new-password" className="block mb-1 text-sm font-medium text-gray-700">
                            New App Password
                            <button
                                type="button"
                                onClick={() => setShowPasswordRulesPopup(!showPasswordRulesPopup)}
                                className="ml-2 p-1 rounded-full text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Show password requirements"
                            >
                                <RiQuestionLine />
                            </button>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="new-password"
                                value={newPassword}
                                onChange={handlePasswordChange}
                                onBlur={() => setNewPasswordError(validatePassword(newPassword))}
                                ref={passwordInputRef}
                                className={`w-full p-2 pr-10 border ${newPasswordError ? 'border-red-500' : 'border-gray-300'
                                    } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <RiEyeCloseLine /> : <RiEyeLine />}
                            </button>
                        </div>
                        {newPasswordError && (
                            <p className="mt-1 text-sm text-red-600">{newPasswordError}</p>
                        )}

                        {/* Password Rules Popup */}
                        {showPasswordRulesPopup && popupPosition && (
                            <div className="fixed inset-0 z-40" onClick={() => setShowPasswordRulesPopup(false)}>
                                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                                <div
                                    className="absolute bg-white p-4 rounded-lg shadow-xl border border-gray-200 z-50"
                                    style={{
                                        top: `${popupPosition.top}px`,
                                        left: `${popupPosition.left}px`,
                                        minWidth: '250px',
                                        transform: 'translateY(-100%)'
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex justify-between items-start mb-2 px-1">
                                        <p className="font-semibold text-gray-800 mt-1">Password must contain:</p>
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordRulesPopup(false)}
                                            className="p-1 -mt-1 -mr-1 rounded-full text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            aria-label="Close"
                                        >
                                            <RiCloseCircleLine />
                                        </button>
                                    </div>
                                    <ul className="list-disc pl-5 text-sm">
                                        {passwordRequirements.map((req) => (
                                            <li key={req.id} className={req.valid ? 'text-green-600' : 'text-gray-500'}>
                                                {req.text}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col space-y-3">
                        <button
                            type="submit"
                            disabled={isSubmitting || authLoading}
                            className={`w-full flex justify-center items-center bg-blue-600 text-white py-2 px-3 rounded-md transition-colors disabled:opacity-50 ${!(isSubmitting || authLoading) && 'hover:bg-blue-700'
                                }`}
                        >
                            {(isSubmitting || authLoading) ? (
                                <>
                                    <FaSpinner className="animate-spin mr-2" />
                                    Saving Password...
                                </>
                            ) : (
                                'Set App Password'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleSkip}
                            disabled={isSubmitting || authLoading}
                            className="w-full bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                        >
                            Skip for now
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}