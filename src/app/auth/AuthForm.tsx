'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const [isLogin, setIsLogin] = useState(true);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });
  // Forgot/reset password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
    // Handle forgot password submit
    const handleForgotSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setForgotLoading(true);
      setForgotMessage('');
      try {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: forgotEmail }),
        });
        const data = await response.json();
        if (data.success) {
          setForgotMessage('✅ If the email exists, a reset link will be sent.');
        } else {
          setForgotMessage(`❌ ${data.error}`);
        }
      } catch (error) {
        setForgotMessage('❌ Failed to send reset link.');
      } finally {
        setForgotLoading(false);
      }
    };

    // Handle reset password submit
    const handleResetSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setResetLoading(true);
      setResetMessage('');
      if (resetPassword !== resetConfirm) {
        setResetMessage('❌ Passwords do not match');
        setResetLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: resetToken, newPassword: resetPassword }),
        });
        const data = await response.json();
        if (data.success) {
          setResetMessage('✅ Password has been reset. You can now log in.');
        } else {
          setResetMessage(`❌ ${data.error}`);
        }
      } catch (error) {
        setResetMessage('❌ Failed to reset password.');
      } finally {
        setResetLoading(false);
      }
    };
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        if (!isLogin && !data.token) {
          // Registration successful but needs email verification
          setShowVerificationMessage(true);
          setVerificationEmail(formData.email);
          setFormData({ email: '', password: '', name: '', phone: '' });
          setMessage('');
          return;
        }

        // Login or already verified registration
        setToken(data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push(redirectUrl);
        return;
      } else {
        // Handle email not verified error
        if (data.code === 'EMAIL_NOT_VERIFIED') {
          setMessage(`⚠️ ${data.error}`);
        } else {
          setMessage(`❌ ${data.error}`);
        }
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  if (showVerificationMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-light-theme rounded-lg shadow-lg p-6 lg:p-8 text-center">
            <div className="mb-4 text-4xl">📧</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Verify Your Email</h2>
            <p className="text-slate-600 mb-4">
              We've sent a verification link to <strong>{verificationEmail}</strong>
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Please check your email and click the verification link to activate your account. The link will expire in 24 hours.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-blue-900 mb-2">💡 Tips:</p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Check your spam/junk folder if you don't see the email</li>
                <li>The link will redirect you back here and log you in</li>
                <li>Need a new link? Just register again with the same email</li>
              </ul>
            </div>
            <button
              onClick={() => {
                setShowVerificationMessage(false);
                setIsLogin(true);
              }}
              className="w-full text-indigo-600 font-bold hover:underline"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Forgot password UI
  if (showForgot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md mt-16 md:mt-24">
          <div className="bg-light-theme rounded-lg shadow-lg p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Forgot Password</h2>
            {forgotMessage && (
              <div className={`p-4 rounded-lg mb-6 text-center font-semibold ${
                forgotMessage.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                {forgotMessage}
              </div>
            )}
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  id="forgot-email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="Enter your email"
                />
              </div>
              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full btn-gradient-primary font-bold py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {forgotLoading ? 'Please wait...' : 'Send Reset Link'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <button
                onClick={() => { setShowForgot(false); setForgotMessage(''); }}
                className="text-indigo-600 font-bold hover:underline"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reset password UI
  if (showReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-light-theme rounded-lg shadow-lg p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Reset Password</h2>
            {resetMessage && (
              <div className={`p-4 rounded-lg mb-6 text-center font-semibold ${
                resetMessage.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                {resetMessage}
              </div>
            )}
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label htmlFor="reset-token" className="block text-sm font-semibold text-slate-700 mb-2">Reset Token</label>
                <input
                  type="text"
                  id="reset-token"
                  value={resetToken}
                  onChange={e => setResetToken(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="Paste the token from your email"
                />
              </div>
              <div>
                <label htmlFor="reset-password" className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                <input
                  type="password"
                  id="reset-password"
                  value={resetPassword}
                  onChange={e => setResetPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label htmlFor="reset-confirm" className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  id="reset-confirm"
                  value={resetConfirm}
                  onChange={e => setResetConfirm(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="Confirm new password"
                />
              </div>
              <button
                type="submit"
                disabled={resetLoading}
                className="w-full btn-gradient-primary font-bold py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetLoading ? 'Please wait...' : 'Reset Password'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <button
                onClick={() => { setShowReset(false); setResetMessage(''); }}
                className="text-indigo-600 font-bold hover:underline"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main login/register UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-start lg:items-center justify-center pt-8 lg:pt-0 px-4">
      <div className="w-full max-w-md">
        <div className="bg-light-theme rounded-lg shadow-lg p-6 lg:p-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-slate-800 mb-4 lg:mb-6">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          {message && (
            <div className={`p-4 rounded-lg mb-6 text-center font-semibold ${
              message.includes('❌')
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    placeholder="Kani Malar"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    placeholder="+91 9234567890"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                placeholder="kanimalar@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                placeholder="**********"
              />
            </div>

            {/* Forgot password link */}
            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setShowForgot(true); setForgotEmail(formData.email); setForgotMessage(''); }}
                  className="text-indigo-600 text-sm font-bold hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient-primary font-bold py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ email: '', password: '', name: '', phone: '' });
                  setMessage('');
                }}
                className="text-indigo-600 font-bold hover:underline"
              >
                {isLogin ? 'Register' : 'Login'}
              </button>
            </p>
            {/* Optionally, show a link to reset password UI directly */}
            {/* <button onClick={() => setShowReset(true)} className="text-xs text-indigo-500 mt-2">Have a reset token?</button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
