import { Suspense } from 'react';
import Layout from '@/components/Layout';
import ResetPasswordClient from './ResetPasswordClient';

export default function ResetPasswordPage() {
  return (
    <Layout>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <ResetPasswordClient />
      </Suspense>
    </Layout>
  );
}
