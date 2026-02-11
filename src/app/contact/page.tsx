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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real app, you'd send this data to your backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    
    // Reset success message after 5 seconds
    setTimeout(() => setSubmitted(false), 5000);
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
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl text-indigo-600 mb-4">📍</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Location</h3>
            <p className="text-slate-600">
              Bambolim, Goa, India. PIN: 403202
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl text-indigo-600 mb-4">⏰</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Support Hours</h3>
            <p className="text-slate-600">
              Monday to Saturday<br />
              9:00 AM to 6:00 PM
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-light-theme rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Send us a Message</h2>
          <p className="text-slate-600 mb-6">We aim to respond to all queries within 24 hours.</p>
          
          {submitted && (
            <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg mb-6 flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              <div>
                <p className="font-bold">Success!</p>
                <p>Thank you for your message. We'll get back to you soon.</p>
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                placeholder="Please tell us how we can help..."
              />
            </div>

            <button
              type="submit"
              className="w-full btn-gradient-primary-lg font-bold"
            >
              Send Message
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
