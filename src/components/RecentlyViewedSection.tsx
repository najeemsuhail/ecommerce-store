'use client';

import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { formatPrice } from '@/lib/currency';

export default function RecentlyViewedSection() {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();
  const { addItem } = useCart();

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
            <div key={product.id} className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-blue-500">
              {/* Product Image */}
              <Link href={`/products/${product.slug}`}>
                <div className="relative overflow-hidden bg-gray-100 h-48">
                  <img
                    src={product.images?.[0] || '/images/products/default.png'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Add to Cart Button on Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addItem({
                          productId: product.id,
                          name: product.name,
                          price: product.price,
                          quantity: 1,
                          image: product.images?.[0],
                          slug: product.slug,
                          isDigital: false,
                        });
                      }}
                      className="bg-white text-blue-600 p-3 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-110"
                      title="Add to Cart"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 6H6.28l-.31-1.243A1 1 0 005 4H3zm5 16a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                  </div>
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
