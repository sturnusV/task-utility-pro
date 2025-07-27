import { Request, Response, NextFunction } from 'express';

export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.set({
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'self'",
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'no-referrer'
  });
  next();
};