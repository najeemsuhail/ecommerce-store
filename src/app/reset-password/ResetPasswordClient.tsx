'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromQuery = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tokenFromQuery) {
      setToken(tokenFromQuery);
    }
  }, [tokenFromQuery]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token) {
      setIsError(true);
      setMessage('Reset token is missing. Please use the link from your email.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        setIsError(false);
        setMessage('Password reset successful. You can now sign in.');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => router.push('/auth'), 1200);
      } else {
        setIsError(true);
        setMessage(data.error || 'Failed to reset password.');
      }
    } catch {
      setIsError(true);
      setMessage('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-light-theme rounded-lg shadow-lg p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">Reset Password</h1>

        {message && (
          <div className={`mb-4 rounded-lg p-3 text-sm font-semibold ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="token" className="block text-sm font-semibold text-slate-700 mb-2">Reset Token</label>
            <input
              id="token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Token from your email"
              className="theme-form-input"
              required
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="theme-form-input"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="theme-form-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gradient-primary font-bold py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
