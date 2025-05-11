'use client'

import { changePassword } from '@/actions/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>

export default function ChangePassword() {
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
    })

    const onSubmit = async (data: FormData) => {
        setError(null)
        setSuccess(null)
        setIsLoading(true)

        try {
            const result = await changePassword(data.currentPassword, data.newPassword)

            if (result.error) {
                setError(result.error)
            } else {
                setSuccess('Password changed successfully')
                reset() // Clear the form
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        Current Password
                    </label>
                    <input
                        type="password"
                        id="currentPassword"
                        {...register('currentPassword')}
                        className={`mt-1 block w-full rounded-md border ${errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                            } px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.currentPassword ? 'focus:ring-red-500' : 'focus:ring-gray-500'
                            }`}
                    />
                    {errors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        New Password
                    </label>
                    <input
                        type="password"
                        id="newPassword"
                        {...register('newPassword')}
                        className={`mt-1 block w-full rounded-md border ${errors.newPassword ? 'border-red-300' : 'border-gray-300'
                            } px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.newPassword ? 'focus:ring-red-500' : 'focus:ring-gray-500'
                            }`}
                    />
                    {errors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        {...register('confirmPassword')}
                        className={`mt-1 block w-full rounded-md border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                            } px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'focus:ring-red-500' : 'focus:ring-gray-500'
                            }`}
                    />
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="rounded-md bg-green-50 p-4">
                        <p className="text-sm text-green-700">{success}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {isLoading ? 'Changing Password...' : 'Change Password'}
                </button>
            </form>
        </div>
    )
} 