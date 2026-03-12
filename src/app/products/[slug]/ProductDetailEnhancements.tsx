'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useCart } from '@/contexts/CartContext';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';

const ReviewForm = dynamic(() => import('@/components/ReviewForm'), {
  loading: () => <div className="h-28 rounded-lg bg-gray-100 animate-pulse" />,
});

const ProductRecommendations = dynamic(() => import('@/components/ProductRecommendations'), {
  loading: () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-72 rounded-lg bg-gray-100 animate-pulse" />
      ))}
    </div>
  ),
});

interface ProductDetailEnhancementsProps {
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    price: number;
    isDigital: boolean;
    isActive: boolean;
    weight?: number | null;
  };
}

interface DeferredReview {
  id: string;
  rating: number;
  comment?: string | null;
  user?: {
    name?: string | null;
  } | null;
}

export default function ProductDetailEnhancements({ product }: ProductDetailEnhancementsProps) {
  const { addItem } = useCart();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const [deferredSectionsReady, setDeferredSectionsReady] = useState(false);
  const [reviews, setReviews] = useState<DeferredReview[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    addToRecentlyViewed({
      id: product.id,
      name: product.name,
      slug: product.slug,
      images: product.images,
      price: product.price,
      viewedAt: Date.now(),
      isDigital: product.isDigital,
      weight: product.weight ?? undefined,
      isActive: product.isActive,
    });
  }, [
    addToRecentlyViewed,
    product.id,
    product.images,
    product.isActive,
    product.isDigital,
    product.name,
    product.price,
    product.slug,
    product.weight,
  ]);

  useEffect(() => {
    const anchor = document.getElementById('deferred-sections-anchor');
    if (!anchor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDeferredSectionsReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px 0px' }
    );

    observer.observe(anchor);
    return () => observer.disconnect();
  }, [product.id]);

  useEffect(() => {
    if (!deferredSectionsReady) {
      return;
    }

    const controller = new AbortController();

    const loadReviews = async () => {
      setReviewsLoading(true);

      try {
        const response = await fetch(`/api/products/${product.slug}/reviews?take=10`, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to load reviews');
        }

        setReviews(data.reviews || []);
        setReviewCount(data.totalCount || 0);
        setAverageRating(data.averageRating || 0);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Failed to load product reviews:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setReviewsLoading(false);
        }
      }
    };

    loadReviews();

    return () => controller.abort();
  }, [deferredSectionsReady, product.slug]);

  if (!deferredSectionsReady) {
    return (
      <div className="mt-12">
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
          Scroll down to load recommendations and review tools.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-16 pt-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <ProductRecommendations
            productId={product.id}
            limit={4}
            title="Similar Products You May Like"
            showTitle={true}
            className="mb-8"
            onAddToCart={(recommendedProduct) => {
              addItem({
                productId: recommendedProduct.id,
                name: recommendedProduct.name,
                price: recommendedProduct.price,
                quantity: 1,
                image: recommendedProduct.images?.[0],
                slug: recommendedProduct.slug,
                isDigital: recommendedProduct.isDigital || false,
                weight: recommendedProduct.weight || undefined,
              });
            }}
          />
        </div>
      </div>

      <div className="mt-12">
        <ReviewForm productId={product.id} productName={product.name} />

        {reviewsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="rounded-lg bg-gray-100 p-6 animate-pulse">
                <div className="mb-3 h-4 w-40 rounded bg-gray-200" />
                <div className="h-4 w-full rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : reviewCount > 0 ? (
          <div>
            <h2 className="mb-3 text-2xl font-bold">Customer Reviews</h2>
            <div className="mb-6 flex items-center gap-3 text-sm text-gray-600">
              <div className="flex text-yellow-400">
                {'★'.repeat(Math.round(averageRating))}
                {'☆'.repeat(5 - Math.round(averageRating))}
              </div>
              <span>
                {averageRating.toFixed(1)} from {reviewCount} review{reviewCount === 1 ? '' : 's'}
              </span>
            </div>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-light-theme rounded-lg shadow p-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex text-yellow-400">
                      {'★'.repeat(review.rating)}
                      {'☆'.repeat(5 - review.rating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      by {review.user?.name || 'Anonymous'}
                    </span>
                  </div>
                  {review.comment && <p className="text-gray-700">{review.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>
    </>
  );
}
