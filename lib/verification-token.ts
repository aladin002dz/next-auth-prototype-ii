import { prisma } from '@/prisma/prisma';
import crypto from 'crypto';

export async function createVerificationToken(email: string) {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires,
        },
    });

    return token;
}

export async function verifyToken(token: string) {
    const verificationToken = await prisma.verificationToken.findFirst({
        where: {
            token,
            expires: {
                gt: new Date(),
            },
        },
    });

    if (!verificationToken) {
        return null;
    }

    // Update user's email verification status
    await prisma.user.update({
        where: {
            email: verificationToken.identifier,
        },
        data: {
            emailVerified: new Date(),
        },
    });

    // Delete the used token
    await prisma.verificationToken.delete({
        where: {
            identifier_token: {
                identifier: verificationToken.identifier,
                token: verificationToken.token,
            },
        },
    });

    return verificationToken.identifier;
} 