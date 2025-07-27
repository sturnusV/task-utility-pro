// src/services/userService.ts

import type { UserWithVerification } from '../types/verification';
import * as db from '../utils/database';
import logger from '../utils/logger';

// Helper function to obfuscate sensitive data in logs
const obfuscateEmail = (email: string): string => {
    const [name, domain] = email.split('@');
    return name && domain ? `${name.substring(0, 2)}...@${domain}` : 'invalid-email';
};

type CreateUserData = {
    username: string;
    email: string;
    password: string; // Hashed password
};

/**
 * Creates a new user in the database.
 * Returns the created user with full verification fields.
 */
export const createUser = async ({
    username,
    email,
    password,
}: CreateUserData): Promise<UserWithVerification> => {
    logger.info('Attempting to create new user', {
        username,
        email: obfuscateEmail(email),
        hasPassword: !!password // Don't log actual password
    });

    try {
        const result = await db.query<UserWithVerification>(
            `INSERT INTO users (username, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, username, email, password_hash, email_verified,
                       email_verification_token, email_verification_token_expires, created_at`,
            [username, email, password]
        );

        if (!result.rows[0]) {
            logger.error('User creation failed - no rows returned', {
                username,
                email: obfuscateEmail(email)
            });
            throw new Error('User creation failed - no data returned');
        }

        const newUser = result.rows[0];
        logger.info('User created successfully', {
            userId: newUser.id,
            username,
            email: obfuscateEmail(email),
            emailVerified: newUser.email_verified
        });

        return newUser;
    } catch (error) {
        logger.error('Failed to create user', {
            username,
            email: obfuscateEmail(email),
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
    }
};

/**
 * Finds a user by their email address.
 * Returns full user with verification fields.
 */
export const findUserByEmail = async (email: string): Promise<UserWithVerification | null> => {
    const result = await db.query<UserWithVerification>(
        `SELECT
            id,
            username,
            email,
            password_hash,
            email_verified,
            email_verification_token,
            email_verification_token_expires,
            created_at
         FROM users
         WHERE email = $1`,
        [email]
    );

    return result.rows[0] || null;
};

/**
 * Finds a user by their username.
 */
export const findUserByUsername = async (username: string): Promise<UserWithVerification | null> => {
    const result = await db.query<UserWithVerification>(
        `SELECT
            id,
            username,
            email,
            password_hash,
            email_verified,
            email_verification_token,
            email_verification_token_expires,
            created_at
         FROM users
         WHERE username = $1`,
        [username]
    );

    return result.rows[0] || null;
};

/**
 * Finds a user by their ID.
 */
export const findUserById = async (id: number): Promise<UserWithVerification | null> => {
    const result = await db.query<UserWithVerification>(
        `SELECT
            id,
            username,
            email,
            password_hash,
            email_verified,
            email_verification_token,
            email_verification_token_expires,
            created_at
         FROM users
         WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
};

/**
 * Updates a user's email verification status and clears token fields.
 */
export const markEmailAsVerified = async (userId: number): Promise<void> => {
    await db.query(
        `UPDATE users
         SET email_verified = TRUE,
             email_verification_token = NULL,
             email_verification_token_expires = NULL
         WHERE id = $1`,
        [userId]
    );
};

/**
 * Creates a new user in the database via Google Sign-In.
 * Automatically marks email as verified and stores Google ID.
 */
export const createGoogleUser = async ({
    username,
    email,
    googleId,
}: {
    username: string;
    email: string;
    googleId: string;
}): Promise<UserWithVerification> => {
    logger.info('Creating new Google user', {
        username,
        email: obfuscateEmail(email),
        googleId: googleId ? `${googleId.substring(0, 4)}...` : 'missing'
    });

    try {
        const result = await db.query<UserWithVerification>(
            `INSERT INTO users (username, email, google_id, email_verified, created_at)
             VALUES ($1, $2, $3, TRUE, NOW())
             RETURNING id, username, email, password_hash, email_verified,
                       email_verification_token, email_verification_token_expires, created_at, google_id`,
            [username, email, googleId]
        );

        if (!result.rows[0]) {
            logger.error('Google user creation failed - no rows returned', {
                username,
                email: obfuscateEmail(email)
            });
            throw new Error('Google user creation failed - no data returned');
        }

        const newUser = result.rows[0];
        logger.info('Google user created successfully', {
            userId: newUser.id,
            username,
            email: obfuscateEmail(email),
            hasPassword: !!newUser.password_hash
        });

        return newUser;
    } catch (error) {
        logger.error('Failed to create Google user', {
            username,
            email: obfuscateEmail(email),
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
    }
};

/**
 * Finds a user by their Google ID.
 */
export const findUserByGoogleId = async (googleId: string): Promise<UserWithVerification | null> => {
    const result = await db.query<UserWithVerification>(
        `SELECT
            id,
            username,
            email,
            password_hash,
            email_verified,
            email_verification_token,
            email_verification_token_expires,
            created_at,
            google_id
         FROM users
         WHERE google_id = $1`,
        [googleId]
    );
    return result.rows[0] || null;
};

/**
 * Updates a user to link a Google ID.
 */
export const linkGoogleIdToUser = async (userId: number, googleId: string): Promise<void> => {
    logger.info('Linking Google ID to user', {
        userId,
        googleId: googleId ? `${googleId.substring(0, 4)}...` : 'missing'
    });

    try {
        const result = await db.query(
            `UPDATE users
             SET google_id = $1, email_verified = TRUE
             WHERE id = $2`,
            [googleId, userId]
        );

        if (result.rowCount === 0) {
            logger.error('Failed to link Google ID - user not found', { userId });
            throw new Error('User not found');
        }

        logger.info('Successfully linked Google ID to user', {
            userId,
            googleId: googleId ? `${googleId.substring(0, 4)}...` : 'missing'
        });
    } catch (error) {
        logger.error('Failed to link Google ID to user', {
            userId,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
    }
};

/**
 * Updates a user's password.
 */
export const updateUserPassword = async (userId: number, hashedPassword: string): Promise<void> => {
    await db.query(
        `UPDATE users
         SET password_hash = $1
         WHERE id = $2`,
        [hashedPassword, userId]
    );
};

