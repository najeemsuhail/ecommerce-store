'use client';

import Link from 'next/link';

interface CategoriesSectionProps {
  categories: Array<{ name: string; id: string }>;
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (categories.length === 0) return null;

  // Show only first 6 categories on section
  const displayedCategories = categories.slice(0, 6);
  const hasMore = categories.length > 6;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 text-gray-900">
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Shop by Category
            </span>
          </h2>
          <p className="text-xl text-gray-600 font-medium">Browse our product categories</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayedCategories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="group relative overflow-hidden rounded-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-xl"
            >
              <div className="px-6 py-8 text-center">
                <h3 className="font-bold text-lg text-white group-hover:scale-110 transition-transform duration-300">
                  {category.name}
                </h3>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
            </Link>
          ))}
        </div>

        {hasMore && (
          <div className="mt-12 text-center">
            <Link
              href="/categories"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              View All Categories
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
