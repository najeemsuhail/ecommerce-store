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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-indigo-100">
            We'd love to hear from you. Get in touch with our team anytime.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Contact Info Cards */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl text-indigo-600 mb-4">📍</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Address</h3>
            <p className="text-slate-600">
              123 Commerce Street<br />
              New York, NY 10001<br />
              United States
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl text-indigo-600 mb-4">📧</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Email</h3>
            <p className="text-slate-600">
              <a href="mailto:support@ecomstore.com" className="text-indigo-600 hover:underline">
                support@ecomstore.com
              </a>
              <br />
              <a href="mailto:info@ecomstore.com" className="text-indigo-600 hover:underline">
                info@ecomstore.com
              </a>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl text-indigo-600 mb-4">📞</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Phone</h3>
            <p className="text-slate-600">
              +1 (555) 123-4567<br />
              +1 (555) 987-6543<br />
              Mon - Fri, 9AM - 6PM EST
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">Send us a Message</h2>
          
          {submitted && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              <p className="font-bold">Success!</p>
              <p>Thank you for your message. We'll get back to you soon.</p>
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
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer">
              <summary className="font-bold text-slate-800 text-lg">What are your shipping times?</summary>
              <p className="text-slate-600 mt-4">
                We offer standard shipping (5-7 business days) and express shipping (2-3 business days). 
                Shipping times are calculated from the date your order is confirmed.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer">
              <summary className="font-bold text-slate-800 text-lg">What is your return policy?</summary>
              <p className="text-slate-600 mt-4">
                We accept returns within 30 days of purchase. Items must be in original condition with 
                all packaging and accessories. Refunds are processed within 5-7 business days.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer">
              <summary className="font-bold text-slate-800 text-lg">Do you offer international shipping?</summary>
              <p className="text-slate-600 mt-4">
                Yes, we ship to over 100 countries worldwide. International shipping costs and times 
                vary by location. You'll see the exact cost at checkout.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-md p-6 cursor-pointer">
              <summary className="font-bold text-slate-800 text-lg">How can I track my order?</summary>
              <p className="text-slate-600 mt-4">
                Once your order ships, you'll receive a tracking number via email. You can use this 
                number to monitor your package's journey to your door.
              </p>
            </details>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
}
