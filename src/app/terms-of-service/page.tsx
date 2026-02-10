'use client';

import Link from 'next/link';
import Layout from '@/components/Layout';

export default function TermsOfService() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="gradient-primary-accent text-white-theme py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4 text-white">📄 Terms & Conditions</h1>
            <p className="text-xl text-white-theme">
              By using Onlyinkani.in, you agree to our terms.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Last Updated */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600">
              <strong>Effective Date:</strong> February 10, 2026
            </p>
          </div>

          {/* Product Availability */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">1. Product Availability</h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              All products listed are subject to availability. We strive to keep our inventory current, but items may become unavailable without notice.
            </p>
          </section>

          {/* Pricing */}
          <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">2. Pricing</h2>
            <p className="text-slate-700 text-lg leading-relaxed">
              Prices may change without prior notice. We reserve the right to update prices at any time. The price you see at checkout is the price you will pay.
            </p>
          </section>

          {/* Order Cancellation */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">3. Order Cancellation</h2>
            <p className="text-slate-700 text-lg leading-relaxed">
              We reserve the right to cancel or refuse any order at our discretion, including orders that appear to violate these terms or for any other reason deemed necessary.
            </p>
          </section>

          {/* Product Images */}
          <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">4. Product Images & Descriptions</h2>
            <p className="text-slate-700 text-lg leading-relaxed">
              Product images are for illustration purposes only and may not represent the actual product exactly. Colors, sizes, and appearance may vary slightly from images displayed on our website.
            </p>
          </section>

          {/* Accurate Information */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">5. Your Responsibility</h2>
            <p className="text-slate-700 text-lg leading-relaxed">
              You agree to provide accurate and complete information while placing orders, including your name, address, phone number, and payment details. You are responsible for any errors or delays caused by incorrect information provided by you.
            </p>
          </section>

          {/* Delivery Disclaimer */}
          <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">6. Delivery & Delays</h2>
            <p className="text-slate-700 text-lg leading-relaxed">
              Onlyinkani.in is not responsible for delays caused by courier partners or unforeseen circumstances such as weather, natural disasters, strikes, or other events beyond our control. We will make our best effort to deliver your order on time.
            </p>
          </section>

          {/* Misuse & Fraud */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">7. Misuse & Fraudulent Activity</h2>
            <p className="text-slate-700 text-lg leading-relaxed">
              Misuse of the website or fraudulent activity may result in order cancellation, account suspension, and legal action. This includes but is not limited to unauthorized access, false information, or any attempt to circumvent our policies.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">8. Acceptance of Terms</h2>
            <p className="text-slate-700 text-lg leading-relaxed">
              By using Onlyinkani.in and placing an order, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our website.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12 gradient-primary-accent rounded-lg text-white-theme p-8">
            <h2 className="text-3xl font-bold mb-4">Questions?</h2>
            <p className="text-lg text-white-theme leading-relaxed mb-4">
              If you have any questions about these Terms & Conditions, please contact us:
            </p>
            <div className="space-y-2 text-white-theme">
              <p><strong>Email:</strong> support@onlyinkani.in</p>
            </div>
          </section>

          {/* Footer Links */}
          <div className="flex gap-4 justify-center mt-12">
            <Link href="/" className="text-primary-theme hover:underline font-semibold">
              Back to Home
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/privacy-policy" className="text-primary-theme hover:underline font-semibold">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
