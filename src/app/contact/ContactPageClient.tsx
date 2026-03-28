'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faClock, faEnvelope, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import type { ContactPageContent } from '@/lib/contentPages';

type Props = {
  content: ContactPageContent;
};

function getContactIcon(iconKey: 'email' | 'location' | 'hours') {
  if (iconKey === 'location') {
    return faLocationDot;
  }

  if (iconKey === 'hours') {
    return faClock;
  }

  return faEnvelope;
}

export default function ContactPageClient({ content }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send message. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="theme-page-shell min-h-screen">
        <div className="px-4 py-16">
          <div className="mx-auto max-w-6xl text-center">
            <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/20 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_78%,black)_0%,color-mix(in_srgb,var(--gradient-accent)_74%,black)_100%)] px-6 py-12 text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
              <div className="mx-auto mb-4 h-1 w-20 rounded-full bg-white/70" />
              <h1 className="mb-4 text-4xl font-bold md:text-5xl">{content.title}</h1>
              <p className="mx-auto max-w-3xl text-xl text-white/80">{content.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-6 pb-16">
          <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {content.cards.map((card) => (
              <div key={card.title} className="theme-surface p-6 text-center">
                <div className="mb-4 text-4xl text-primary-theme">
                  <FontAwesomeIcon icon={getContactIcon(card.iconKey)} />
                </div>
                <h3 className="mb-2 text-xl font-bold text-dark-theme">{card.title}</h3>
                <div className="space-y-1 text-dark-theme">
                  {card.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                {card.links && card.links.length > 0 && (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    {card.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className="theme-inline-link inline-flex items-center gap-2"
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                      >
                        {link.label === 'WhatsApp chat' && <FontAwesomeIcon icon={faWhatsapp} className="text-lg" />}
                        <span>{link.label}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="theme-surface mx-auto max-w-2xl p-8 md:p-10">
            <h2 className="mb-2 text-3xl font-bold text-dark-theme">{content.formTitle}</h2>
            <p className="theme-info-note mb-8">{content.formDescription}</p>

            {submitted && (
              <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-4 text-green-800">
                <p className="text-lg font-bold">{content.successTitle}</p>
                <p className="text-sm">{content.successDescription}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-4 text-red-800">
                <p className="text-lg font-bold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-semibold text-dark-theme">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="theme-form-input"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-dark-theme">
                  Email Address *
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

              <div>
                <label htmlFor="subject" className="mb-2 block text-sm font-semibold text-dark-theme">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="theme-form-input"
                  placeholder="What is this about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-semibold text-dark-theme">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="theme-form-input resize-none"
                  placeholder="Please tell us how we can help..."
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="theme-cta-primary w-full disabled:cursor-not-allowed disabled:opacity-50">
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          <div className="theme-surface mt-16 p-8 text-center">
            <h2 className="mb-4 text-3xl font-bold text-dark-theme">{content.closingTitle}</h2>
            <p className="text-lg leading-relaxed text-dark-theme">{content.closingDescription}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
