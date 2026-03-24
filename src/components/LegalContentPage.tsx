import Link from 'next/link';
import Layout from '@/components/Layout';
import type { LegalPageContent } from '@/lib/contentPages';

type Props = {
  content: LegalPageContent;
};

export default function LegalContentPage({ content }: Props) {
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
          <div className="theme-surface mb-8 p-4">
            <p className="theme-info-note text-sm">
              <strong>Effective Date:</strong> {content.effectiveDate}
            </p>
          </div>

          {content.sections.map((section) => (
            <section
              key={section.title}
              className={`${section.accent ? 'theme-surface theme-surface-accent' : 'theme-surface'} mb-10 p-8 md:p-10`}
            >
              <div className="theme-heading-rule mb-4 h-1 w-16" />
              <h2 className="mb-6 text-3xl font-bold text-dark-theme">{section.title}</h2>

              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mb-4 text-lg leading-relaxed text-dark-theme last:mb-0">
                  {paragraph}
                </p>
              ))}

              {section.bullets && section.bullets.length > 0 && (
                <ul className="list-disc space-y-2 pl-6 text-lg text-dark-theme">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}

              {section.numbered && section.numbered.length > 0 && (
                <ol className="list-decimal space-y-2 pl-6 text-lg text-dark-theme">
                  {section.numbered.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              )}
            </section>
          ))}

          <section className="theme-surface theme-surface-accent mb-12 p-8">
            <h2 className="mb-4 text-3xl font-bold text-dark-theme">{content.contactTitle}</h2>
            <p className="mb-4 text-lg leading-relaxed text-dark-theme">{content.contactDescription}</p>
            <div className="space-y-2 text-dark-theme">
              {content.contactLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap justify-center gap-4">
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
