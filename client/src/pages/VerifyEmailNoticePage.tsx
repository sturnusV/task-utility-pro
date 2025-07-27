import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

export default function VerifyEmailNoticePage() {
  const { state } = useLocation();
  const email = state?.email || '';
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

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
          Verify Your Email Address
        </h2>

        <div className="space-y-4">
          <p className="text-center">
            We've sent a verification link to <strong>{email}</strong>.
          </p>
          
          <p className="text-center">
            Please check your email and click the link to verify your account.
          </p>

          <div className="mt-6 space-y-2">
            <p className="text-sm text-gray-600 text-center">
              Didn't receive the email?
            </p>
            <button
              onClick={() => navigate('/resend-verification', { state: { email } })}
              className="w-full bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              Resend verification email
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}