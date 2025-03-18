"use client"
import { useState, ChangeEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from "next/navigation"

export default function ClientCredentialsSignIn() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState({ email: 'aurore@domain.com', password: '12345678' });
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const result = await signIn("credentials", {
                email: data.email,
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
                router.push("/dashboard")
                router.refresh()
                return
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
            <form onSubmit={handleSubmit} className="space-y-4">
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
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
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
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
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