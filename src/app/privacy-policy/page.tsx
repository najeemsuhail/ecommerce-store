'use client';

import Link from 'next/link';
import Layout from '@/components/Layout';

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="gradient-primary-accent text-white-theme py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4 text-white">📜 Privacy Policy</h1>
            <p className="text-xl text-white-theme">
              Onlyinkani.in respects your privacy and is committed to protecting your personal information.
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

          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">About This Privacy Policy</h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              We respect your privacy and are committed to protecting your personal information. This Privacy Policy 
              explains how we collect, use, and protect your data when you visit our website and make purchases.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Information We Collect</h2>
            
            <p className="text-lg text-slate-700 leading-relaxed mb-4">
              When you use our website, we may collect basic details such as:
            </p>
            
            <ul className="list-disc list-inside text-slate-700 space-y-2 text-lg">
              <li>Your name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Shipping address</li>
              <li>Payment-related information</li>
            </ul>
            
            <p className="text-slate-700 mt-4 text-lg leading-relaxed">
              We collect this information to process orders and provide better service.
            </p>
          </section>

          {/* How We Use Information */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">How We Use Your Information</h2>
            <p className="text-lg text-slate-700 leading-relaxed mb-4">
              We use your information only to:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 text-lg">
              <li>Process orders and deliveries</li>
              <li>Provide customer support</li>
              <li>Improve our services</li>
              <li>Send important order updates</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Data Sharing</h2>
            
            <p className="text-slate-700 text-lg leading-relaxed">
              We do not sell, trade, or share your personal information with third parties except when required to 
              complete your order or by law.
            </p>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Security</h2>
            <p className="text-slate-700 text-lg leading-relaxed">
              Our website uses secure payment gateways to protect your payment data.
            </p>
          </section>

          {/* Agreement */}
          <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Your Agreement</h2>
            <p className="text-slate-700 text-lg leading-relaxed">
              By using Onlyinkani.in, you agree to this Privacy Policy.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12 gradient-primary-accent rounded-lg text-white-theme p-8">
            <h2 className="text-3xl font-bold mb-4">Have Questions?</h2>
            <p className="text-lg text-white-theme leading-relaxed mb-4">
              For any questions, contact us at:
            </p>
            <div className="space-y-2 text-white-theme">
              <p><strong>Email:</strong> contact@onlyinkani.in</p>
            </div>
            <p className="text-white-theme mt-6">
              We appreciate your trust in Onlyinkani.in.
            </p>
          </section>

          {/* Footer Links */}
          <div className="flex gap-4 justify-center mt-12">
            <Link href="/" className="text-primary-theme hover:underline font-semibold">
              Back to Home
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
