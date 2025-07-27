import express from 'express';
import {
  login,
  register,
  logout,
  getCurrentUser,
  googleSignIn,
  setAppPassword,
  linkGoogleAccount
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import {
  authRateLimiter,
  strictAuthRateLimiter,
  globalBruteForceLimiter,
  currentUserLimiter
} from '../middleware/rateLimiter';

const router = express.Router();

// Authentication routes
router.post('/register',
  globalBruteForceLimiter,
  authRateLimiter,
  register
);

router.post('/login',
  globalBruteForceLimiter,
  strictAuthRateLimiter,
  login
);

router.post('/logout', authenticate, logout);

router.get('/me',
  globalBruteForceLimiter,
  authenticate,
  currentUserLimiter,
  getCurrentUser
);

router.post('/google',
  globalBruteForceLimiter, // Apply rate limiting
  authRateLimiter, // Apply relevant rate limiting
  googleSignIn
);

router.post('/set-app-password',
  authenticate, // User must be authenticated to set their own password
  setAppPassword
);

router.post('/link-google-account',
  globalBruteForceLimiter, // Apply rate limiting
  authRateLimiter, // Apply relevant rate limiting
  linkGoogleAccount
);

export default router;