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

export default function ProductDetailEnhancements({ product }: ProductDetailEnhancementsProps) {
  const { addItem } = useCart();
  const { addToRecentlyViewed } = useRecentlyViewed();
  const [deferredSectionsReady, setDeferredSectionsReady] = useState(false);

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
      </div>
    </>
  );
}
