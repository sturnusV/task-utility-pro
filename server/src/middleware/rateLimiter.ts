import rateLimit from 'express-rate-limit';
import { ipKeyGenerator } from 'express-rate-limit';
import { RateLimitRequest } from '../types/rateLimit';

// Helper function to get client IP
const getClientIp = (req: any) => {
    return req.headers['x-forwarded-for'] || req.ip;
};

export const lightRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        message: 'Too many requests to API root',
        error: 'Rate limit exceeded'
    },
    standardHeaders: true,
    legacyHeaders: false
});

export const currentUserLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Allow 30 requests per window
    message: {
        message: 'Too many profile requests. Please try again later.',
        error: 'Profile request limit exceeded'
    },
    keyGenerator: (req: RateLimitRequest) => {
        // Use authenticated user ID if available, fallback to IP
        return req.user?.id ? `user_${req.user.id}` : ipKeyGenerator(getClientIp(req));
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Updated rate limiters
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        message: 'Too many attempts, please try again later',
        error: 'Rate limit exceeded'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(getClientIp(req))
});

export const strictAuthRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: {
        message: 'Too many attempts, your IP has been temporarily blocked',
        error: 'Account temporarily locked'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(getClientIp(req))
});

export const passwordResetRequestLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        message: 'Too many password reset requests. Please wait before trying again.',
        error: 'Reset request limit exceeded'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const ip = ipKeyGenerator(getClientIp(req));
        const email = req.body.email ? `_${req.body.email}` : '';
        return `${ip}${email}`;
    }
});

export const passwordResetAttemptLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        message: 'Too many password reset attempts. Please request a new reset link.',
        error: 'Reset attempt limit exceeded'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const ip = ipKeyGenerator(getClientIp(req));
        const token = req.body.token ? `_${req.body.token}` : '';
        return `${ip}${token}`;
    }
});

export const verificationEmailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        message: 'Too many verification email requests. Please check your spam folder.',
        error: 'Email verification limit exceeded'
    },
    keyGenerator: (req: RateLimitRequest) => {
        // Use user ID as primary key, fallback to IP only if no user
        return req.user?.id ? `user_${req.user.id}` : ipKeyGenerator(getClientIp(req));
    },
    standardHeaders: true,
    legacyHeaders: false
});

export const globalBruteForceLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 100,
    message: {
        message: 'Too many authentication attempts from this IP. Try again tomorrow.',
        error: 'Global rate limit exceeded'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(getClientIp(req))
});

