'use client';

import { useStoreSettings } from '@/contexts/StoreSettingsContext';

export default function FeaturesSection() {
  const { homeFeatures } = useStoreSettings();

  return (
    <section className="theme-section-shell py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <div className="theme-heading-rule mx-auto mb-4 h-1 w-16" />
          <h2 className="mb-3 text-3xl font-bold text-dark-theme md:text-4xl">{homeFeatures.title}</h2>
          <p className="theme-info-note mx-auto max-w-2xl text-base md:text-lg">
            {homeFeatures.description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {homeFeatures.items.map((feature) => (
            <div key={feature.title} className="theme-surface group p-8 text-center">
              <div className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--primary),var(--gradient-accent))] text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                <span className="text-base font-black uppercase tracking-[0.24em]" aria-hidden="true">
                  {feature.icon}
                </span>
              </div>
              <h3 className="mb-2 text-xl font-bold text-dark-theme">{feature.title}</h3>
              <p className="theme-info-note">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
