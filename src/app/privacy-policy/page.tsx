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
            <h1 className="text-5xl font-bold mb-4 text-white">Privacy Policy</h1>
            <p className="text-xl text-white-theme">
              Your privacy is important to us. Learn how we protect your data.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Last Updated */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600">
              <strong>Last Updated:</strong> January 29, 2026
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Introduction</h2>
            <p className="text-lg text-slate-700 leading-relaxed mb-4">
              This Privacy Policy ("Policy") describes how our e-commerce store ("we," "us," "our," or "Company") collects, uses, discloses, and otherwise handles your personal information when you visit our website, make a purchase, or interact with us.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              We are committed to protecting your privacy and ensuring you have a positive experience on our platform. Please read this Policy carefully to understand our practices regarding your personal data.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Information We Collect</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Personal Information</h3>
                <ul className="list-disc list-inside text-slate-700 space-y-2">
                  <li>Name and contact information (email, phone number, postal address)</li>
                  <li>Billing and shipping addresses</li>
                  <li>Payment information (processed securely, we do not store full credit card details)</li>
                  <li>Account credentials and preferences</li>
                  <li>Communication history and customer service interactions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Automatic Information</h3>
                <ul className="list-disc list-inside text-slate-700 space-y-2">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Usage data and browsing behavior</li>
                  <li>Analytics information about how you interact with our site</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Information from Third Parties</h3>
                <p className="text-slate-700">
                  We may receive information from payment processors, shipping partners, and analytics providers to improve our services.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">How We Use Your Information</h2>
            <ul className="list-disc list-inside text-slate-700 space-y-3 text-lg">
              <li>Process and fulfill your orders and transactions</li>
              <li>Send order confirmations, shipping updates, and customer support communications</li>
              <li>Manage your account and provide personalized services</li>
              <li>Send marketing communications and promotional offers (with your consent)</li>
              <li>Improve our website, products, and customer experience</li>
              <li>Prevent fraud and ensure platform security</li>
              <li>Comply with legal obligations and resolve disputes</li>
              <li>Conduct analytics and measure website performance</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Data Sharing and Disclosure</h2>
            
            <p className="text-slate-700 mb-4 text-lg leading-relaxed">
              We may share your personal information with:
            </p>
            
            <ul className="list-disc list-inside text-slate-700 space-y-3 text-lg">
              <li><strong>Service Providers:</strong> Payment processors, shipping carriers, email providers, and hosting services</li>
              <li><strong>Business Partners:</strong> Partners helping us deliver products and services</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government agencies</li>
              <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize sharing with third parties</li>
            </ul>

            <p className="text-slate-700 mt-6 text-lg leading-relaxed">
              We do <strong>not</strong> sell your personal information to third parties for their marketing purposes without your explicit consent.
            </p>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Data Security</h2>
            <p className="text-slate-700 mb-4 text-lg leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 text-lg">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Secure payment processing systems</li>
              <li>Regular security audits and updates</li>
              <li>Restricted access to personal information</li>
            </ul>
            <p className="text-slate-700 mt-4 text-lg leading-relaxed">
              While we strive to protect your information, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          {/* Cookies */}
          <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Cookies and Tracking</h2>
            <p className="text-slate-700 mb-4 text-lg leading-relaxed">
              We use cookies and similar technologies to enhance your experience, remember your preferences, and understand how you use our site. You can control cookie settings in your browser, though some features may not work properly if cookies are disabled.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Your Privacy Rights</h2>
            <p className="text-slate-700 mb-4 text-lg leading-relaxed">
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 text-lg">
              <li>Access the personal information we hold about you</li>
              <li>Request correction or deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability (receive your data in a structured format)</li>
              <li>Withdraw consent for data processing</li>
            </ul>
            <p className="text-slate-700 mt-4 text-lg leading-relaxed">
              To exercise these rights, please contact us at privacy@example.com.
            </p>
          </section>

          {/* Retention */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Data Retention</h2>
            <p className="text-slate-700 text-lg leading-relaxed">
              We retain personal information for as long as necessary to fulfill the purposes outlined in this Policy, comply with legal obligations, resolve disputes, and enforce agreements. You can request deletion of your account and associated data at any time.
            </p>
          </section>

          {/* Children */}
          <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Children's Privacy</h2>
            <p className="text-slate-700 text-lg leading-relaxed">
              Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child under 13, we will delete such information promptly.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Changes to This Policy</h2>
            <p className="text-slate-700 text-lg leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of material changes by posting the updated Policy on our website and updating the "Last Updated" date. Your continued use of our site after such updates constitutes your acceptance of the revised Policy.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12 gradient-primary-accent rounded-lg text-white-theme p-8">
            <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
            <p className="text-lg text-white-theme leading-relaxed mb-4">
              If you have questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="space-y-2 text-white-theme">
              <p><strong>Email:</strong> privacy@example.com</p>
              <p><strong>Address:</strong> 123 Business Street, City, State 12345</p>
              <p><strong>Phone:</strong> (555) 123-4567</p>
            </div>
            <p className="text-white-theme mt-6">
              We will respond to your inquiry within 30 days.
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
