// src/services/verificationService.ts
import * as db from '../utils/database';
import crypto from 'crypto';
import { sendVerificationEmail } from '../utils/emailSender';
import { findUserByEmail } from './userService';
import type { UserWithVerification } from '../types/verification';

interface QueryResult {
    rowCount: number;
    rows: { id: number }[]; // For queries that return just an ID or row count
}

export const generateVerificationToken = async (userId: number): Promise<string> => {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const result = await db.query<QueryResult>( // Use QueryResult as we only care about rowCount here
        `UPDATE users
         SET email_verification_token = $1,
             email_verification_token_expires = $2
         WHERE id = $3`,
        [token, expires, userId]
    );

    if (!result || result.rowCount === 0) {
        throw new Error('Failed to generate verification token: User not found or update failed.');
    }

    return token;
};

export const verifyUserEmail = async (token: string): Promise<boolean> => {
    token = token.trim(); // Remove whitespace from ends

    let retries = 3;
    let delay = 500; // milliseconds

    let user: UserWithVerification | undefined;

    while (retries > 0) {
        const userResult = await db.query<UserWithVerification>(
            `SELECT id, email_verified, email_verification_token_expires
             FROM users
             WHERE email_verification_token = $1`,
            [token]
        );

        if (userResult.rows.length > 0) {
            user = userResult.rows[0];
            break; // Token found, exit retry loop
        }

        retries--;
        if (retries > 0) {
            await new Promise(res => setTimeout(res, delay));
            delay *= 2; // Exponential backoff
        }
    }

    if (!user) {
        throw new Error('Invalid verification token');
    }

    if (user.email_verified) {
        throw new Error('Email already verified');
    }

    if (user.email_verification_token_expires && user.email_verification_token_expires < new Date()) {
        await db.query(
            `UPDATE users
             SET email_verification_token = NULL,
                 email_verification_token_expires = NULL
             WHERE id = $1`,
            [user.id]
        );
        throw new Error('Verification token has expired');
    }

    const updateResult = await db.query<QueryResult>(
        `UPDATE users
         SET email_verified = TRUE,
             email_verification_token = NULL,
             email_verification_token_expires = NULL
         WHERE id = $1
         RETURNING id`,
        [user.id]
    );

    if (!updateResult || updateResult.rowCount === 0) {
        throw new Error('Failed to update user verification status.');
    }

    return true; // Successfully verified
};

/**
 * Resend or generate new email verification token.
 * If an unexpired token exists, reuse it.
 */
export const resendVerificationToken = async (email: string): Promise<void> => {
    const user = await findUserByEmail(email);

    if (!user) return; // Silent fail
    if (user.email_verified) throw new Error('Email already verified');

    let token: string;

    // Check if user already has a valid token
    if (
        user.email_verification_token &&
        user.email_verification_token_expires &&
        new Date(user.email_verification_token_expires) > new Date()
    ) {
        // Reuse existing valid token
        token = user.email_verification_token;
    } else {
        // Generate a new one
        token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

        const updateResult = await db.query<QueryResult>(
            `UPDATE users
       SET email_verification_token = $1,
           email_verification_token_expires = $2
       WHERE id = $3`,
            [token, expires, user.id]
        );

        if (updateResult.rowCount === 0) {
            throw new Error('Failed to update verification token.');
        }
    }

    // Send the email
    await sendVerificationEmail(user.email, token);
};