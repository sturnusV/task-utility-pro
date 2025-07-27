import * as db from '../utils/database';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Define types for our database operations
interface UserRecord {
  id: number;
}

interface QueryResult<T = any> {
  id: any;
  rowCount: number;
  rows: T[];
}

export const generatePasswordResetToken = async (email: string): Promise<string | null> => {
  // Query with explicit return type
  const userResult = await db.query<QueryResult<UserRecord>>(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (!userResult || !userResult.rows[0]) return null;

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Update with explicit return type
  const updateResult = await db.query<QueryResult>(
    `UPDATE users 
     SET password_reset_token = $1,
         password_reset_token_expires = $2
     WHERE id = $3`,
    [token, expires, userResult.rows[0].id]
  );

  if (!updateResult) {
    throw new Error('Failed to generate password reset token');
  }

  return token;
};

export const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await db.query<QueryResult>(
      `UPDATE users
       SET password_hash = $1,
           password_reset_token = NULL,
           password_reset_token_expires = NULL
       WHERE password_reset_token = $2
       AND password_reset_token_expires > NOW()
       RETURNING id`,
      [hashedPassword, token]
    );

    if (!result) {
      throw new Error('Database connection error');
    }

    if (result.rowCount === 0) {
      const exists = await db.query<QueryResult>(
        `SELECT 1 FROM users WHERE password_reset_token = $1`,
        [token]
      );
      if (exists?.rowCount) {
        throw new Error('Password reset token has expired');
      }
      throw new Error('Invalid password reset token');
    }

    return true;
  } catch (error) {
    console.error('Password reset error:', error);
    throw error; // Re-throw for controller to handle
  }
};