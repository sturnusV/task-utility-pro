import nodemailer from 'nodemailer';
import { APP_URL } from '../config/config';

// Define email configuration interface
interface EmailConfig {
  service: string;
  auth: {
    user: string;
    pass: string;
  };
}

// Get email configuration from environment variables
const getEmailConfig = (): EmailConfig => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    throw new Error('Email configuration is missing in environment variables');
  }

  return {
    service: process.env.EMAIL_SERVICE || 'Gmail',
    auth: { user, pass }
  };
};

// Create transporter with error handling
let transporter: nodemailer.Transporter;

try {
  transporter = nodemailer.createTransport(getEmailConfig());
} catch (error) {
  console.error('Failed to create email transporter:', error);
  throw new Error('Email service configuration failed');
}

// Generic email sending function
const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    await transporter.sendMail({
      from: `"Task Utility Pro" <${process.env.EMAIL_FROM || 'noreply@taskutilitypro.com'}>`,
      ...options
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

// Specific email functions
export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${APP_URL}/verify-email?token=${token}`;
  
  await sendEmail({
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #2563eb;">Email Verification</h2>
        <p>Please click the link below to verify your email address:</p>
        <p>
          <a href="${verificationUrl}" 
             style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
        </p>
        <p>Or copy this link to your browser:</p>
        <p style="word-break: break-all;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  
  await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #2563eb;">Password Reset</h2>
        <p>You requested a password reset. Click the button below to set a new password:</p>
        <p>
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p>Or copy this link to your browser:</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
  });
};

export { sendEmail };