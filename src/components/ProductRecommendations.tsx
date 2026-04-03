'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/currency';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import AddToWishlistModal from '@/components/AddToWishlistModal';
import { getClientCache, setClientCache } from '@/lib/clientCache';

const PRODUCT_RECOMMENDATIONS_CACHE_TTL_MS = 60 * 1000;

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
  excludeProductIds?: string[];
  limit?: number;
  title?: string;
  showTitle?: boolean;
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  className?: string;
  productsOverride?: Product[];
  recommendationTypeOverride?: string;
}

export default function ProductRecommendations({
  productId,
  category,
  userId,
  excludeProductIds = [],
  limit = 4,
  title,
  showTitle = true,
  onProductClick,
  onAddToCart,
  className = '',
  productsOverride,
  recommendationTypeOverride,
}: ProductRecommendationsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendationType, setRecommendationType] = useState<string>('');
  const excludeIdsKey = excludeProductIds.join('|');
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
    if (productsOverride) {
      setProducts(productsOverride);
      setRecommendationType(recommendationTypeOverride || 'manual');
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();

    const fetchRecommendations = async () => {
      const params = new URLSearchParams();
      const resolvedExcludeIds = excludeIdsKey ? excludeIdsKey.split('|').filter(Boolean) : [];
      params.append('limit', limit.toString());

      if (productId) params.append('productId', productId);
      if (category) params.append('category', category);
      if (userId) params.append('userId', userId);
      resolvedExcludeIds.forEach((id) => params.append('excludeId', id));

      const url = `/api/products/recommendations?${params.toString()}`;
      const cacheKey = `product-recommendations:${url}`;
      const cachedData = getClientCache<{ recommendations: Product[]; recommendationType: string }>(cacheKey);

      if (cachedData) {
        setProducts(cachedData.recommendations);
        setRecommendationType(cachedData.recommendationType);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(url, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (data.success) {
          setProducts(data.recommendations);
          setRecommendationType(data.recommendationType);
          setClientCache(cacheKey, {
            recommendations: data.recommendations,
            recommendationType: data.recommendationType,
          }, PRODUCT_RECOMMENDATIONS_CACHE_TTL_MS);
        } else {
          setError(data.error);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setError('Failed to load recommendations');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchRecommendations();

    return () => controller.abort();
  }, [productId, category, userId, excludeIdsKey, limit, productsOverride, recommendationTypeOverride]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="grid grid-cols-2 grid-rows-2 gap-3 sm:grid-cols-2 sm:grid-rows-none sm:gap-6 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 rounded-lg bg-gray-200 sm:h-80"></div>
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
    <section className={`py-10 sm:py-12 ${className}`}>
      {showTitle && (
        <div className="mb-6 sm:mb-8">
          <h2 className="theme-section-heading text-2xl font-bold sm:text-3xl md:text-4xl">
            {getTitle()}
          </h2>
          <div className="theme-heading-rule mt-2 h-1 w-20"></div>
        </div>
      )}

      <div className="grid grid-cols-2 grid-rows-2 gap-3 sm:grid-cols-2 sm:grid-rows-none sm:gap-6 lg:grid-cols-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="theme-product-card group overflow-hidden"
          >
            {/* Product Image */}
            <Link
              href={`/products/${product.slug}`}
              scroll={true}
              onClick={() => onProductClick?.(product)}
            >
              <div className="theme-product-media relative h-40 overflow-hidden sm:h-48 md:h-56">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
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

                {/* Sale badge removed */}

                {/* Add to Cart Button on Hover */}
                    <div className="theme-product-hover absolute inset-0 hidden items-center justify-center gap-4 transition-opacity duration-300 md:flex md:opacity-0 md:group-hover:opacity-100">
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
                        className="theme-action-fab p-3"
                        title="Add to Cart"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 6H6.28l-.31-1.243A1 1 0 005 4H3zm5 16a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleWishlistClick(product, e)}
                        className={`theme-action-fab theme-action-fab-danger p-3 ${
                          isInWishlist(product.id)
                            ? 'theme-wishlist-active'
                            : ''
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
              <div className="p-3 sm:p-4">
                {/* Title */}
                <Link
                  href={`/products/${product.slug}`}
                  scroll={true}
                  onClick={() => onProductClick?.(product)}
                >
                  <h3 className="min-h-[2.5rem] line-clamp-2 text-sm font-semibold text-dark-theme transition-colors group-hover:text-primary-theme sm:min-h-[3rem] sm:text-base">
                    {product.name}
                  </h3>
                </Link>
                {product.isActive !== false && (product.isDigital || !product.stock || product.stock > 0) && (
                  <div className="flex gap-1.5 md:hidden items-stretch pt-3">
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
                      className="theme-button-primary flex-1 min-w-0 px-2 py-2 font-medium text-xs leading-none whitespace-nowrap"
                      title="Add to Cart"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={(e) => handleWishlistClick(product, e)}
                      className={`theme-icon-button theme-icon-button-danger shrink-0 w-9 h-9 p-0 flex items-center justify-center ${
                        isInWishlist(product.id)
                          ? 'theme-wishlist-active'
                          : ''
                      }`}
                      title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Rating */}
                {product.averageRating !== undefined && product.averageRating !== null && product.averageRating > 0 && (
                  <div className="my-2 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 fill-yellow-400" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                      <span className="text-xs font-semibold text-gray-theme sm:text-sm">
                        {product.averageRating}
                      </span>
                    </div>
                    {product.reviewCount && product.reviewCount > 0 && (
                      <span className="text-xs text-text-lighter">({product.reviewCount} reviews)</span>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="my-3 flex items-center gap-2">
                  <span className="text-lg font-bold text-primary-theme sm:text-xl">
                    {formatPrice(product.price)}
                  </span>
                  {product.comparePrice && (
                    <span
                      className={`text-text-500 line-through text-sm ${
                        recommendationType === 'similar' ? 'hidden md:inline' : ''
                      }`}
                    >
                      {formatPrice(product.comparePrice)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* For Trending - Only show title */}
            {recommendationType === 'trending' && (
                <div className="bg-white-theme p-3 sm:p-4">
                  <Link
                    href={`/products/${product.slug}`}
                    scroll={true}
                    onClick={() => onProductClick?.(product)}
                  >
                    <h3 className="line-clamp-2 text-sm font-semibold text-dark-theme transition-colors group-hover:text-primary-theme sm:text-base">
                      {product.name}
                    </h3>
                  </Link>
                {product.isActive !== false && (product.isDigital || !product.stock || product.stock > 0) && (
                  <div className="flex gap-1.5 md:hidden items-stretch pt-3">
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
                      className="theme-button-primary flex-1 min-w-0 px-2 py-2 font-medium text-xs leading-none whitespace-nowrap"
                      title="Add to Cart"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={(e) => handleWishlistClick(product, e)}
                      className={`theme-icon-button theme-icon-button-danger shrink-0 w-9 h-9 p-0 flex items-center justify-center ${
                        isInWishlist(product.id)
                          ? 'theme-wishlist-active'
                          : ''
                      }`}
                      title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                    </button>
                  </div>
                )}
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
