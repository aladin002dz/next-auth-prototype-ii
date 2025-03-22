import ClientCredentialsSignUp from '@/components/cred-signup-client';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign up to get access to the dashboard
          </p>
        </div>
        
        <ClientCredentialsSignUp />
        
        <div className="text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/" className="font-medium text-gray-800 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
