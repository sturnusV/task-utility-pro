//STOPPPP

import { isPasswordBlacklisted } from './passwordBlacklist';

export const validateUsername = (username: string): { valid: boolean; message?: string } => {
  if (!username) return { valid: false, message: 'Username is required' };
  if (username.length < 3) return { valid: false, message: 'Username must be at least 3 characters' };
  if (username.length > 20) return { valid: false, message: 'Username must be less than 20 characters' };
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers, and underscores' };
  }
  return { valid: true };
};

export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  if (!email) return { valid: false, message: 'Email is required' };
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!re.test(email)) return { valid: false, message: 'Please provide a valid email address' };
  if (email.length > 100) return { valid: false, message: 'Email must be less than 100 characters' };
  return { valid: true };
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (isPasswordBlacklisted(password)) {
    return { valid: false, message: 'Password is too common or not allowed' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!/[*\.!@#$%^&(){}[\]:;<>,.?\/~_+\-=|\\]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  return { valid: true };
};