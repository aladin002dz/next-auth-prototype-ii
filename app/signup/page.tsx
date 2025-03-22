import ClientCredentialsSignUp from '@/components/cred-signup-client';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen p-4 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col items-center justify-center">
        <div className="w-full max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm text-black">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold">Create an Account</h1>
            <p className="mt-2 text-sm text-gray-600">
              Sign up to get access to the dashboard
            </p>
          </div>
          
          <ClientCredentialsSignUp />
          
          <div className="mt-4 text-center text-sm">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/" className="underline underline-offset-2 font-medium text-gray-800 hover:font-bold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
