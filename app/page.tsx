import GoogleSignIn from "@/components/google-sign-in";
import GitHubSignIn from "@/components/github-sign-in";
import ClientCredentialsSignIn from "@/components/cred-signin-client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen p-4 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col items-center justify-center">
        <div className="w-full max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm text-black">
          <GoogleSignIn />
          <div className="mt-4">
            <GitHubSignIn />
          </div>
          <div className="w-full flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          <ClientCredentialsSignIn />
          <div className="mt-4 text-center text-sm">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className=" underline underline-offset-2 font-medium text-gray-800 hover:font-bold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
