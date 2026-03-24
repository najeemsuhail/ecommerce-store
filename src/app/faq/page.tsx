import Link from 'next/link';
import Layout from '@/components/Layout';
import { getFaqPageContent } from '@/lib/contentPages';

export default async function FAQ() {
  const content = await getFaqPageContent();

  return (
    <Layout>
      <div className="theme-page-shell min-h-screen">
        <div className="px-4 py-16">
          <div className="mx-auto max-w-6xl text-center">
            <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/20 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_78%,black)_0%,color-mix(in_srgb,var(--gradient-accent)_74%,black)_100%)] px-6 py-12 text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
              <div className="mx-auto mb-4 h-1 w-20 rounded-full bg-white/70" />
              <h1 className="mb-4 text-4xl font-bold md:text-5xl">{content.title}</h1>
              <p className="mx-auto max-w-2xl text-xl text-white/80">{content.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-6 pb-16">
          <section className="mb-12 text-center">
            <p className="text-lg leading-relaxed text-dark-theme">{content.intro}</p>
          </section>

          <div className="space-y-4">
            {content.faqs.map((faq) => (
              <details key={faq.question} className="theme-surface group cursor-pointer p-6">
                <summary className="flex items-center justify-between text-lg font-bold text-dark-theme">
                  <span>{faq.question}</span>
                  <span className="text-primary-theme transition-transform group-open:rotate-180">
                    &#9660;
                  </span>
                </summary>
                <p className="mt-4 leading-relaxed text-dark-theme">{faq.answer}</p>
              </details>
            ))}
          </div>

          <section className="mt-16 rounded-[2rem] border border-white/20 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_78%,black)_0%,color-mix(in_srgb,var(--gradient-accent)_74%,black)_100%)] p-8 text-center text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
            <h2 className="mb-4 text-3xl font-bold">{content.supportTitle}</h2>
            <p className="mb-6 text-lg text-white/80">{content.supportDescription}</p>
            <div className="flex flex-wrap justify-center gap-4">
              {content.supportLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="theme-cta-secondary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>

          <div className="mt-16">
            <h3 className="mb-6 text-center text-2xl font-bold text-dark-theme">Related Pages</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {content.relatedLinks.map((item) => (
                <Link key={item.href} href={item.href} className="theme-surface p-6 text-center">
                  {item.icon && <div className="mb-2 text-3xl">{item.icon}</div>}
                  <h4 className="mb-2 font-bold text-dark-theme">{item.title}</h4>
                  <p className="theme-info-note text-sm">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link href="/" className="theme-inline-link font-semibold underline">
              Back to Home
            </Link>
            <Link href="/privacy-policy" className="theme-inline-link font-semibold underline">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="theme-inline-link font-semibold underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
