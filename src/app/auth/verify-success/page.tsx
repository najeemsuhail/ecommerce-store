'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';

export default function VerifySuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
  }, [token]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-light-theme rounded-lg shadow-lg p-6 lg:p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Email Verified</h1>
          <p className="text-slate-600 mb-6">Your email has been verified successfully.</p>
          <button
            onClick={() => router.push('/')}
            className="w-full btn-gradient-primary font-bold py-2"
          >
            Continue
          </button>
        </div>
      </div>
    </Layout>
  );
}
