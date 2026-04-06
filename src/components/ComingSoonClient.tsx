'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { PublicStoreSettings } from '@/lib/storeSettings';

type Props = {
  settings: PublicStoreSettings;
};

export default function ComingSoonClient({ settings }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const contactHref = settings.contactEmail ? `mailto:${settings.contactEmail}` : '/contact';
  const primarySocial = settings.socialLinks[0];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('submitting');
    setMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join the waitlist.');
      }

      setStatus('success');
      setMessage(data.message || 'You are on the list. We will notify you when we launch.');
      setEmail('');
    } catch (error: unknown) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to join the waitlist.');
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f1e8] text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,122,52,0.24),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(18,58,53,0.18),transparent_22%),linear-gradient(135deg,#f7f1e8_0%,#f3e8d3_45%,#efe0c5_100%)]" />
      <div className="absolute left-[-8rem] top-20 h-64 w-64 rounded-full bg-[#123a35]/10 blur-3xl" />
      <div className="absolute bottom-10 right-[-5rem] h-72 w-72 rounded-full bg-[#c97a34]/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#123a35]/70">
              Launching Soon
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-[0.02em] text-[#123a35] sm:text-3xl">
              {settings.storeName}
            </h1>
          </div>
          <Link
            href={contactHref}
            className="inline-flex items-center rounded-full border border-[#123a35]/20 bg-white/70 px-4 py-2 text-sm font-semibold text-[#123a35] backdrop-blur transition hover:border-[#123a35]/40 hover:bg-white"
          >
            Contact Us
          </Link>
        </header>

        <section className="flex flex-1 items-center py-10 sm:py-14 lg:py-20">
          <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full border border-[#c97a34]/20 bg-white/65 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-[#c97a34] shadow-sm backdrop-blur">
                New storefront in progress
              </div>

              <h2 className="mt-6 max-w-3xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.04em] text-[#123a35] sm:text-6xl lg:text-7xl">
                We&rsquo;re building something worth the wait.
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">
                {settings.seoDescription ||
                  `${settings.storeName} is getting ready to launch. Join the waitlist and we will let you know when the site goes live.`}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.75rem] border border-white/60 bg-white/70 p-5 shadow-[0_18px_40px_rgba(18,58,53,0.08)] backdrop-blur">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#123a35]/55">Status</p>
                  <p className="mt-3 text-xl font-bold text-[#123a35]">Coming Soon</p>
                </div>
                <div className="rounded-[1.75rem] border border-white/60 bg-white/70 p-5 shadow-[0_18px_40px_rgba(18,58,53,0.08)] backdrop-blur">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#123a35]/55">Access</p>
                  <p className="mt-3 text-xl font-bold text-[#123a35]">Waitlist Open</p>
                </div>
                <div className="rounded-[1.75rem] border border-white/60 bg-white/70 p-5 shadow-[0_18px_40px_rgba(18,58,53,0.08)] backdrop-blur">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#123a35]/55">Updates</p>
                  <p className="mt-3 text-xl font-bold text-[#123a35]">Email First</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,248,240,0.74))] p-6 shadow-[0_30px_80px_rgba(18,58,53,0.14)] backdrop-blur sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#c97a34]">Waitlist</p>
                  <h3 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[#123a35]">
                    Be first through the door
                  </h3>
                </div>
                <div className="rounded-full border border-[#123a35]/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#123a35]/65">
                  Early access
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-700">
                Leave your email and we&rsquo;ll send the launch update, first-release drops, and opening offers.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <label htmlFor="waitlist-email" className="block text-sm font-semibold text-[#123a35]">
                  Email address
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-[#123a35]/15 bg-white px-5 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#c97a34] focus:ring-4 focus:ring-[#c97a34]/15"
                />
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full rounded-2xl bg-[#123a35] px-5 py-4 text-base font-bold text-white transition hover:bg-[#0d2b27] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === 'submitting' ? 'Joining waitlist...' : 'Notify me at launch'}
                </button>
              </form>

              {message && (
                <div
                  className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                    status === 'success'
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-red-300 bg-red-50 text-red-800'
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="mt-8 grid gap-4 border-t border-[#123a35]/10 pt-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#123a35]/55">Email</p>
                  <a
                    href={contactHref}
                    className="mt-2 inline-block text-sm font-semibold text-[#123a35] transition hover:text-[#c97a34]"
                  >
                    {settings.contactEmail || 'Reach the team'}
                  </a>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#123a35]/55">Follow</p>
                  {primarySocial ? (
                    <a
                      href={primarySocial.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm font-semibold text-[#123a35] transition hover:text-[#c97a34]"
                    >
                      {primarySocial.label}
                    </a>
                  ) : (
                    <span className="mt-2 inline-block text-sm text-slate-600">Updates coming here soon</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
