'use server'

import { Resend } from 'resend';

export async function sendVerificationEmail(email: string, code: string) {
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const { data, error } = await resend.emails.send({
            from: process.env.FROM_EMAIL ? `MaroStudio <${process.env.FROM_EMAIL}>` : 'MaroStudio <hello@marostudio.dev>',
            to: email,
            subject: 'Verify your email address',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #333; margin-bottom: 20px;">Verify your email address</h1>
                    <p style="color: #666; line-height: 1.6;">Please use the following code to verify your email address:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 6px; display: inline-block;">
                            <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #4F46E5;">${code}</span>
                        </div>
                    </div>
                    <p style="color: #666; font-size: 14px;">This code will expire in 15 minutes.</p>
                    <p style="color: #666; font-size: 14px; margin-top: 20px;">If you didn't request this verification, please ignore this email.</p>
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
                        <p>This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            `,
        });

        if (error) {
            throw new Error(error.message);
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
}

export async function sendPasswordResetEmail(email: string, token: string) {
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

        const { data, error } = await resend.emails.send({
            from: process.env.FROM_EMAIL ? `MaroStudio <${process.env.FROM_EMAIL}>` : 'MaroStudio <hello@marostudio.dev>',
            to: email,
            subject: 'Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #333; margin-bottom: 20px;">Password Reset Request</h1>
                    <p style="color: #666; line-height: 1.6;">You requested a password reset for your account.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
                    <p style="color: #666; font-size: 14px; margin-top: 20px;">If you didn&apos;t request this, please ignore this email.</p>
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
                        <p>This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            `,
        });

        if (error) {
            throw new Error(error.message);
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
} 