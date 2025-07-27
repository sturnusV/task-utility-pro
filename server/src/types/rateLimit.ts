// src/types/rateLimit.ts
import { Request } from 'express';

export interface RateLimitRequest extends Request {
  user?: {
    id: string;
    username: string;
    email?: string;
  };
}