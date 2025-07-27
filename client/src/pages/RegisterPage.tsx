import { useState, useEffect, useRef } from 'react'; // Import useRef
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { FaSpinner } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import { RiCloseCircleLine, RiQuestionLine, RiEyeLine, RiEyeCloseLine } from "react-icons/ri";

export default function RegisterPage() {
  const { register, googleSignIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // New state for controlling the password rules popup visibility
  const [showPasswordRulesPopup, setShowPasswordRulesPopup] = useState(false);
  // Ref for the password input to position the popup relative to it
  const passwordInputRef = useRef<HTMLInputElement>(null);
  // State to store the popup's position
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);


  const debouncedUsername = useDebounce(username, 1000);
  const debouncedEmail = useDebounce(email, 1000);
  const debouncedPassword = useDebounce(password, 1000);

  const validateUsername = (username: string): string | null => {
    if (!username) return null;
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return null;
  };

  const validateEmail = (email: string): string | null => {
    if (!email) return null;
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!re.test(email)) return 'Please enter a valid email address';
    return null;
  };

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

  const passwordRequirements = [
    { id: 1, text: 'At least 8 characters', valid: password.length >= 8 },
    { id: 2, text: 'At least one uppercase letter', valid: /[A-Z]/.test(password) },
    { id: 3, text: 'At least one lowercase letter', valid: /[a-z]/.test(password) },
    { id: 4, text: 'At least one number', valid: /[0-9]/.test(password) },
    { id: 5, text: 'At least one special character', valid: /[*\.!@#$%^&(){}[\]:;<>,.?\/~_+\-=|\\]/.test(password) },
  ];

  // Effect to update popup position when password input ref changes or window resizes
  useEffect(() => {
    const updatePosition = () => {
      if (passwordInputRef.current) {
        const rect = passwordInputRef.current.getBoundingClientRect();
        setPopupPosition({
          top: rect.top + window.scrollY - 10, // 10px above the input
          left: rect.left + window.scrollX,
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);

    return () => window.removeEventListener('resize', updatePosition);
  }, [showPasswordRulesPopup]);

  useEffect(() => {
    if (debouncedUsername) {
      setUsernameError(validateUsername(debouncedUsername));
    } else {
      setUsernameError(null);
    }
  }, [debouncedUsername]);

  useEffect(() => {
    if (debouncedEmail) {
      setEmailError(validateEmail(debouncedEmail));
    } else {
      setEmailError(null);
    }
  }, [debouncedEmail]);

  useEffect(() => {
    if (debouncedPassword) {
      setPasswordError(validatePassword(debouncedPassword));
    } else {
      setPasswordError(null);
    }
  }, [debouncedPassword]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (passwordError) setPasswordError(null);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (error) setError('');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || authLoading) return;

    const usernameValidation = validateUsername(username);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    setUsernameError(usernameValidation);
    setEmailError(emailValidation);
    setPasswordError(passwordValidation);

    if (usernameValidation || emailValidation || passwordValidation) {
      setError('Please fix the validation errors.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await register(username, email, password);
      navigate('/verify-email-notice', { state: { email } });
    } catch (err: any) {
      console.error('Registration failed:', err);
      if (err.response?.data?.error) {
        switch (err.response.data.error) {
          case 'Username already taken':
            setError('This username is already taken. Please choose another.');
            break;
          case 'Email already registered':
            setError('This email is already registered. Try logging in instead, or sign in with Google to link accounts.');
            break;
          default:
            setError(err.response.data.error || 'Registration failed. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsSubmitting(true);
    setError('');
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In failed. Please try again or use email registration.');
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

        <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">Create your account</h2>

        {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block mb-1 text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={handleUsernameChange}
                onBlur={() => setUsernameError(validateUsername(username))}
                className={`w-full p-2 border ${usernameError ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                required
              />
              {usernameError && (
                <p className="mt-1 text-sm text-red-600">{usernameError}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => setEmailError(validateEmail(email))}
                className={`w-full p-2 border ${emailError ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                required
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>
            <div className="relative">
              <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
                Password
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
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => {
                    setPasswordError(validatePassword(password));
                  }}
                  ref={passwordInputRef}
                  className={`w-full p-2 pr-10 border ${passwordError ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
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
                <div className="absolute bg-white p-4 rounded-lg shadow-xl border border-gray-200 z-50 
                w-full max-w-xs sm:max-w-md md:max-w-lg lg:w-1/2">
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
              )}
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
                  Registering...
                </>
              ) : (
                'Register'
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
              text="signup_with"
            />
          </div>

          <p className="mt-4 text-center text-gray-600 text-sm">
            Already have an account?{' '}
            <button
              onClick={() => {
                navigate('/login');
              }}
              className="text-blue-600 hover:underline font-medium bg-transparent border-none p-0 cursor-pointer"
            >
              Login here
            </button>
          </p>
        </>
      </div>
    </div>
  );
}
