'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CURRENCY_CONFIG } from '@/lib/currency';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';

const socialIcons = {
  facebook: faFacebook,
  instagram: faInstagram,
} as const;

export default function Footer() {
  const { footerDescription, socialLinks, footerHighlights, logoUrl, storeName } = useStoreSettings();
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subscribeMessage, setSubscribeMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setSubscribeStatus('error');
      setSubscribeMessage('Please enter a valid email');
      return;
    }

    setSubscribeStatus('loading');

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
        throw new Error(data.error || 'Failed to subscribe');
      }

      setSubscribeStatus('success');
      setSubscribeMessage('Successfully subscribed! Check your email.');
      setEmail('');

      setTimeout(() => {
        setSubscribeStatus('idle');
        setSubscribeMessage('');
      }, 3000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to subscribe. Please try again.';
      setSubscribeStatus('error');
      setSubscribeMessage(message);

      setTimeout(() => {
        setSubscribeStatus('idle');
        setSubscribeMessage('');
      }, 3000);
    }
  };

  const highlightItems = footerHighlights.map((item) => ({
    ...item,
    description: item.description.replace('Rs.', CURRENCY_CONFIG.symbol),
  }));

  return (
    <footer className="theme-footer mt-auto border-t border-[color-mix(in_srgb,var(--primary)_18%,white)] py-16 text-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-5">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image src={logoUrl} alt={`${storeName} logo`} width={200} height={80} className="rounded-lg" unoptimized />
            </Link>
            <p className="text-sm leading-relaxed text-white/75">{footerDescription}</p>
            <div className="flex gap-3 pt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  className="theme-social-link flex h-10 w-10 items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon
                    icon={socialIcons[social.platform as keyof typeof socialIcons] ?? faInstagram}
                    className="h-5 w-5 text-white"
                  />
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-2 border-t border-[color-mix(in_srgb,var(--primary)_22%,white)] pt-4 text-xs text-white/60">
              <Link href="/unsubscribe" className="transition hover:text-primary-theme">
                Manage Newsletter
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-lg font-bold text-white">Products</h3>
            <ul className="space-y-3">
              <li><Link href="/products" className="font-medium text-white/75 transition hover:text-primary-theme">All Products</Link></li>
              <li><Link href="/products?isFeatured=true" className="font-medium text-white/75 transition hover:text-primary-theme">Featured</Link></li>
              <li><Link href="/products?category=sales" className="font-medium text-white/75 transition hover:text-primary-theme">On Sale</Link></li>
              <li><Link href="/products?sort=new" className="font-medium text-white/75 transition hover:text-primary-theme">New Arrivals</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-lg font-bold text-white">Support</h3>
            <ul className="space-y-3">
              <li><Link href="/contact" className="font-medium text-white/75 transition hover:text-primary-theme">Contact Us</Link></li>
              <li><Link href="/faq" className="font-medium text-white/75 transition hover:text-primary-theme">FAQs</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-lg font-bold text-white">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="font-medium text-white/75 transition hover:text-primary-theme">About Us</Link></li>
              <li><Link href="/blog" className="font-medium text-white/75 transition hover:text-primary-theme">Blog</Link></li>
            </ul>
          </div>

          <div className="min-w-0 md:col-span-2 lg:col-span-1" suppressHydrationWarning>
            <h3 className="mb-6 text-lg font-bold text-white">Subscribe</h3>
            <p className="mb-4 text-sm text-white/75">Get exclusive deals and updates delivered to your inbox.</p>

            {subscribeMessage && (
              <div
                className={`mb-3 break-words rounded p-2 text-xs ${
                  subscribeStatus === 'success'
                    ? 'border border-green-500/30 bg-green-500/20 text-green-300'
                    : 'border border-red-500/30 bg-red-500/20 text-red-300'
                }`}
              >
                {subscribeMessage}
              </div>
            )}

            <form onSubmit={handleSubscribe} className="flex flex-col gap-2 xl:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                disabled={subscribeStatus === 'loading'}
                className="min-w-0 w-full flex-1 rounded-lg border border-[color-mix(in_srgb,var(--primary)_22%,white)] bg-[color-mix(in_srgb,var(--text-dark)_62%,black)] px-4 py-3 text-white placeholder:text-white/45 transition focus:border-primary-theme focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={subscribeStatus === 'loading'}
                className="theme-cta-primary w-full rounded-lg px-4 py-3 disabled:cursor-not-allowed disabled:opacity-50 xl:w-auto"
              >
                {subscribeStatus === 'loading' ? '...' : 'Join'}
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-[color-mix(in_srgb,var(--primary)_18%,white)] pt-8">
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {highlightItems.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center backdrop-blur-sm"
              >
                <div className="mb-2 text-3xl">{item.icon}</div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-xs text-white/60">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[color-mix(in_srgb,var(--primary)_18%,white)] pt-8 text-center">
          <div className="mb-4 flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-white/60">&copy; 2026 {storeName} All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/60">
              <Link href="/privacy-policy" className="transition hover:text-primary-theme">Privacy Policy</Link>
              <Link href="/terms-of-service" className="transition hover:text-primary-theme">Terms of Service</Link>
              <Link href="/refund-policy" className="transition hover:text-primary-theme">Refund Policy</Link>
              <Link href="/contact" className="transition hover:text-primary-theme">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
