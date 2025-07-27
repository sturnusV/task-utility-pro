import express from 'express';
import { 
  requestReset, 
  resetPassword 
} from '../controllers/passwordResetController';
import { 
  passwordResetRequestLimiter, 
  passwordResetAttemptLimiter,
  globalBruteForceLimiter 
} from '../middleware/rateLimiter';

const router = express.Router();

router.post('/request-reset',
  globalBruteForceLimiter,
  passwordResetRequestLimiter,
  requestReset
);

router.post('/reset-password',
  globalBruteForceLimiter,
  passwordResetAttemptLimiter,
  resetPassword
);

export default router;