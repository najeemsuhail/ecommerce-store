interface Stats {
  products: number;
  customers: number;
  orders: number;
}

interface StatsSectionProps {
  stats: Stats;
}

export default function StatsSection({ stats }: StatsSectionProps) {
  const items = [
    { label: 'Products', value: stats.products, icon: '📦' },
    { label: 'Happy Customers', value: stats.customers, icon: '😊' },
    { label: 'Orders Delivered', value: stats.orders, icon: '✅' },
  ];

  return (
    <section className="theme-section-shell py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {items.map((stat) => (
            <div key={stat.label} className="theme-surface group p-8 text-center">
              <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--primary),var(--gradient-accent))] text-3xl shadow-lg transition-transform duration-300 group-hover:scale-110">
                <span>{stat.icon}</span>
              </div>
              <div className="theme-heading-accent text-4xl font-bold">
                {stat.value}+
              </div>
              <div className="theme-info-note mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
