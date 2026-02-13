'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CategoryCarouselProps {
  categories: Array<{ name: string; id: string }>;
}

export default function CategoryCarousel({ categories }: CategoryCarouselProps) {
  if (categories.length === 0) return null;

  // Show only first 6 categories on homepage
  const displayedCategories = categories.slice(0, 6);
  const hasMore = categories.length > 6;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Shop by Category
              </span>
            </h2>
            <p className="text-lg text-gray-600">Browse our product categories</p>
          </div>
          {hasMore && (
            <Link
              href="/categories"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold whitespace-nowrap"
            >
              View All
            </Link>
          )}
        </div>

        {/* Categories Grid */}
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
      </div>
    </section>
  );
}
