import { prisma } from '@/prisma/prisma';

export async function createVerificationToken(email: string) {
    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.verificationToken.create({
        data: {
            identifier: email,
            token: code,
            expires,
        },
    });

    return code;
}

export async function verifyToken(code: string) {
    const verificationToken = await prisma.verificationToken.findFirst({
        where: {
            token: code,
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