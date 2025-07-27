// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/config';

// Define the interface locally within this file
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email?: string; 
  };
}

export const authenticate = (
  req: AuthenticatedRequest, 
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string };
    req.user = decoded; 
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }
};