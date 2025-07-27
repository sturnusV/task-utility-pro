import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { requestPasswordReset } from '../api/authService';
import { FaSpinner } from 'react-icons/fa';  // import spinner icon

export default function RequestPasswordResetPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;  // block multiple submits

    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      await requestPasswordReset(email);
      setMessage('If an account exists with this email, you will receive a password reset link.');
      setTimeout(() => navigate('/login'), 5000);
    } catch (err) {
      setError('Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          Reset Your Password
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

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center bg-gray-300 text-gray-700 py-2 px-3 rounded-md transition-colors disabled:opacity-50 ${!isLoading && 'hover:bg-gray-400'
              }`}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Sending...
              </>
            ) : (
              'Send Reset Link'
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
