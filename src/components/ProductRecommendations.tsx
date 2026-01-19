'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  slug: string;
  images?: string[];
  averageRating?: number;
  reviewCount?: number;
  isDigital?: boolean;
}

interface ProductRecommendationsProps {
  // Choose one recommendation type
  productId?: string; // For similar products
  category?: string; // For category-specific recommendations
  userId?: string; // For personalized recommendations
  limit?: number;
  title?: string;
  showTitle?: boolean;
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  className?: string;
}

export default function ProductRecommendations({
  productId,
  category,
  userId,
  limit = 4,
  title,
  showTitle = true,
  onProductClick,
  onAddToCart,
  className = '',
}: ProductRecommendationsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendationType, setRecommendationType] = useState<string>('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('limit', limit.toString());

        if (productId) params.append('productId', productId);
        if (category) params.append('category', category);
        if (userId) params.append('userId', userId);

        const response = await fetch(`/api/products/recommendations?${params}`);
        const data = await response.json();

        if (data.success) {
          setProducts(data.recommendations);
          setRecommendationType(data.recommendationType);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId, category, userId, limit]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-80"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    console.error('ProductRecommendations Error:', error);
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">No products available at this time.</p>
      </div>
    );
  }

  const getTitle = () => {
    if (title) return title;
    switch (recommendationType) {
      case 'similar':
        return 'Similar Products';
      case 'personalized':
        return 'Recommended For You';
      case 'category':
        return 'More in this Category';
      case 'featured':
        return 'Featured Products';
      case 'trending':
        return 'Trending Now';
      default:
        return 'You May Also Like';
    }
  };

  return (
    <section className={`py-12 ${className}`}>
      {showTitle && (
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            {getTitle()}
          </h2>
          <div className="mt-2 h-1 w-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-500"
          >
            {/* Product Image */}
            <Link href={`/products/${product.slug}`}>
              <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}

                {/* Sale Badge */}
                {product.comparePrice && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    SALE
                  </div>
                )}
              </div>
            </Link>

            {/* Product Info */}
            <div className="p-4">
              {/* Title */}
              <Link href={`/products/${product.slug}`}>
                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[3rem]">
                  {product.name}
                </h3>
              </Link>

              {/* Rating */}
              {product.averageRating !== undefined && product.averageRating !== null && product.averageRating > 0 && (
                <div className="flex items-center gap-2 my-2">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">
                      {product.averageRating}
                    </span>
                  </div>
                  {product.reviewCount && product.reviewCount > 0 && (
                    <span className="text-xs text-gray-500">({product.reviewCount} reviews)</span>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-2 my-3">
                <span className="text-xl font-bold text-blue-600">
                  ₹{product.price.toFixed(2)}
                </span>
                {product.comparePrice && (
                  <span className="text-sm text-gray-500 line-through">
                    ₹{product.comparePrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <Link
                  href={`/products/${product.slug}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded font-medium text-sm transition-colors text-center"
                  onClick={() => onProductClick?.(product)}
                >
                  View
                </Link>
                <button
                  onClick={() => onAddToCart?.(product)}
                  className="flex-1 border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-3 rounded font-medium text-sm transition-colors"
                  title="Add to cart"
                >
                  <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
