import { signIn } from "@/auth"
import { CallbackRouteError } from "@auth/core/errors"
import { redirect } from "next/navigation"

export default function ServerCredentialsSignIn() {
    async function handleSignIn(formData: FormData) {
        "use server"
        try {
            await signIn("credentials", {
                email: formData.get("email"),
                password: formData.get("password"),
                redirect: true,
                redirectTo: "/dashboard"
            })
        } catch (error) {
            let errorMessage = "An unexpected error occurred"
            if (error instanceof CallbackRouteError) {
                errorMessage = error?.cause?.err?.message || "An unexpected error occurred";
                redirect("/?source=server_credentials&error=" + encodeURIComponent(errorMessage));
            }

        }


    }

    return (
        <form
            action={handleSignIn}
            className="w-full space-y-4"
        >
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Email
                    <input
                        name="email"
                        type="email"
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                        required
                        defaultValue="aurore@domain.com"
                    />
                </label>
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Password
                    <input
                        name="password"
                        type="password"
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                        required
                        defaultValue="12345678"
                    />
                </label>
            </div>
            <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 rounded-lg bg-white px-6 py-2 text-sm font-medium text-gray-800 shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 border border-gray-300"
            >
                Sign in with Email
            </button>
        </form>
    )
}