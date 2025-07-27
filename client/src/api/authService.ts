// src/services/authService.ts

import api from './api';

interface User {
    id: number;
    username: string;
    email: string;
    email_verified: boolean;
    has_password?: boolean;
    google_id?: string | null;
    has_google_id?: boolean;
    auth_method?: 'google' | 'email';
}

interface AuthResponse {
  user: User;
  token?: string;
  action?: 'SET_PASSWORD' | 'SET_PASSWORD_ON_REGISTER'; // Custom actions from backend
  error?: string; // For existing email conflict
}

export const register = async (username: string, email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', { username, email, password });
  return response.data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
  localStorage.removeItem('token');
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await api.get('/auth/me');
    return response.data.user;
  } catch (error) {
    return null;
  }
};

interface VerificationResult {
  verified: boolean;
  message?: string;
  error?: string;
}

export const verifyEmail = async (token: string): Promise<VerificationResult> => {
  const response = await api.get<VerificationResult>(`/verify-email`, {
    params: { token }
  });
  return response.data;
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  await api.post('/request-reset', { email });
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  await api.post('/reset-password', { token, newPassword });
};

export const resendVerificationEmail = async (email: string): Promise<void> => {
  await api.post('/resend-verification', { email });
};

export const googleSignIn = async (token: string): Promise<AuthResponse> => {
  try {
    const response = await api.post('/auth/google', { token });
    return response.data;
  } catch (error: any) { // Catch the AxiosError
    if (error.response && error.response.data) {
      // If the error has a response from the server, return its data
      // This is crucial for handling 409 Conflict gracefully
      return error.response.data as AuthResponse;
    }
    // For other errors (e.g., network error), re-throw or return a generic error
    throw error;
  }
};

export const setAppPassword = async (password: string): Promise<{ message: string }> => {
  const response = await api.post('/auth/set-app-password', { password });
  return response.data;
};

export const linkGoogleAccount = async (email: string, password: string, googleId: string, googleUsername: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/link-google-account', { email, password, googleId, googleUsername });
  return response.data;
};