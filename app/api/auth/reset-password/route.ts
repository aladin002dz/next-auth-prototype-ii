import { prisma } from '@/prisma/prisma'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json()

        if (!token || !password) {
            return NextResponse.json(
                { message: 'Token and password are required' },
                { status: 400 }
            )
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
            return NextResponse.json(
                { message: 'Invalid or expired reset token' },
                { status: 400 }
            )
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: verificationToken.identifier },
        })

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 400 }
            )
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

        return NextResponse.json(
            { message: 'Password has been reset successfully' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Password reset error:', error)
        return NextResponse.json(
            { message: 'Something went wrong' },
            { status: 500 }
        )
    }
} 