// src/controllers/authController.ts

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import * as userService from '../services/userService';
import { JWT_SECRET, JWT_EXPIRES_IN, JwtPayload, GOOGLE_CLIENT_ID } from '../config/config';
import { validateUsername, validateEmail, validatePassword } from '../utils/validation';
import { generateVerificationToken } from '../services/verificationService';
import { sendVerificationEmail } from '../utils/emailSender';

// Initialize Google OAuth2Client
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        username: string;
        email?: string;
    };
}

// The register function
export const register = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { username, email, password } = req.body;

        const usernameValidation = validateUsername(username);
        if (!usernameValidation.valid) {
            return res.status(400).json({
                message: 'Registration failed',
                error: usernameValidation.message
            });
        }

        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
            return res.status(400).json({
                message: 'Registration failed',
                error: emailValidation.message
            });
        }

        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                message: 'Registration failed',
                error: passwordValidation.message
            });
        }

        // Check if username exists
        const existingUsername = await userService.findUserByUsername(username);
        if (existingUsername) {
            return res.status(400).json({
                message: 'Registration failed',
                error: 'Username already taken'
            });
        }

        // Check if email exists
        const existingEmail = await userService.findUserByEmail(email);
        if (existingEmail) {
            return res.status(400).json({
                message: 'Registration failed',
                error: 'Email already registered'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userService.createUser({ username, email, password: hashedPassword });

        // Generate verification token AFTER user is created
        const verificationToken = await generateVerificationToken(newUser.id);
        await sendVerificationEmail(newUser.email, verificationToken);

        res.status(201).json({
            message: 'Registration successful. Please check your email to verify your account.',
            user: { // Optionally, send back some user info (without sensitive data)
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                email_verified: newUser.email_verified // This will be false
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ // Changed to 500 for true server errors
            message: 'Registration failed',
            error: 'An unexpected server error occurred during registration.'
        });
    }
};

export const login = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const { email, password } = req.body;
        const user = await userService.findUserByEmail(email);

        // First check if user exists and password is correct
        if (!user || !(await bcrypt.compare(password, user.password_hash || ''))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // User is verified and credentials are correct, generate JWT and set cookie
        const payload: JwtPayload = {
            id: user.id,
            username: user.username
        };

        const token = jwt.sign(
            { id: user.id, username: user.username }, // Ensure payload matches JwtPayload if needed
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400000 // 1 day in milliseconds
        });

        return res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                email_verified: user.email_verified,
                has_password: !!user.password_hash, // Ensure this is always sent
                google_id: user.google_id // Ensure google_id is always sent
            }
        });
    } catch (error) {
        console.error('Login error:', error); // Log the actual error
        return res.status(500).json({ message: 'Login failed due to an unexpected server error.' });
    }
};

export const getCurrentUser = (req: AuthenticatedRequest, res: Response): void => {
    if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    res.json({ user: req.user });
};

export const logout = (req: AuthenticatedRequest, res: Response) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};

