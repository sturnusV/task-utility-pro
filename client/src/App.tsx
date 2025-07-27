import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import TaskFormPage from './pages/TaskFormPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ArchivedTasksPage from './pages/ArchivedTasksPage';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RequestPasswordResetPage from './pages/RequestPasswordResetPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ResendVerificationPage from './pages/ResendVerificationPage';
import VerifyEmailNoticePage from './pages/VerifyEmailNoticePage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import SetAppPasswordPage from './pages/SetAppPasswordPage';
import LinkAccountsPage from './pages/LinkAccountsPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/verify-email-notice" element={<VerifyEmailNoticePage />} />
        <Route path="/resend-verification" element={<ResendVerificationPage />} />
        <Route path="/request-reset" element={<RequestPasswordResetPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/set-app-password" element={<SetAppPasswordPage />} />
        <Route path="/link-accounts" element={<LinkAccountsPage />} />

        {/*
          Protected Routes:
          - Wrapped by <Layout /> for common layout elements (e.g., header, sidebar).
          - Then wrapped by <ProtectedRoute /> to enforce authentication for all nested routes.
        */}
        <Route element={<Layout />}> {/* Parent route for common layout */}
          <Route element={<ProtectedRoute />}> {/* Parent route for authentication */}
            {/* Nested Protected Routes */}
            <Route path="/" element={<DashboardPage />} /> {/* Root path for authenticated users */}
            <Route path="/dashboard" element={<DashboardPage />} /> {/* Explicitly define /dashboard */}
            <Route path="/tasks/new" element={<TaskFormPage />} />
            <Route path="/tasks/archive" element={<ArchivedTasksPage />} />
            <Route path="/tasks/:id/edit" element={<TaskFormPage />} />
          </Route>
        </Route>

        {/* Fallback for unmatched routes (e.g., 404 page) */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <h1 className="text-2xl text-gray-700">404 - Page Not Found</h1>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
