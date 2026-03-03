import { Suspense } from 'react';
import VerifySuccessClient from './VerifySuccessClient';
import Layout from '@/components/Layout';

export default function VerifySuccessPage() {
  return (
    <Layout>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <VerifySuccessClient />
      </Suspense>
    </Layout>
  );
}
