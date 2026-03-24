import Link from 'next/link';
import Layout from '@/components/Layout';

export default function About() {
  return (
    <Layout>
      <div className="theme-page-shell min-h-screen">
        <div className="px-4 py-16">
          <div className="mx-auto max-w-6xl text-center">
            <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/20 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_78%,black)_0%,color-mix(in_srgb,var(--gradient-accent)_74%,black)_100%)] px-6 py-12 text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
              <div className="mx-auto mb-4 h-1 w-20 rounded-full bg-white/70" />
              <h1 className="mb-4 text-4xl font-bold md:text-5xl">About Onlyinkani.in</h1>
              <p className="mx-auto max-w-2xl text-xl text-white/80">
                Your trusted online store for everyday home essentials
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-6 pb-16">
          <section className="theme-surface mb-10 p-8 md:p-10">
            <div className="theme-heading-rule mb-4 h-1 w-16" />
            <h2 className="mb-6 text-3xl font-bold text-dark-theme md:text-4xl">Our Story</h2>
            <p className="mb-4 text-lg leading-relaxed text-dark-theme">
              We started Onlyinkani with a simple goal: to make quality household products affordable, easy to order,
              and fast to deliver across India.
            </p>
            <p className="mb-4 text-lg leading-relaxed text-dark-theme">
              Based in Goa, we understand the common challenges people face while shopping for daily home needs: high prices,
              limited options, and slow deliveries. That is why we focus on carefully selected essentials that are practical,
              reliable, and fairly priced.
            </p>
            <p className="text-lg leading-relaxed text-dark-theme">
              From kitchen items to household must-haves, every product we offer is chosen with quality and usefulness in mind.
            </p>
          </section>

          <section className="theme-surface theme-surface-accent mb-10 p-8 md:p-10">
            <div className="theme-heading-rule mb-4 h-1 w-16" />
            <h2 className="mb-6 text-3xl font-bold text-dark-theme">Our Promise</h2>
            <div className="space-y-3">
              {['Affordable pricing', 'Trusted quality', 'Fast delivery', 'Friendly customer support'].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="text-xl font-bold text-primary-theme">✓</span>
                  <p className="text-lg text-dark-theme">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="theme-surface mb-10 p-8 md:p-10">
            <div className="theme-heading-rule mb-4 h-1 w-16" />
            <h2 className="mb-6 text-3xl font-bold text-dark-theme">Why Onlyinkani</h2>
            <p className="mb-6 text-lg leading-relaxed text-dark-theme">
              We are proud to be starting small and growing with honesty, customer trust, and long-term value.
              Our commitment is to make everyday living simpler by providing carefully curated household essentials
              at prices that will not break the bank.
            </p>
            <p className="text-lg leading-relaxed text-dark-theme">
              Thank you for choosing Onlyinkani.in. We are honored to be part of your daily life and committed
              to serving you with integrity and care.
            </p>
          </section>

          <section className="theme-surface mb-10 p-8 md:p-10">
            <div className="theme-heading-rule mb-4 h-1 w-16" />
            <h2 className="mb-6 text-3xl font-bold text-dark-theme">Get in Touch</h2>
            <p className="mb-6 text-lg leading-relaxed text-dark-theme">
              Have questions or feedback? We would love to hear from you. Our customer support team is here to help
              and ensure you have the best shopping experience possible.
            </p>
            <Link href="/contact" className="theme-cta-primary">
              Contact Us
            </Link>
          </section>

          <section className="rounded-[2rem] border border-white/20 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_78%,black)_0%,color-mix(in_srgb,var(--gradient-accent)_74%,black)_100%)] p-8 text-center text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
            <h2 className="mb-4 text-3xl font-bold">Start Shopping Today</h2>
            <p className="mb-6 text-lg text-white/80">
              Discover affordable, quality household essentials delivered fast across India.
            </p>
            <Link href="/products" className="theme-cta-secondary">
              Browse Our Products
            </Link>
          </section>
        </div>
      </div>
    </Layout>
  );
}
