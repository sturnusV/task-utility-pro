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
import NotFoundPage from './pages/NotFoundPage';

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

        {/* Protected Routes (require auth) */}
        <Route element={<Layout />}>
          <Route element={<ProtectedRoute />}>
            {/* Main App Routes */}
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tasks/new" element={<TaskFormPage />} />
            <Route path="/tasks/archive" element={<ArchivedTasksPage />} />
            <Route path="/tasks/:id/edit" element={<TaskFormPage />} />

            {/* Special Post-Login Setup Routes */}
            <Route path="/set-app-password" element={<SetAppPasswordPage />} />
            <Route path="/link-accounts" element={<LinkAccountsPage />} />
          </Route>
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
