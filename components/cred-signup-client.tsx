"use client"
import { registerUser } from '@/app/actions/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from "next/navigation";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Define the form schema with Zod
const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

// Type for our form data based on the schema
type FormData = z.infer<typeof formSchema>;

export default function ClientCredentialsSignUp() {
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
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: FormData) => {
        setError(null);
        setLoading(true);

        try {
            // Use the server action to register the user
            const result = await registerUser(data);

            if (result.error) {
                setError(result.error);
            } else {
                // Show verification message
                //setError("Please check your email to verify your account before signing in.");
                const signInResult = await signIn("credentials", {
                    email: data.email,
                    password: data.password,
                    redirect: false,
                });

                if (signInResult?.error) {
                    setError(signInResult.error);
                } else {
                    router.push("/dashboard");
                    router.refresh();
                    return;
                }
            }
        } catch (error: unknown) {
            console.error("An error occurred during registration:", error);
            setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        }

        setLoading(false);
    };

    return (
        <div>
            {error && (
                <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded-lg border border-red-200">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                    </label>
                    <input
                        type="text"
                        placeholder="Enter your full name"
                        {...register('name')}
                        className={`w-full rounded-lg border ${errors.name ? 'border-red-300' : 'border-gray-300'} px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 ${errors.name ? 'focus:ring-red-300' : 'focus:ring-gray-300'}`}
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        {...register('email')}
                        className={`w-full rounded-lg border ${errors.email ? 'border-red-300' : 'border-gray-300'} px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-300' : 'focus:ring-gray-300'}`}
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
                        placeholder="Create a password (min. 8 characters)"
                        {...register('password')}
                        className={`w-full rounded-lg border ${errors.password ? 'border-red-300' : 'border-gray-300'} px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 ${errors.password ? 'focus:ring-red-300' : 'focus:ring-gray-300'}`}
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
                        type="password"
                        placeholder="Confirm your password"
                        {...register('confirmPassword')}
                        className={`w-full rounded-lg border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'focus:ring-red-300' : 'focus:ring-gray-300'}`}
                    />
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                    )}
                </div>
                <button
                    disabled={loading}
                    type="submit"
                    className="w-full rounded-lg bg-gray-800 px-6 py-2 text-sm font-medium text-white shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-70"
                >
                    {loading ? "Processing..." : "Sign up"}
                </button>
            </form>
        </div>
    );
}