export const googleSignIn = async (req: AuthenticatedRequest, res: Response) => {
    const { token } = req.body; // Google ID token sent from the frontend

    if (!token) {
        return res.status(400).json({ message: 'Google ID token is required' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email || !payload.sub) {
            return res.status(400).json({ message: 'Invalid Google ID token payload' });
        }

        const googleEmail = payload.email;
        const googleId = payload.sub; // This is the unique Google user ID
        const googleUsername = payload.name || payload.email.split('@')[0];

        // 1. Check if user already exists with this Google ID
        let user = await userService.findUserByGoogleId(googleId);

        if (user) {
            const jwtPayload: JwtPayload = {
                id: user.id,
                username: user.username
            };
            const appToken = jwt.sign(
                jwtPayload as object, // Explicit type assertion
                JWT_SECRET as jwt.Secret,
                { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
            );

            res.cookie('token', appToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 86400000 // 1 day in milliseconds
            });

            return res.status(200).json({
                message: 'Login successful via Google.',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    email_verified: user.email_verified,
                    has_password: !!user.password_hash, // Indicate if they have an app password
                    google_id: user.google_id // Ensure google_id is returned
                }
            });
        }

        // 2. User does not exist with this Google ID, check if email already registered
        user = await userService.findUserByEmail(googleEmail);

        if (user) {

            if (user.password_hash) { // User exists AND has a password (traditional account)
                return res.status(409).json({ // Conflict status
                    message: 'An account with this email already exists. Do you want to link it with your Google account?',
                    error: 'EMAIL_ALREADY_REGISTERED_WITH_PASSWORD',
                    user: { // Send back minimal info to help frontend
                        email: googleEmail,
                        username: user.username,
                        email_verified: user.email_verified,
                        has_password: !!user.password_hash, // Should be true
                        google_id: user.google_id // Should be null
                    }
                });
            } else { // User exists BUT NO password_hash (Google-only or other OAuth, but not yet linked)
                await userService.linkGoogleIdToUser(user.id, googleId);
                const jwtPayload: JwtPayload = {
                    id: user.id,
                    username: user.username,
                };
                const appToken = jwt.sign(
                    jwtPayload as object, // Explicit type assertion
                    JWT_SECRET as jwt.Secret,
                    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
                );

                res.cookie('token', appToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 86400000 // 1 day in milliseconds
                });

                return res.status(200).json({
                    message: 'Existing account found, linked with Google. You can now set an app password.',
                    action: 'SET_PASSWORD', // This action will redirect to /set-app-password
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        email_verified: true, // Mark as verified since Google confirmed
                        has_password: false, // Still false until they set it
                        google_id: googleId // Now linked
                    }
                });
            }
        }

        // 3. New user, create account and mark email as verified
        const newUser = await userService.createGoogleUser({
            username: googleUsername,
            email: googleEmail,
            googleId: googleId,
        });

        const jwtPayload: JwtPayload = {
            id: newUser.id,
            username: newUser.username,
        };
        const appToken = jwt.sign(
            jwtPayload as object, // Explicit type assertion
            JWT_SECRET as jwt.Secret,
            { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
        );

        res.cookie('token', appToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400000 // 1 day in milliseconds
        });

        return res.status(201).json({
            message: 'Google registration successful. Please set an app password for future logins.',
            action: 'SET_PASSWORD_ON_REGISTER',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                email_verified: newUser.email_verified, // This will be true
                has_password: false,
                google_id: newUser.google_id // Will be set
            }
        });

    } catch (error) {
        console.error('Google Sign-In error:', error);
        return res.status(500).json({ message: 'Google Sign-In failed due to a server error.' });
    }
};

export const setAppPassword = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || typeof req.user.id !== 'number') {
        return res.status(401).json({ message: 'Authentication required or invalid user ID.' });
    }

    const userId = req.user.id;
    const { password } = req.body;

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        return res.status(400).json({ message: 'Failed to set password', error: passwordValidation.message });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await userService.updateUserPassword(userId, hashedPassword);
        // After setting password, ensure the user object in the frontend context is updated
        const updatedUser = await userService.findUserById(userId);
        return res.status(200).json({
            message: 'App password set successfully.',
            user: updatedUser ? {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                email_verified: updatedUser.email_verified,
                has_password: !!updatedUser.password_hash,
                google_id: updatedUser.google_id
            } : undefined // Send updated user data
        });
    } catch (error) {
        console.error('Error setting app password:', error);
        return res.status(500).json({ message: 'Failed to set app password due to a server error.' });
    }
};

// New endpoint to link an existing account with Google
export const linkGoogleAccount = async (req: Request, res: Response) => {
    const { email, password, googleId, googleUsername } = req.body; // email and password from user, googleId from frontend state

    if (!email || !password || !googleId) {
        return res.status(400).json({ message: 'Email, password, and Google ID are required to link accounts.' });
    }

    try {
        const user = await userService.findUserByEmail(email);

        // 1. Verify if user exists and password is correct
        if (!user || !(user.password_hash && await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ message: 'Invalid credentials for existing account.' });
        }

        // 2. Check if the account is already linked to a different Google ID
        if (user.google_id && user.google_id !== googleId) {
            return res.status(409).json({ message: 'This account is already linked to a different Google account.' });
        }

        // 3. Link the Google ID to the existing account
        await userService.linkGoogleIdToUser(user.id, googleId);

        // 4. Generate JWT for the now-linked user
        const jwtPayload: JwtPayload = {
            id: user.id,
            username: user.username,
        };

        const appToken = jwt.sign(
            jwtPayload as object,
            JWT_SECRET as jwt.Secret,
            { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
        );

        res.cookie('token', appToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400000 // 1 day in milliseconds
        });

        return res.status(200).json({
            message: 'Google account successfully linked and logged in.',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                email_verified: true, // Mark as verified since Google confirmed and now linked
                has_password: true, // User confirmed with existing password
                google_id: googleId // Now linked
            }
        });

    } catch (error) {
        console.error('Error linking Google account:', error);
        return res.status(500).json({ message: 'Failed to link Google account due to a server error.' });
    }
};
