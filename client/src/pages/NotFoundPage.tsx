import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
                <div className="flex flex-col items-center mb-6">
                    <Link to="/" className="mb-4">
                        <img
                            src="/Logo_L.svg"
                            alt="Task Utility Pro Logo"
                            className="h-30 h-30 rounded-full object-cover"
                        />
                    </Link>
                </div>

                <h1 className="text-2xl font-semibold mb-4 text-gray-800">404 - Page Not Found</h1>

                <p className="text-gray-600 mb-6">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                <div className="space-y-3">
                    <Link
                        to="/"
                        className="w-full block bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 transition-colors text-center"
                    >
                        Go to Homepage
                    </Link>

                    <Link
                        to="/login"
                        className="w-full block bg-blue-100 text-blue-700 py-2 px-3 rounded-md hover:bg-blue-200 transition-colors text-center"
                    >
                        Return to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}