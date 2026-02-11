'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';

export default function Unsubscribe() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter a valid email');
      return;
    }

    setStatus('loading');
    
    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unsubscribe');
      }

      setStatus('success');
      setMessage(data.message);
      setEmail('');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to unsubscribe. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-16 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">Manage Subscription</h1>
            <p className="text-lg text-slate-600">
              We're sorry to see you go! You can unsubscribe from our newsletter below.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
            {status === 'success' ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Unsubscribed Successfully</h2>
                  <p className="text-slate-600">
                    We've removed <span className="font-semibold">{email}</span> from our newsletter. 
                    You won't receive any more promotional emails from us.
                  </p>
                </div>
                <p className="text-sm text-slate-500">
                  You can always resubscribe by visiting our website footer.
                </p>
                <Link 
                  href="/"
                  className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Return Home
                </Link>
              </div>
            ) : (
              <form onSubmit={handleUnsubscribe} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-3">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={status === 'loading'}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="your.email@example.com"
                  />
                </div>

                {message && (
                  <div className={`p-4 rounded-lg ${
                    status === 'error' 
                      ? 'bg-red-50 border border-red-200 text-red-800' 
                      : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                  }`}>
                    <p className="text-sm font-medium">{message}</p>
                  </div>
                )}

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold">Note:</span> Once you unsubscribe, you will no longer receive newsletters and promotional emails from us. You can resubscribe anytime from our website.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Processing...' : 'Confirm Unsubscribe'}
                </button>

                <p className="text-sm text-center text-slate-600">
                  Changed your mind?{' '}
                  <Link href="/" className="text-blue-600 hover:underline font-semibold">
                    Go back to our store
                  </Link>
                </p>
              </form>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-3">Why unsubscribe?</h3>
              <p className="text-sm text-slate-600">
                If you're receiving too many emails or are no longer interested in our products, we understand! You can easily unsubscribe here.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-3">Still have questions?</h3>
              <p className="text-sm text-slate-600">
                Have concerns or feedback? Feel free to{' '}
                <Link href="/contact" className="text-blue-600 hover:underline font-semibold">
                  contact us
                </Link>
                {' '}anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
