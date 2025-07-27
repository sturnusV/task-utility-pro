import { Router } from 'express';
import { verifyEmail, resendVerificationEmail } from '../controllers/verificationController';
import {
  verificationEmailLimiter,
  strictAuthRateLimiter,
  globalBruteForceLimiter
} from '../middleware/rateLimiter';

const router = Router();

// Apply rate limiting in this order (most specific to least specific)
router.get('/verify-email', 
  globalBruteForceLimiter, // First line of defense
  strictAuthRateLimiter,   // Stricter limit for verification attempts
  verifyEmail
);

router.post('/resend-verification', 
  globalBruteForceLimiter, // Global protection
  verificationEmailLimiter, // Specific to email resends
  resendVerificationEmail
);

export default router;