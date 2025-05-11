"use client"
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Define the form schema with Zod
const formSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Type for our form data based on the schema
type FormData = z.infer<typeof formSchema>;

export default function ClientCredentialsSignIn() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Initialize React Hook Form with Zod resolver
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: FormData) => {
        setError(null);
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email: data.email.toLowerCase(),
                password: data.password,
                redirect: false,
                //redirectTo: "/dashboard"
            });

            if (result?.error) {
                if (result.error === "Configuration")
                    setError("Invalid credentials");
                else
                    setError(result.error);
            }
            else {
                router.push("/dashboard");
                router.refresh();
                return;
            }
        } catch (error) {
            console.error("An unexpected error occurred:", error);
            setError('An unexpected error occurred');
        }

        setLoading(false);
    };

    return (
        <div className="mx-auto">
            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-200">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        {...register('email')}
                        className={`w-full rounded-lg border ${errors.email ? 'border-red-300' : 'border-gray-300'} px-4 py-2 text-sm focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-300' : 'focus:ring-gray-300'}`}
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        {...register('password')}
                        className={`w-full rounded-lg border ${errors.password ? 'border-red-300' : 'border-gray-300'} px-4 py-2 text-sm focus:outline-none focus:ring-2 ${errors.password ? 'focus:ring-red-300' : 'focus:ring-gray-300'}`}
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                    )}
                </div>
                <div className="text-right">
                    <Link
                        href="/forgot-password"
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                    >
                        Forgot password?
                    </Link>
                </div>
                <button
                    disabled={loading}
                    type="submit"
                    className="w-full rounded-lg bg-gray-800 px-6 py-2 text-sm font-medium text-white shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                    {loading ? "Loading..." : "Sign in with Email"}
                </button>
            </form>
        </div>
    );
}