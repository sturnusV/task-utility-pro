import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { FaSpinner } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import { RiEyeLine, RiEyeCloseLine } from "react-icons/ri";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const [resetMessage, setResetMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // New state for password visibility
    const { login, googleSignIn, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting || authLoading) return;

        setIsSubmitting(true);
        setError('');

        try {
            await login(email, password);
            navigate('/');
        } catch (err: any) {
            let errorMessage = 'Failed to login. Please check your credentials.';
            if (err.response) {
                if (err.response.status === 401) {
                    errorMessage = 'Invalid credentials';
                } else if (err.response.status === 403) {
                    errorMessage = 'Please verify your email first';
                } else if (err.response.data?.message) {
                    errorMessage = err.response.data.message;
                }
            }
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/request-reset', { email });
            setResetEmailSent(true);
            setResetMessage('If an account exists with this email, you will receive a reset link.');
        } catch (err) {
            setError('Failed to send reset link. Please try again.');
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setIsSubmitting(true);
        setError('');
        setForgotPasswordMode(false);

        try {
            const decodedToken = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
            const googleEmailFromToken = decodedToken.email;
            const googleIdFromToken = decodedToken.sub;
            const googleUsernameFromToken = decodedToken.name || decodedToken.email.split('@')[0];

            const response = await googleSignIn(credentialResponse.credential);

            if (response.action === 'SET_PASSWORD_ON_REGISTER' || (response.user && !response.user.has_password)) {
                navigate('/set-app-password', { state: { email: response.user?.email || googleEmailFromToken } });
            } else if (response.error === 'EMAIL_ALREADY_REGISTERED_WITH_PASSWORD') {
                navigate('/link-accounts', {
                    state: {
                        googleEmail: googleEmailFromToken,
                        googleId: googleIdFromToken,
                        googleUsername: googleUsernameFromToken,
                        message: response.message
                    }
                });
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            console.error('Google Sign-In failed:', err);
            setError(err.response?.data?.message || 'Google Sign-In failed. Please try again.');
            setForgotPasswordMode(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google Sign-In failed. Please try again or use email/password login.');
        setForgotPasswordMode(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
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

                <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">
                    {forgotPasswordMode ? 'Reset Your Password' : 'Login to your account'}
                </h2>

                {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
                {resetMessage && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded text-sm">{resetMessage}</div>}

                {forgotPasswordMode ? (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                disabled={authLoading || resetEmailSent}
                                className="w-full bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                            >
                                {authLoading ? 'Sending...' : resetEmailSent ? 'Email Sent' : 'Send Reset Link'}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setForgotPasswordMode(false);
                                    setResetEmailSent(false);
                                    setResetMessage('');
                                    setError('');
                                }}
                                className="w-full bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting || authLoading}
                                className={`w-full flex justify-center items-center bg-gray-300 text-gray-700 py-2 px-3 rounded-md transition-colors disabled:opacity-50 ${!(isSubmitting || authLoading) && 'hover:bg-gray-400'
                                    }`}
                            >
                                {(isSubmitting || authLoading) ? (
                                    <>
                                        <FaSpinner className="animate-spin mr-2" />
                                        Logging in...
                                    </>
                                ) : (
                                    'Login'
                                )}
                            </button>
                        </form>

                        <div className="flex items-center my-4">
                            <hr className="flex-grow border-t border-gray-300" />
                            <span className="mx-4 text-gray-500 text-sm">OR</span>
                            <hr className="flex-grow border-t border-gray-300" />
                        </div>

                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="filled_blue"
                                text="signin_with"
                            />
                        </div>

                        <div className="mt-4 text-center space-y-2">
                            <p className="text-gray-600 text-sm">
                                Don't have an account?{' '}
                                <button
                                    onClick={() => {
                                        navigate('/register');
                                    }}
                                    className="text-blue-600 hover:underline font-medium bg-transparent border-none p-0 cursor-pointer"
                                >
                                    Register here
                                </button>
                            </p>

                            <p className="text-gray-600 text-sm">
                                Forgot your password?{' '}
                                <button
                                    onClick={() => {
                                        setForgotPasswordMode(true);
                                        setError('');
                                        setResetMessage('');
                                    }}
                                    className="text-blue-600 hover:underline font-medium bg-transparent border-none p-0 cursor-pointer"
                                >
                                    Reset it here
                                </button>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}