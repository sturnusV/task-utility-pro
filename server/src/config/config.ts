import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3001;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const DATABASE_URL = process.env.DATABASE_URL || '';
export const JWT_SECRET = process.env.JWT_SECRET as string;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
export const APP_URL = process.env.APP_URL || 'http://localhost:5173';
export const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@taskutilitypro.com';
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;

// Add interface for JWT payload
export interface JwtPayload {
  id: string | number;
  username: string;
}