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
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Shop by Category
            </span>
          </h2>
          <p className="text-base md:text-xl text-gray-600 font-medium">Browse our product categories</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayedCategories.map((category, index) => (
            <Link
              key={category.id}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="group relative overflow-hidden rounded-2xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-2xl transform hover:-translate-y-2"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <pattern id={`pattern-section-${index}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="10" cy="10" r="2" fill="white" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill={`url(#pattern-section-${index})`} />
                </svg>
              </div>

              {/* Content */}
              <div className="relative px-4 py-8 md:px-6 md:py-10 text-center flex flex-col items-center justify-center min-h-28 md:min-h-32">
                <h3 className="font-bold text-base md:text-lg lg:text-xl text-white group-hover:scale-105 transition-transform duration-300 line-clamp-2">
                  {category.name}
                </h3>
                <div className="mt-2 md:mt-3 text-white/80 group-hover:text-white transition-colors text-xs md:text-sm font-semibold">
                  Browse →
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/categories"
            className="inline-block px-6 md:px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg text-sm md:text-base"
          >
            View All Categories {hasMore && `(${categories.length})`}
          </Link>
        </div>
      </div>
    </section>
  );
}
