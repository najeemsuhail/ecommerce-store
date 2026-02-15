'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CategoryCarouselProps {
  categories: Array<{ name: string; id: string; slug: string }>;
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 md:mb-12 gap-4">
          <div>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 text-gray-900">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Shop by Category
              </span>
            </h2>
            <p className="text-sm md:text-lg text-gray-600">Browse our product categories</p>
          </div>
          <Link
            href="/categories"
            className="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold whitespace-nowrap shadow-md hover:shadow-lg text-sm md:text-base w-fit"
          >
            View All {hasMore && `(${categories.length})`}
          </Link>
        </div>

        {/* Categories Grid */}
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
                    <pattern id={`pattern-home-${index}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="10" cy="10" r="2" fill="white" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill={`url(#pattern-home-${index})`} />
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
      </div>
    </section>
  );
}
