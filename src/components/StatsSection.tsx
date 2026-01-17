interface Stats {
  products: number;
  customers: number;
  orders: number;
}

interface StatsSectionProps {
  stats: Stats;
}

export default function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-y-2 border-blue-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Products', value: stats.products, icon: '📦', color: 'from-blue-500 to-blue-600' },
            { label: 'Happy Customers', value: stats.customers, icon: '😊', color: 'from-purple-500 to-purple-600' },
            { label: 'Orders Delivered', value: stats.orders, icon: '✅', color: 'from-pink-500 to-pink-600' },
          ].map((stat, index) => (
            <div key={index} className="text-center group cursor-pointer">
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <span className="text-3xl">{stat.icon}</span>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {stat.value}+
              </div>
              <div className="text-text-light font-medium mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
