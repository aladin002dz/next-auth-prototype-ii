import { prisma } from '@/prisma/prisma'
import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { message: 'Email is required' },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        })

        if (!user) {
            // Return success even if user doesn't exist to prevent email enumeration
            return NextResponse.json(
                { message: 'If an account exists with this email, you will receive a password reset link' },
                { status: 200 }
            )
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

        // Send reset email using Resend
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
        await resend.emails.send({
            from: process.env.FROM_EMAIL ? `MaroStudio <${process.env.FROM_EMAIL}>` : 'MaroStudio <hello@marostudio.dev>',
            to: email,
            subject: 'Password Reset Request',
            html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset for your account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
        })

        return NextResponse.json(
            { message: 'If an account exists with this email, you will receive a password reset link' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Password reset request error:', error)
        return NextResponse.json(
            { message: 'Something went wrong' },
            { status: 500 }
        )
    }
} 