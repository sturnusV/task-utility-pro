// src/context/AuthContext.tsx

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getCurrentUser, logout as logoutService, googleSignIn as googleSignInService, setAppPassword as setAppPasswordService, linkGoogleAccount as linkGoogleAccountService } from '../api/authService';
import api from '../api/api';

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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  googleSignIn: (token: string) => Promise<any>;
  setAppPassword: (password: string) => Promise<void>;
  linkGoogleAccount: (email: string, password: string, googleId: string, googleUsername: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        // Add has_google_id derived property
        if (currentUser) {
          setUser({ ...currentUser, has_google_id: !!currentUser.google_id });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to load current user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (!response.data.user?.email_verified) {
        throw new Error('Please verify your email before logging in');
      }
      // Add has_google_id derived property
      setUser({ ...response.data.user, has_google_id: !!response.data.user.google_id });
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
  };

  const googleSignIn = async (token: string) => {
    const response = await googleSignInService(token);
    // If the service returned an error payload, we should not set the user here
    if (response.user) {
      // Add has_google_id derived property
      setUser({ ...response.user, has_google_id: !!response.user.google_id });
    }
    return response;
  };

  const setAppPassword = async (password: string) => {
    try {
      await setAppPasswordService(password);
      // Update user state to reflect that they now have a password
      setUser(prev => prev ? { ...prev, has_password: true } : null);
    } catch (error) {
      console.error('Failed to set app password:', error);
      throw error;
    }
  };

  const linkGoogleAccount = async (email: string, password: string, googleId: string, googleUsername: string) => {
    try {
      const response = await linkGoogleAccountService(email, password, googleId, googleUsername);
      if (response.user) {
        // Update user state after successful linking
        setUser({ ...response.user, has_google_id: !!response.user.google_id });
      }
      return response;
    } catch (error) {
      console.error('Failed to link Google account in context:', error);
      throw error;
    }
  };

  const value = { user, loading, login, register, logout, googleSignIn, setAppPassword, linkGoogleAccount };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
