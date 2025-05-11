'use client'

import { resetPassword } from '@/app/actions/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Define the form schema with Zod
const formSchema = z.object({
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

// Type for our form data based on the schema
type FormData = z.infer<typeof formSchema>

export default function ResetPassword() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const [successMessage, setSuccessMessage] = useState('')

    // Initialize React Hook Form with Zod resolver
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    })

    const onSubmit = async (data: FormData) => {
        if (!token) return

        try {
            const result = await resetPassword(token, data.password)

            if (result.error) {
                throw new Error(result.error)
            }

            setSuccessMessage('Password has been reset successfully! Redirecting...')

            // Wait for 2 seconds to show the success message before redirecting
            setTimeout(() => {
                router.push('/?message=Password has been reset successfully')
            }, 2000)
        } catch (err) {
            throw err
        }
    }

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Invalid Reset Link
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            The password reset link is invalid or has expired.
                        </p>
                        <div className="mt-4">
                            <Link
                                href="/forgot-password"
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Request a new reset link
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Set new password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Please enter your new password below.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                {...register('password')}
                                className={`w-full rounded-lg border ${errors.password ? 'border-red-300' : 'border-gray-300'} px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 ${errors.password ? 'focus:ring-red-300' : 'focus:ring-gray-300'}`}
                                placeholder="Enter your new password"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <input
                                id="confirm-password"
                                type="password"
                                {...register('confirmPassword')}
                                className={`w-full rounded-lg border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'focus:ring-red-300' : 'focus:ring-gray-300'}`}
                                placeholder="Confirm your new password"
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                            )}
                        </div>
                    </div>

                    {successMessage && (
                        <div className="p-3 text-sm text-green-500 bg-green-50 rounded-lg border border-green-200">
                            {successMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-gray-800 px-6 py-2 text-sm font-medium text-white shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-70"
                    >
                        {isSubmitting ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    )
} 