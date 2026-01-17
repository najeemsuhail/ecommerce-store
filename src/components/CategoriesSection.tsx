import Link from 'next/link';

interface CategoriesSectionProps {
  categories: string[];
}

const categoryIcons: { [key: number]: string } = {
  0: '💻',
  1: '👕',
  2: '📱',
  3: '🏠',
  4: '⚽',
  5: '📚',
};

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (categories.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 text-gray-900">
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Shop by Category
            </span>
          </h2>
          <p className="text-xl text-gray-600 font-medium">Explore our wide range of products</p>
        </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category, index) => (
          <Link
            key={category}
            href={`/products?category=${encodeURIComponent(category)}`}
            className="group relative bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-gray-200 hover:border-blue-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-300"></div>
            <div className="relative text-center">
              <div className="text-5xl mb-3">{categoryIcons[index] || '📦'}</div>
              <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {category}
              </h3>
            </div>
          </Link>
        ))}
      </div>
      </div>
    </section>
  );
}
