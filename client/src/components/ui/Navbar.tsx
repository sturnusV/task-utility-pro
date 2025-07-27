// src/components/Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLoggedIn = !!user;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (loading) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        {/* Mobile Layout (flex-col) */}
        <div className="md:hidden flex flex-col">
          <div className="flex justify-between items-center">
            {/* Logo - Left */}
            <Link to="/" className="flex-shrink-0">
              <img
                src="/Logo_L.svg"
                alt="Task Utility Pro Logo"
                className="h-16 w-16 rounded-full object-cover"
              />
            </Link>

            {/* Header Text - Center */}
            <span className="text-xl font-bold text-gray-800 mx-auto">
              Task Utility Pro
            </span>

            {/* Avatar with Three Dots - Right */}
            {isLoggedIn && user?.username && (
              <div className="relative flex-shrink-0">
                <button
                  onClick={toggleMobileMenu}
                  className="w-12 h-12 rounded-full bg-gray-300 text-gray-700 text-2xl flex items-center justify-center relative"
                >
                  {user.username.charAt(0).toUpperCase()}
                  {/* Three dots indicator */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </div>
                </button>
              </div>
            )}

            {/* Login/Register Button - Right (when not logged in) */}
            {!isLoggedIn && (
              <button
                onClick={toggleMobileMenu}
                className="text-gray-500 hover:text-gray-700 focus:outline-none p-2"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex justify-between items-center">
          {/* Logo + Text */}
          <Link to="/" className="flex items-center gap-4">
            <img
              src="/Logo_L.svg"
              alt="Task Utility Pro Logo"
              className="h-20 w-20 rounded-full object-cover"
            />
            <span className="text-2xl font-bold text-gray-800">
              Task Utility Pro
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="flex space-x-4 items-center">
            {isLoggedIn ? (
              <>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate('/tasks/new')}
                    className="whitespace-nowrap text-gray-700 py-2 px-3 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    New Task
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="whitespace-nowrap text-gray-700 py-2 px-3 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/tasks/archive')}
                    className="whitespace-nowrap text-gray-700 py-2 px-3 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Archive
                  </button>
                  <button
                    onClick={handleLogout}
                    className="whitespace-nowrap text-gray-700 py-2 px-3 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Logout
                  </button>
                </div>
                {user?.username && (
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-300 text-gray-700 text-2xl flex items-center justify-center text-lg font-large overflow-hidden ml-2">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate('/login');
                    toggleMobileMenu();
                  }}
                  className="whitespace-nowrap text-gray-700 py-2 px-3 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    navigate('/register');
                    toggleMobileMenu();
                  }}
                  className="whitespace-nowrap text-gray-700 py-2 px-3 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu (conditionally rendered) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <div className="flex flex-col items-start px-4 space-y-2">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => {
                    navigate('/tasks/new');
                    toggleMobileMenu();
                  }}
                  className="w-full bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  New Task
                </button>
                <button
                  onClick={() => {
                    navigate('/');
                    toggleMobileMenu();
                  }}
                  className="w-full bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    navigate('/tasks/archive');
                    toggleMobileMenu();
                  }}
                  className="w-full bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  Archive
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate('/login');
                    toggleMobileMenu();
                  }}
                  className="w-full bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    navigate('/register');
                    toggleMobileMenu();
                  }}
                  className="w-full bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}