'use client';

import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';
import Link from 'next/link';
import { formatPrice } from '@/lib/currency';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import AddToCartNotification from './AddToCartNotification';

export default function RecentlyViewedSection() {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();
  const { addItem } = useCart();
  const [notification, setNotification] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  if (recentlyViewed.length === 0) {
    return null;
  }

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] || '/images/products/default.png',
      slug: product.slug,
      isDigital: product.isDigital || false,
    });
    setNotification({
      message: `${product.name} added to cart!`,
      visible: true,
    });
    setTimeout(() => {
      setNotification({ message: '', visible: false });
    }, 3000);
  };
    }, 3000);
  };

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
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
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

              {/* Product Info */}
              <div className="p-4">
                <Link
                  href={`/products/${product.slug}`}
                  className="block text-gray-900 font-semibold hover:text-blue-600 line-clamp-2"
                >
                  {product.name}
                </Link>

                {/* Price */}
                <p className="text-lg font-bold text-gray-900 mt-2">
                  {formatPrice(product.price)}
                </p>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(product)}
                  className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification */}
      <AddToCartNotification 
        message={notification.message}
        isVisible={notification.visible}
        onClose={() => setNotification({ message: '', visible: false })}
      />
    </section>
  );
}
