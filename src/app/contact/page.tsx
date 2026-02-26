'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';

export default function Contact() {
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
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="gradient-primary-accent text-white-theme py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 text-white">📞 Contact Us</h1>
          <p className="text-xl text-white-theme">
            We're here to help! If you have any questions about our products, orders, shipping, or returns, feel free to reach out to us anytime.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Contact Info Cards */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl text-indigo-600 mb-4">📧</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Email</h3>
            <p className="text-slate-600">
              <a href="mailto:contact@onlyinkani.in" className="text-indigo-600 hover:underline">
                contact@onlyinkani.in
              </a>
              <br />
              <span className="inline-flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-green-600"
                  viewBox="0 0 32 32"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M19.11 17.21c-.27-.14-1.59-.78-1.84-.86-.25-.09-.43-.14-.61.14-.18.27-.7.86-.86 1.04-.16.18-.32.2-.59.07-.27-.14-1.15-.42-2.19-1.34-.81-.72-1.36-1.6-1.52-1.87-.16-.27-.02-.41.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.02-.22-.52-.45-.45-.61-.46h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27s.98 2.64 1.11 2.82c.14.18 1.91 2.91 4.63 4.08.65.28 1.16.45 1.56.57.66.21 1.26.18 1.73.11.53-.08 1.59-.65 1.82-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z" />
                  <path d="M16.01 3C8.84 3 3 8.83 3 16c0 2.55.74 5.02 2.13 7.15L3 29l6.03-1.99A12.93 12.93 0 0 0 16.01 29C23.17 29 29 23.17 29 16S23.17 3 16.01 3zm0 23.67a10.6 10.6 0 0 1-5.39-1.47l-.39-.23-3.58 1.18 1.17-3.49-.25-.41A10.66 10.66 0 0 1 5.33 16c0-5.88 4.79-10.67 10.68-10.67 2.85 0 5.53 1.11 7.54 3.12A10.6 10.6 0 0 1 26.67 16c0 5.88-4.79 10.67-10.66 10.67z" />
                </svg>
                <a
                  href="https://wa.me/919420386486"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  WhatsApp: +91 9420 386 486
                </a>
              </span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl text-indigo-600 mb-4">📍</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Location</h3>
            <p className="text-slate-600">
              Bambolim, Goa, India. <br></br>
              Pin: 403202
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl text-indigo-600 mb-4">⏰</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Support Hours</h3>
            <p className="text-slate-600">
              Monday to Saturday<br />
              10:00 AM to 5:00 PM
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-xl p-8 md:p-10 max-w-2xl mx-auto border border-slate-200">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Send us a Message</h2>
          <p className="text-slate-600 mb-8">We aim to respond to all queries within 24 hours.</p>
          
          {submitted && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-800 px-4 py-4 rounded-lg mb-6 flex items-start gap-3 animate-pulse">
              <svg className="w-5 h-5 flex-shrink-0 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              <div>
                <p className="font-bold text-lg">Success!</p>
                <p className="text-sm">Thank you for your message. We'll get back to you soon.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-4 rounded-lg mb-6 flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <div>
                <p className="font-bold text-lg">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all bg-white hover:border-slate-300"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all bg-white hover:border-slate-300"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all bg-white hover:border-slate-300"
                placeholder="What is this about?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all bg-white hover:border-slate-300 resize-none"
                placeholder="Please tell us how we can help..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-gradient-primary-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Support Message */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Thank You for Choosing Onlyinkani.in</h2>
          <p className="text-lg text-slate-700 leading-relaxed">
            Your satisfaction is our priority. Whether you have questions about products, orders, shipping, or returns, 
            our friendly team is here to help. We aim to respond to all queries within 24 hours.
          </p>
        </div>
      </div>
      </div>
    </Layout>
  );
}
