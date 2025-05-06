'use server'

import { createVerificationToken } from '@/lib/verification-token'
import { prisma } from '@/prisma/prisma'
import bcrypt from 'bcryptjs'
import { Resend } from 'resend'

// Disable Edge runtime for Prisma compatibility
//export const runtime = 'nodejs'

export async function registerUser(formData: {
  name: string
  email: string
  password: string
  confirmPassword: string
}) {
  try {
    // Validate input
    if (!formData.email || !formData.password) {
      return { error: 'Email and password are required' }
    }

    if (formData.password !== formData.confirmPassword) {
      return { error: 'Passwords do not match' }
    }

    if (formData.password.length < 8) {
      return { error: 'Password must be at least 8 characters long' }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: formData.email.toLowerCase() },
    })

    if (existingUser) {
      return { error: 'User with this email already exists' }
    }

    // Hash the password with bcryptjs
    const hashedPassword = await bcrypt.hash(formData.password, 10)

    // Create the user
    const user = await prisma.user.create({
      data: {
        name: formData.name,
        email: formData.email.toLowerCase(),
        password: hashedPassword,
        emailVerified: null, // Set to null initially
      },
    })

    // Create verification token
    const token = await createVerificationToken(formData.email)

    // Send verification email
    try {
      await sendVerificationEmail(formData.email.toLowerCase(), token);
    } catch (error) {
      console.error('Error sending verification email:', error);
      return { error: 'Failed to send verification email' };
    }

    // Return success
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email.toLowerCase(),
        emailVerified: user.emailVerified
      }
    }
  } catch (error) {
    console.error('Registration error:', error)
    return { error: 'An error occurred during registration' }
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL ? `MaroStudio <${process.env.FROM_EMAIL}>` : 'MaroStudio <hello@marostudio.dev>',
      to: email,
      subject: 'Verify your email address',
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #333; margin-bottom: 20px;">Verify your email address</h1>
                    <p style="color: #666; line-height: 1.6;">Click the button below to verify your email address:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" 
                           style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Verify Email
                        </a>
                    </div>
                    <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
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
