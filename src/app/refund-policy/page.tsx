'use client';

import Link from 'next/link';
import Layout from '@/components/Layout';

export default function RefundPolicy() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="gradient-primary-accent text-white-theme py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4 text-white">🔄 Refund & Return Policy</h1>
            <p className="text-xl text-white-theme">
              We want you to be fully satisfied with your purchase.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Effective Date */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600">
              <strong>Effective Date:</strong> February 10, 2026
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Our Commitment</h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              At Onlyinkani.in, your satisfaction is our priority. We offer a simple and customer-friendly refund and return policy.
            </p>
          </section>

          {/* Returns */}
          <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Returns</h2>
            
            <p className="text-lg text-slate-700 leading-relaxed mb-4">
              You can request a return within <strong>7 days</strong> of receiving your order.
            </p>
            
            <p className="text-lg text-slate-700 leading-relaxed mb-4">
              To be eligible for return, products must:
            </p>
            
            <ul className="list-disc list-inside text-slate-700 space-y-2 text-lg">
              <li>Be unused and in original condition</li>
              <li>Be in original packaging with all tags and materials intact</li>
              <li>Include all accessories and documentation that came with the product</li>
            </ul>
          </section>

          {/* Refunds */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Refunds</h2>
            
            <p className="text-lg text-slate-700 leading-relaxed mb-4">
              Once your return is approved:
            </p>
            
            <ul className="list-disc list-inside text-slate-700 space-y-2 text-lg">
              <li>Refunds will be processed within <strong>5–7 business days</strong></li>
              <li>Refunds will be made to the <strong>original payment method</strong></li>
              <li>Please allow additional time for your bank to reflect the credit</li>
            </ul>
          </section>

          {/* Non-Returnable Items */}
          <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Non-Returnable Items</h2>
            
            <p className="text-lg text-slate-700 leading-relaxed mb-4">
              We cannot accept returns for:
            </p>
            
            <ul className="list-disc list-inside text-slate-700 space-y-2 text-lg">
              <li>Hygiene or personal-use items</li>
              <li>Items that appear to be used or damaged due to customer misuse</li>
              <li>Products without original packaging or serial numbers removed</li>
            </ul>
          </section>

          {/* How to Request */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">How to Request a Return</h2>
            
            <p className="text-lg text-slate-700 leading-relaxed mb-4">
              To initiate a return or refund request:
            </p>
            
            <ol className="list-decimal list-inside text-slate-700 space-y-2 text-lg mb-6">
              <li>Contact us within 7 days of receiving your order</li>
              <li>Provide your order number and reason for return</li>
              <li>Wait for approval and return shipping instructions</li>
              <li>Ship the item back in original condition to the address provided</li>
              <li>Your refund will be processed after we receive and inspect the item</li>
            </ol>
          </section>

          {/* Contact */}
          <section className="mb-12 gradient-primary-accent rounded-lg text-white-theme p-8">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-lg text-white-theme leading-relaxed mb-4">
              For return or refund requests, contact us at:
            </p>
            <div className="space-y-2 text-white-theme">
              <p><strong>Email:</strong> support@onlyinkani.in</p>
            </div>
            <p className="text-white-theme mt-6">
              We're here to help and ensure your complete satisfaction!
            </p>
          </section>

          {/* Footer Links */}
          <div className="flex gap-4 justify-center mt-12 flex-wrap">
            <Link href="/" className="text-primary-theme hover:underline font-semibold">
              Back to Home
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/privacy-policy" className="text-primary-theme hover:underline font-semibold">
              Privacy Policy
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/terms-of-service" className="text-primary-theme hover:underline font-semibold">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
