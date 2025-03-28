import { verifyToken } from '@/lib/verification-token';

export default async function VerifyEmailPage({
    searchParams,
}: {
    searchParams: { token: string };
}) {
    const { token } = searchParams;

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Invalid Verification Link</h1>
                    <p className="mt-2 text-gray-600">The verification link is invalid or has expired.</p>
                </div>
            </div>
        );
    }

    const email = await verifyToken(token);

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Verification Failed</h1>
                    <p className="mt-2 text-gray-600">The verification link has expired or is invalid.</p>
                </div>
            </div>
        );
    }

    //redirect('/dashboard?verified=true');
} 