'use server'

import { createVerificationToken } from '@/lib/verification-token'
import { prisma } from '@/prisma/prisma'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { sendPasswordResetEmail, sendVerificationEmail } from './email'

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

export async function resetPassword(token: string, password: string) {
  try {
    if (!token || !password) {
      return { error: 'Token and password are required' }
    }

    // Find valid verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        expires: {
          gt: new Date(), // Token hasn't expired
        },
      },
    })

    if (!verificationToken) {
      return { error: 'Invalid or expired reset token' }
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    })

    if (!user) {
      return { error: 'User not found' }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    })

    // Delete the used verification token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        },
      },
    })

    return { success: true, message: 'Password has been reset successfully' }
  } catch (error) {
    console.error('Password reset error:', error)
    return { error: 'Something went wrong' }
  }
}

export async function requestPasswordReset(email: string) {
  try {
    if (!email) {
      return { error: 'Email is required' }
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return {
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link'
      }
    }

    // Generate reset token
    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600000) // 1 hour from now

    // Store reset token in VerificationToken table
    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        expires,
      },
    })

    // Send reset email
    await sendPasswordResetEmail(email.toLowerCase(), token)

    return {
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link'
    }
  } catch (error) {
    console.error('Password reset request error:', error)
    return { error: 'Something went wrong' }
  }
}
