'use client';

import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';
import Link from 'next/link';

export default function RecentlyViewedSection() {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Recently Viewed</h2>
          <button
            onClick={clearRecentlyViewed}
            className="text-sm text-red-600 hover:text-red-700 underline"
          >
            Clear History
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {recentlyViewed.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              {/* Product Image */}
              <Link href={`/products/${product.slug}`}>
                <div className="relative overflow-hidden bg-gray-100 h-48">
                  <img
                    src={product.images?.[0] || '/images/products/default.png'}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </Link>

              {/* Product Info - Title limited to 2 lines */}
              <div className="p-3">
                <Link
                  href={`/products/${product.slug}`}
                  className="block text-sm font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 leading-tight"
                  title={product.name}
                >
                  {product.name}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
