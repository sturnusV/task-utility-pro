// src/controllers/verificationController.ts
import { Request, Response } from 'express';
import * as verificationService from '../services/verificationService';
import * as userService from '../services/userService'; // Assuming you need this to find user for resend
import { generateVerificationToken } from '../services/verificationService'; // For resending token
import { sendVerificationEmail } from '../utils/emailSender'; // For sending email
import { resendVerificationToken } from '../services/verificationService';

/**
 * Handles email verification when a user clicks the link in their email.
 * GET /api/verify-email?token=<token>
 */
export const verifyEmail = async (req: Request, res: Response) => {
    try {
        let { token } = req.query;
        if (!token) return res.status(400).json({ error: "Token required" });

        token = token.toString().trim();
        await verificationService.verifyUserEmail(token);

        // Successful verification
        return res.json({
            verified: true,
            message: "Email verified successfully"
        });

    } catch (error: any) {
        // Special case: Already verified
        if (error.message.includes("already verified")) {
            return res.json({
                verified: true,
                message: "Email was already verified"
            });
        }

        // All other errors
        return res.status(400).json({
            verified: false,
            error: error.message
        });
    }
};

/**
 * Handles requesting a new verification email.
 * POST /api/resend-verification
 */

export const resendVerificationEmail = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        await resendVerificationToken(email);

        return res.status(200).json({
            message:
                'If an account with that email exists and is not verified, a verification email has been sent.'
        });
    } catch (error: any) {
        if (error.message === 'Email already verified') {
            return res.status(400).json({ message: 'Your email is already verified. Please log in.' });
        }

        console.error('Resend verification error:', error);
        return res.status(500).json({ message: 'Server error while resending verification email.' });
    }
};