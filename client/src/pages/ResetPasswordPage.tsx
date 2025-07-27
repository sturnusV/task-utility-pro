import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../api/authService';
import { useDebounce } from '../hooks/useDebounce';
import { FaSpinner } from 'react-icons/fa';
import { RiCloseCircleLine, RiQuestionLine, RiEyeLine, RiEyeCloseLine } from "react-icons/ri";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRulesPopup, setShowPasswordRulesPopup] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);
  const navigate = useNavigate();

  // Debounced values
  const debouncedPassword = useDebounce(newPassword, 1000);
  const debouncedConfirmPassword = useDebounce(confirmPassword, 1000);

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

  // Password validation
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

  const validateConfirmPassword = (confirm: string, original: string): string | null => {
    if (!confirm) return null;
    if (confirm !== original) return 'Passwords do not match';
    return null;
  };

  // Debounced validation effects
  useEffect(() => {
    if (debouncedPassword) {
      setPasswordError(validatePassword(debouncedPassword));
    } else {
      setPasswordError(null);
    }
  }, [debouncedPassword]);

  useEffect(() => {
    if (debouncedConfirmPassword) {
      setConfirmPasswordError(validateConfirmPassword(debouncedConfirmPassword, newPassword));
    } else {
      setConfirmPasswordError(null);
    }
  }, [debouncedConfirmPassword, newPassword]);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      setTokenValid(true);
    } else {
      setTokenValid(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;
    setError('');

    const passwordValidation = validatePassword(newPassword);
    const confirmValidation = validateConfirmPassword(confirmPassword, newPassword);

    setPasswordError(passwordValidation);
    setConfirmPasswordError(confirmValidation);

    if (passwordValidation || confirmValidation) {
      setError('Please fix the validation errors');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(token, newPassword);
      setMessage('Password reset successfully! You can now log in with your new password.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError('Failed to reset password. The link may be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    if (passwordError) setPasswordError(null);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (confirmPasswordError) setConfirmPasswordError(null);
  };

  if (tokenValid === false) {
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
          <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">
            Invalid Reset Link
          </h2>
          <p className="text-center mb-4">
            The password reset link is invalid or expired.
          </p>
          <Link
            to="/request-reset"
            className="block w-full text-center bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

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
          Set New Password
        </h2>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 rounded text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label htmlFor="newPassword" className="block mb-1 text-sm font-medium text-gray-700">
              New Password
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
                id="newPassword"
                value={newPassword}
                onChange={handlePasswordChange}
                onBlur={() => setPasswordError(validatePassword(newPassword))}
                ref={passwordInputRef}
                className={`w-full p-2 pr-10 border ${passwordError ? 'border-red-500' : 'border-gray-300'
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
            {passwordError && (
              <p className="mt-1 text-sm text-red-600">{passwordError}</p>
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

          <div className="relative">
            <label htmlFor="confirmPassword" className="block mb-1 text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                onBlur={() => setConfirmPasswordError(validateConfirmPassword(confirmPassword, newPassword))}
                className={`w-full p-2 pr-10 border ${confirmPasswordError ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <RiEyeCloseLine /> : <RiEyeLine />}
              </button>
            </div>
            {confirmPasswordError && (
              <p className="mt-1 text-sm text-red-600">{confirmPasswordError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center bg-blue-600 text-white py-2 px-3 rounded-md transition-colors disabled:opacity-50 ${!isLoading && 'hover:bg-blue-700'
              }`}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600 text-sm">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}