import Link from 'next/link';
import Layout from '@/components/Layout';
import { getAboutPageContent } from '@/lib/contentPages';

export default async function About() {
  const content = await getAboutPageContent();

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
          {content.sections.map((section) => (
            <section
              key={section.title}
              className={`${section.accent ? 'theme-surface theme-surface-accent' : 'theme-surface'} mb-10 p-8 md:p-10`}
            >
              <div className="theme-heading-rule mb-4 h-1 w-16" />
              <h2 className="mb-6 text-3xl font-bold text-dark-theme md:text-4xl">{section.title}</h2>

              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mb-4 text-lg leading-relaxed text-dark-theme last:mb-0">
                  {paragraph}
                </p>
              ))}

              {section.checklist && section.checklist.length > 0 && (
                <div className="space-y-3">
                  {section.checklist.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="text-xl font-bold text-primary-theme">&#10003;</span>
                      <p className="text-lg text-dark-theme">{item}</p>
                    </div>
                  ))}
                </div>
              )}

              {section.ctaLabel && section.ctaHref && (
                <Link href={section.ctaHref} className="theme-cta-primary mt-6">
                  {section.ctaLabel}
                </Link>
              )}
            </section>
          ))}

          <section className="rounded-[2rem] border border-white/20 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_78%,black)_0%,color-mix(in_srgb,var(--gradient-accent)_74%,black)_100%)] p-8 text-center text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
            <h2 className="mb-4 text-3xl font-bold">{content.finalCta.title}</h2>
            <p className="mb-6 text-lg text-white/80">{content.finalCta.description}</p>
            <Link
              href={content.finalCta.href}
              className={content.finalCta.variant === 'secondary' ? 'theme-cta-secondary' : 'theme-cta-primary'}
            >
              {content.finalCta.label}
            </Link>
          </section>
        </div>
      </div>
    </Layout>
  );
}
