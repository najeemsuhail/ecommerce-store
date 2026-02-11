'use client';

import Link from 'next/link';
import Layout from '@/components/Layout';

export default function FAQ() {
  const faqs = [
    {
      question: "What products do you sell?",
      answer: "We offer a wide range of everyday home essentials including kitchen items and household necessities. Every product is carefully selected for quality and usefulness."
    },
    {
      question: "Do you deliver across India?",
      answer: "Yes, we deliver to most locations across India with fast and reliable shipping. We partner with trusted courier services to ensure safe delivery."
    },
    {
      question: "How long does delivery take?",
      answer: "Delivery usually takes 2–5 business days, depending on your location. Delivery times are calculated from the date your order is confirmed."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept secure online payments including UPI, debit cards, credit cards, and net banking. All payments are processed through secure gateways to protect your information."
    },
    {
      question: "Can I return a product?",
      answer: "Yes, you can request a return within 7 days of receiving your order. Products must be unused and in original packaging. Please refer to our Refund & Return Policy for details."
    },
    {
      question: "When will I receive my refund?",
      answer: "Approved refunds are processed within 5–7 business days to your original payment method. Please allow additional time for your bank to reflect the credit."
    },
    {
      question: "How can I contact customer support?",
      answer: "You can email us anytime at contact@onlyinkani.in and we'll get back to you within 24 hours. You can also reach out through our contact form."
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="gradient-primary-accent text-white-theme py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4 text-white">❓ Frequently Asked Questions</h1>
            <p className="text-xl text-white-theme">
              Find quick answers to common questions about Onlyinkani.in
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Introduction */}
          <section className="mb-12 text-center">
            <p className="text-lg text-slate-700 leading-relaxed">
              Have a question? We've compiled answers to the most frequently asked questions below. 
              If you don't find what you're looking for, feel free to <Link href="/contact" className="text-indigo-600 hover:underline font-semibold">contact us</Link>.
            </p>
          </section>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer group">
                <summary className="font-bold text-slate-800 text-lg flex items-center justify-between">
                  <span>{faq.question}</span>
                  <span className="text-indigo-600 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="text-slate-700 mt-4 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          {/* Still Have Questions */}
          <section className="mt-16 gradient-primary-accent rounded-lg text-white-theme p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-lg text-white-theme leading-relaxed mb-6">
              We're here to help! Reach out to our support team anytime.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/contact"
                className="inline-block bg-light-theme text-primary-theme px-8 py-3 rounded-lg font-bold hover:bg-light-gray-theme transition"
              >
                Contact Us
              </Link>
              <a
                href="mailto:contact@onlyinkani.in"
                className="inline-block bg-light-theme text-primary-theme px-8 py-3 rounded-lg font-bold hover:bg-light-gray-theme transition"
              >
                Email Support
              </a>
            </div>
          </section>

          {/* Related Links */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">Related Pages</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/about" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center">
                <div className="text-3xl mb-2">ℹ️</div>
                <h4 className="font-bold text-slate-800 mb-2">About Us</h4>
                <p className="text-slate-600 text-sm">Learn more about Onlyinkani.in</p>
              </Link>
              <Link href="/refund-policy" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center">
                <div className="text-3xl mb-2">🔄</div>
                <h4 className="font-bold text-slate-800 mb-2">Refund Policy</h4>
                <p className="text-slate-600 text-sm">Returns and refunds information</p>
              </Link>
              <Link href="/contact" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center">
                <div className="text-3xl mb-2">📞</div>
                <h4 className="font-bold text-slate-800 mb-2">Contact Us</h4>
                <p className="text-slate-600 text-sm">Get in touch with our team</p>
              </Link>
            </div>
          </div>

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
