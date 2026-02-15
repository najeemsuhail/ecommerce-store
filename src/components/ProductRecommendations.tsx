'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/currency';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import AddToWishlistModal from '@/components/AddToWishlistModal';

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
  isActive?: boolean;
  stock?: number;
  weight?: number;
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
  const { addItem } = useCart();
  const { isInWishlist, groups, removeItemFromGroup } = useWishlist();
  const [wishlistModal, setWishlistModal] = useState({
    isOpen: false,
    productId: '',
    productName: '',
    productPrice: 0,
    productImage: '',
    productSlug: '',
  });

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

  if (error || products.length === 0) {
    return null;
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

  const handleWishlistClick = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isInWishlist(product.id)) {
      // If already in wishlist, remove from all groups
      groups.forEach((group) => {
        const isInThisGroup = group.items.some(
          (item) => item.productId === product.id
        );
        if (isInThisGroup) {
          removeItemFromGroup(group.id, product.id);
        }
      });
    } else {
      // If not in wishlist, show modal to select group
      setWishlistModal({
        isOpen: true,
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        productImage: product.images?.[0] ?? '',
        productSlug: product.slug,
      });
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

                {/* Add to Cart Button on Hover */}
                <div className="absolute inset-0 bg-black/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                  {product.isActive !== false && (product.isDigital || !product.stock || product.stock > 0) ? (
                    <>
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
                            isDigital: product.isDigital || false,
                            weight: product.weight || undefined,
                          });
                          onAddToCart?.(product);
                        }}
                        className="bg-white text-blue-600 hover:bg-blue-600 hover:text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
                        title="Add to Cart"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 6H6.28l-.31-1.243A1 1 0 005 4H3zm5 16a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleWishlistClick(product, e)}
                        className={`p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
                          isInWishlist(product.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white text-gray-600 hover:text-red-500'
                        }`}
                        title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                        </svg>
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </Link>

            {/* Product Info - Only show for non-trending sections */}
            {recommendationType !== 'trending' && (
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
                    {formatPrice(product.price)}
                  </span>
                  {product.comparePrice && (
                    <span className="text-text-500 line-through text-sm">
                      {formatPrice(product.comparePrice)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* For Trending - Only show title */}
            {recommendationType === 'trending' && (
              <div className="p-3 bg-white">
                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      <AddToWishlistModal
        isOpen={wishlistModal.isOpen}
        onClose={() =>
          setWishlistModal({
            isOpen: false,
            productId: '',
            productName: '',
            productPrice: 0,
            productImage: '',
            productSlug: '',
          })
        }
        productId={wishlistModal.productId}
        productName={wishlistModal.productName}
        productPrice={wishlistModal.productPrice}
        productImage={wishlistModal.productImage}
        productSlug={wishlistModal.productSlug}
      />
    </section>
  );
}
