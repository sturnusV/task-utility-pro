import { Request, Response } from 'express';
import * as passwordResetService from '../services/passwordResetService';
import { sendPasswordResetEmail } from '../utils/emailSender';
import { validatePassword } from '../utils/validation';

export const requestReset = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        const token = await passwordResetService.generatePasswordResetToken(email);

        if (token) {
            await sendPasswordResetEmail(email, token);
        }

        // Security: Always return success to prevent email enumeration
        res.json({
            success: true,
            message: 'If the email exists, a reset link has been sent'
        });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    try {
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                success: false,
                message: passwordValidation.message
            });
        }

        const success = await passwordResetService.resetPassword(token, newPassword);

        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error: any) {
        console.error('Password reset error:', error);

        const status = error.message.includes('expired') ||
            error.message.includes('Invalid') ? 400 : 500;

        res.status(status).json({
            success: false,
            message: error.message || 'Password reset failed'
        });
    }
};