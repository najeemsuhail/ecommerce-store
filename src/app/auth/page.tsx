import { Suspense } from 'react';
import Layout from '@/components/Layout';
import AuthForm from './AuthForm';

export default function AuthPage() {
  return (
    <Layout>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <AuthForm />
      </Suspense>
    </Layout>
  );
}