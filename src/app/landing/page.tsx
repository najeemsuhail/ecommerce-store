import type { Metadata } from 'next';
import Link from 'next/link';
import Layout from '@/components/Layout';
import FeaturesSection from '@/components/FeaturesSection';
import LatestBlogPostsSection from '@/components/LatestBlogPostsSection';
import { getStoreSettings } from '@/lib/storeSettings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const title = settings.landingPage.title || `${settings.storeName} Landing Page`;
  const description = settings.landingPage.description || settings.seoDescription;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: '/landing',
      siteName: settings.storeName,
    },
  };
}

export default async function LandingPage() {
  const settings = await getStoreSettings();
  const { landingPage } = settings;

  return (
    <Layout>
      <div className="bg-bg-gray">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),transparent_35%),linear-gradient(135deg,color-mix(in_srgb,var(--primary)_16%,white),color-mix(in_srgb,var(--gradient-accent)_22%,white)_55%,#fffaf2)]" />
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--primary)_14%,white),transparent_68%)] lg:block" />

          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 md:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--primary)_20%,white)] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--primary)] shadow-sm backdrop-blur">
                {landingPage.badge}
              </div>
              <h1 className="max-w-2xl text-4xl font-black leading-tight text-dark-theme sm:text-5xl lg:text-6xl">
                {landingPage.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--text-light)] md:text-lg">
                {landingPage.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={landingPage.primaryCTA.href}
                  className="theme-button-primary inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold"
                >
                  {landingPage.primaryCTA.label}
                </Link>
                <Link
                  href={landingPage.secondaryCTA.href}
                  className="theme-button-secondary inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold"
                >
                  {landingPage.secondaryCTA.label}
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {landingPage.audiencePillars.map((pillar) => (
                  <div
                    key={pillar.title}
                    className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur"
                  >
                    <p className="text-sm font-bold text-dark-theme">{pillar.title}</p>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--text-light)]">{pillar.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="theme-surface relative overflow-hidden p-6 md:p-8">
              <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--primary),var(--gradient-accent))]" />
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--primary)]">
                    Landing Route
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-dark-theme">When to use `/landing`</h2>
                </div>
                <div className="rounded-full bg-[color-mix(in_srgb,var(--primary)_12%,white)] px-3 py-1 text-xs font-semibold text-[color:var(--primary)]">
                  Ready
                </div>
              </div>

              <div className="space-y-4">
                {landingPage.steps.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-2xl border border-[color-mix(in_srgb,var(--primary)_10%,white)] bg-white/70 p-5"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--primary),var(--gradient-accent))] text-sm font-bold text-white">
                        {index + 1}
                      </div>
                      <h3 className="text-lg font-semibold text-dark-theme">{step.title}</h3>
                    </div>
                    <p className="text-sm leading-6 text-[color:var(--text-light)]">{step.description}</p>
                    <Link
                      href={step.href}
                      className="mt-4 inline-flex text-sm font-semibold text-[color:var(--primary)] transition-opacity hover:opacity-80"
                    >
                      {step.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="theme-section-shell py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-10 max-w-2xl">
              <div className="theme-heading-rule mb-4 h-1 w-16" />
              <h2 className="theme-section-heading text-3xl font-bold md:text-4xl">Built for a single message</h2>
              <p className="theme-info-note mt-4 text-base md:text-lg">
                Unlike the main home page, this route keeps attention on one campaign story and a tighter call to action.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {landingPage.promoCards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="theme-surface p-6 transition-transform duration-200 hover:-translate-y-1"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--primary)]">
                    {card.eyebrow}
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-dark-theme">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--text-light)]">{card.description}</p>
                  <span className="mt-4 inline-flex text-sm font-semibold text-[color:var(--primary)]">
                    {card.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <FeaturesSection />
        <LatestBlogPostsSection />
      </div>
    </Layout>
  );
}
