import Link from 'next/link';
import Layout from '@/components/Layout';

export default function About() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="gradient-primary-accent text-white-theme py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 text-white">About Onlyinkani.in</h1>
          <p className="text-xl text-white-theme">
            Your trusted online store for everyday home essentials
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Our Story */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-slate-800 mb-6">Our Story</h2>
          <p className="text-lg text-slate-700 leading-relaxed mb-4">
            We started Onlyinkani with a simple goal — to make quality household products affordable, easy to order, 
            and fast to deliver across India.
          </p>
          <p className="text-lg text-slate-700 leading-relaxed mb-4">
            Based in Goa, we understand the common challenges people face while shopping for daily home needs: high prices, 
            limited options, and slow deliveries. That's why we focus on carefully selected essentials that are practical, 
            reliable, and fairly priced.
          </p>
          <p className="text-lg text-slate-700 leading-relaxed">
            From kitchen items to household must-haves, every product we offer is chosen with quality and usefulness in mind.
          </p>
        </section>

        {/* Our Promise */}
        <section className="mb-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">Our Promise</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold text-xl">✔</span>
              <p className="text-lg text-slate-700">Affordable pricing</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold text-xl">✔</span>
              <p className="text-lg text-slate-700">Trusted quality</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold text-xl">✔</span>
              <p className="text-lg text-slate-700">Fast delivery</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold text-xl">✔</span>
              <p className="text-lg text-slate-700">Friendly customer support</p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-8">Why Onlyinkani</h2>
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            We are proud to be starting small and growing with honesty, customer trust, and long-term value. 
            Our commitment is to make everyday living simpler by providing carefully curated household essentials 
            at prices that won't break the bank.
          </p>
          <p className="text-lg text-slate-700 leading-relaxed">
            Thank you for choosing Onlyinkani.in — we're honored to be part of your daily life and committed 
            to serving you with integrity and care.
          </p>
        </section>

        {/* Contact Section */}
        <section className="mb-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">Get in Touch</h2>
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            Have questions or feedback? We'd love to hear from you! Our friendly customer support team is here to help 
            and ensure you have the best shopping experience possible.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
          >
            Contact Us
          </Link>
        </section>

        {/* CTA Section */}
        <section className="gradient-primary-accent rounded-lg text-white-theme p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Shopping Today</h2>
          <p className="text-lg text-indigo-100 mb-6">
            Discover affordable, quality household essentials delivered fast across India.
          </p>
          <Link
            href="/products"
            className="inline-block bg-light-theme text-primary-theme px-8 py-3 rounded-lg font-bold hover:bg-light-gray-theme transition"
          >
            Browse Our Products
          </Link>
        </section>
      </div>
      </div>
    </Layout>
  );
}
