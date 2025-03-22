"use client"
import { useState, ChangeEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from "next/navigation"
import { registerUser } from '@/app/actions/auth';

export default function ClientCredentialsSignUp() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        confirmPassword: '' 
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form data
        if (data.password !== data.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        
        if (data.password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        setError(null);
        setLoading(true);
        
        try {
            // Use the server action to register the user
            const result = await registerUser(data);

            if (result.error) {
                setError(result.error);
            } else {
                // If registration is successful, sign in the user
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
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={data.name}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={data.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
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
