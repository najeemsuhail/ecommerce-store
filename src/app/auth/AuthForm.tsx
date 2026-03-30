'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            ux_mode?: 'popup';
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              width?: string | number;
              logo_alignment?: 'left' | 'center';
            }
          ) => void;
        };
      };
    };
  }
}

type AuthMode = 'signin' | 'signup';

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<AuthMode>('signin');
  const [otpSent, setOtpSent] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    name: '',
    phone: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleUiReady, setGoogleUiReady] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const completeLogin = (data: { token: string; user: unknown }) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    router.push(redirectUrl);
  };

  const handleGoogleLogin = async (credential: string) => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      const data = await response.json();

      if (!data.success) {
        setMessage(`Google login failed: ${data.error}`);
        return;
      }

      completeLogin(data);
    } catch {
      setMessage('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onGoogleCredential = useEffectEvent((credential: string) => {
    void handleGoogleLogin(credential);
  });

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) {
      setGoogleUiReady(false);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    const renderGoogleButton = () => {
      if (!window.google || !googleButtonRef.current) {
        setGoogleUiReady(false);
        return;
      }

      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          if (response.credential) {
            onGoogleCredential(response.credential);
          }
        },
        ux_mode: 'popup',
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        text: mode === 'signin' ? 'signin_with' : 'signup_with',
        width: '320',
        logo_alignment: 'left',
      });
      setGoogleUiReady(true);
    };

    if (existingScript) {
      if (window.google) {
        renderGoogleButton();
      } else {
        existingScript.addEventListener('load', renderGoogleButton, { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [googleClientId, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const resetFlow = (nextMode: AuthMode) => {
    setMode(nextMode);
    setOtpSent(false);
    setOtpEmail('');
    setMessage('');
    setFormData({
      email: '',
      otp: '',
      name: '',
      phone: '',
    });
  };

  const requestOtp = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          mode,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setMessage(data.error || 'Failed to send OTP.');
        return;
      }

      setOtpSent(true);
      setOtpEmail(formData.email);
      setMessage(`We sent a 6-digit code to ${formData.email}.`);
    } catch {
      setMessage('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    await requestOtp();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: otpEmail || formData.email,
          otp: formData.otp,
          name: formData.name,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setMessage(data.error || 'Failed to verify OTP.');
        return;
      }

      completeLogin(data);
    } catch {
      setMessage('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-start lg:items-center justify-center pt-8 lg:pt-0 px-4">
      <div className="w-full max-w-md">
        <div className="bg-light-theme rounded-lg shadow-lg p-6 lg:p-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-slate-800 mb-4 lg:mb-6">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>

          {message && (
            <div
              className={`p-4 rounded-lg mb-6 text-center font-semibold ${
                message.toLowerCase().includes('failed') ||
                message.toLowerCase().includes('invalid') ||
                message.toLowerCase().includes('required') ||
                message.toLowerCase().includes('too many') ||
                message.toLowerCase().includes('no account')
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {message}
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              {mode === 'signup' && (
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
                      className="theme-form-input"
                      placeholder="Enter your full name"
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
                  className="theme-form-input"
                  placeholder="Enter your email address"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-gradient-primary font-bold py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Please wait...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                Enter the 6-digit code sent to <strong>{otpEmail}</strong>.
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-slate-700 mb-2">
                  One-Time Password
                </label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  className="theme-form-input tracking-[0.4em] text-center"
                  placeholder="123456"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-gradient-primary font-bold py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Please wait...' : 'Verify OTP'}
              </button>

              <div className="flex items-center justify-between gap-4 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setFormData((current) => ({ ...current, otp: '' }));
                    setMessage('');
                  }}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Change email
                </button>
                <button
                  type="button"
                  onClick={() => void requestOtp()}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {googleClientId && (
            <>
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Or
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="flex justify-center min-h-11">
                <div ref={googleButtonRef} />
              </div>
              {!googleUiReady && (
                <p className="mt-3 text-center text-xs text-slate-500">
                  Loading Google sign-in...
                </p>
              )}
            </>
          )}

          {!googleClientId && (
            <>
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Or
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Google sign-in is not configured yet. Add{' '}
                <code className="font-semibold">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> and{' '}
                <code className="font-semibold">GOOGLE_CLIENT_ID</code> to your environment to show the button.
              </div>
            </>
          )}

          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => resetFlow(mode === 'signin' ? 'signup' : 'signin')}
                className="text-indigo-600 font-bold hover:underline"
              >
                {mode === 'signin' ? 'Register' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
