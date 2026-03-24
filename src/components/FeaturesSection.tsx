import { CURRENCY_CONFIG } from '@/lib/currency';

export default function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      title: 'Free Shipping',
      description: `On orders over ${CURRENCY_CONFIG.symbol}1000`,
    },
    {
      icon: (
        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Secure Payment',
      description: '100% secure transactions',
    },
    {
      icon: (
        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      title: 'Easy Returns',
      description: '48 hours guarantee',
    },
  ];

  return (
    <section className="theme-section-shell py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <div className="theme-heading-rule mx-auto mb-4 h-1 w-16" />
          <h2 className="mb-3 text-3xl font-bold text-dark-theme md:text-4xl">
            Why Shoppers Choose Us
          </h2>
          <p className="theme-info-note mx-auto max-w-2xl text-base md:text-lg">
            Reliable service, secure checkout, and everyday convenience built into every order.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="theme-surface group p-8 text-center">
              <div className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--primary),var(--gradient-accent))] text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                {feature.icon}
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
