'use client';

import { resendVerificationCode, verifyEmailCode } from '@/actions/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface EmailVerificationFormProps {
    email: string;
}

export default function EmailVerificationForm({ email }: EmailVerificationFormProps) {
    const router = useRouter();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await verifyEmailCode(code);
            if (result.success) {
                setSuccess('Email verified successfully!');
                router.refresh(); // Refresh the page to update the verification status
            } else {
                setError(result.error || 'Invalid or expired verification code');
            }
        } catch (err: unknown) {
            console.error('Verification error:', err);
            setError('An error occurred during verification');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        setIsResending(true);
        setError('');
        setSuccess('');

        try {
            const result = await resendVerificationCode(email);
            if (result.success) {
                setSuccess('A new verification code has been sent to your email');
            } else {
                setError(result.error || 'Failed to send new verification code');
            }
        } catch (err: unknown) {
            console.error('Error resending code:', err);
            setError('Failed to send new verification code');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="text-sm font-medium text-yellow-800">Email Verification Required</h3>
            <p className="mt-1 text-sm text-yellow-700">
                Please enter the 6-digit verification code sent to your email
            </p>
            <form onSubmit={handleSubmit} className="mt-3 space-y-3">
                <div>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                        maxLength={6}
                        pattern="[0-9]{6}"
                        required
                        className="block w-full rounded-md border border-yellow-300 px-3 py-2 text-sm placeholder-yellow-400 focus:border-yellow-500 focus:outline-none focus:ring-yellow-500"
                        placeholder="Enter 6-digit code"
                    />
                </div>
                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}
                {success && (
                    <p className="text-sm text-green-600">{success}</p>
                )}
                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 rounded-md bg-yellow-600 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {isLoading ? 'Verifying...' : 'Verify Email'}
                    </button>
                    <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={isResending}
                        className="flex-1 rounded-md bg-white px-3 py-2 text-sm font-medium text-yellow-600 border border-yellow-300 hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {isResending ? 'Sending...' : 'Resend Code'}
                    </button>
                </div>
            </form>
        </div>
    );
} 