import Link from 'next/link';
import Layout from '@/components/Layout';

export default function VerifyFailedPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-light-theme rounded-lg shadow-lg p-6 lg:p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Verification Failed</h1>
          <p className="text-slate-600 mb-6">
            This verification link is invalid or expired. Please sign up again to receive a new one.
          </p>
          <Link href="/auth" className="inline-block w-full btn-gradient-primary font-bold py-2">
            Go to Sign In / Sign Up
          </Link>
        </div>
      </div>
    </Layout>
  );
}
