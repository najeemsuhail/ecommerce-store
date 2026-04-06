'use client';

import { useEffect, useEffectEvent, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import Layout from '@/components/Layout';
import AddToCartNotification from '@/components/AddToCartNotification';
import ProductCarousel from '@/components/ProductCarousel';
import HeroCarousel from '@/components/HeroCarousel';
import CategoryCarousel from '@/components/CategoryCarousel';
import FeaturedProductsSection from '@/components/FeaturedProductsSection';
import FeaturesSection from '@/components/FeaturesSection';
import LatestBlogPostsSection from '@/components/LatestBlogPostsSection';
import ProductRecommendations from '@/components/ProductRecommendations';
import RecentlyViewedSection from '@/components/RecentlyViewedSection';
import { getClientCache, setClientCache } from '@/lib/clientCache';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';

const STORE_HOME_CACHE_TTL_MS = 5 * 60 * 1000;

type HomeProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images?: string[];
  averageRating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  isDigital?: boolean;
  isActive?: boolean;
  stock?: number;
  weight?: number;
};

type HomeCategory = {
  name: string;
  id: string;
  slug: string;
  imageUrl?: string | null;
};

type CategoryApiRow = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  parentId?: string | null;
  children?: Array<unknown>;
};

function getBestSellerCacheKey(ids: string[]) {
  return ids.length > 0 ? `home:best-sellers:${ids.join('|')}` : 'home:best-sellers:auto';
}

function getTrendingCacheKey(ids: string[], bestSellerIds: string[]) {
  return ids.length > 0 ? `home:trending:${ids.join('|')}` : `home:trending:auto:${bestSellerIds.join('|')}`;
}

export default function HomePageContent() {
  const { homeBestSellerProductIds, homeTrendingProductIds } = useStoreSettings();
  const { addItem } = useCart();

  const [featuredProducts, setFeaturedProducts] = useState<HomeProduct[]>(
    () => getClientCache<HomeProduct[]>('home:featured-products') || []
  );
  const [bestSellers, setBestSellers] = useState<HomeProduct[]>(
    () => getClientCache<HomeProduct[]>(getBestSellerCacheKey(homeBestSellerProductIds)) || []
  );
  const [trendingProducts, setTrendingProducts] = useState<HomeProduct[]>(
    () =>
      getClientCache<HomeProduct[]>(
        getTrendingCacheKey(
          homeTrendingProductIds,
          (getClientCache<HomeProduct[]>(getBestSellerCacheKey(homeBestSellerProductIds)) || []).map(
            (product) => product.id
          )
        )
      ) || []
  );
  const [categories, setCategories] = useState<HomeCategory[]>(
    () => getClientCache<HomeCategory[]>('home:categories') || []
  );
  const [notification, setNotification] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  const fetchProductsByIds = async (ids: string[], cacheKey: string): Promise<HomeProduct[]> => {
    if (ids.length === 0) {
      return [];
    }

    try {
      const response = await fetch(`/api/products?ids=${encodeURIComponent(ids.join(','))}`);
      const data = await response.json();
      if (data.success) {
        const nextProducts = (data.products ?? []) as HomeProduct[];
        setClientCache(cacheKey, nextProducts, STORE_HOME_CACHE_TTL_MS);
        return nextProducts;
      }
    } catch {
      console.error(`Failed to fetch products for cache key: ${cacheKey}`);
    }

    return [];
  };

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products?isFeatured=true');
      const data = await response.json();
      if (data.success) {
        const nextProducts = (data.products.slice(0, 8) ?? []) as HomeProduct[];
        setFeaturedProducts(nextProducts);
        setClientCache('home:featured-products', nextProducts, STORE_HOME_CACHE_TTL_MS);
      }
    } catch {
      console.error('Failed to fetch featured products');
    }
  };

  const fetchBestSellers = async () => {
    if (homeBestSellerProductIds.length > 0) {
      const nextProducts = await fetchProductsByIds(
        homeBestSellerProductIds,
        getBestSellerCacheKey(homeBestSellerProductIds)
      );
      setBestSellers(nextProducts);
      return;
    }

    try {
      const response = await fetch('/api/products/recommendations?mode=bestsellers&limit=8');
      const data = await response.json();
      if (data.success) {
        const nextProducts = (data.recommendations ?? []) as HomeProduct[];
        setBestSellers(nextProducts);
        setClientCache('home:best-sellers:auto', nextProducts, STORE_HOME_CACHE_TTL_MS);
      }
    } catch {
      console.error('Failed to fetch best sellers');
    }
  };

  const fetchTrendingProducts = async () => {
    if (homeTrendingProductIds.length > 0) {
      const nextProducts = await fetchProductsByIds(
        homeTrendingProductIds,
        getTrendingCacheKey(homeTrendingProductIds, [])
      );
      setTrendingProducts(nextProducts);
      return;
    }

    try {
      const params = new URLSearchParams();
      params.set('limit', '8');
      bestSellers.forEach((product) => params.append('excludeId', product.id));

      const response = await fetch(`/api/products/recommendations?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        const nextProducts = (data.recommendations ?? []) as HomeProduct[];
        setTrendingProducts(nextProducts);
        setClientCache(
          getTrendingCacheKey([], bestSellers.map((product) => product.id)),
          nextProducts,
          STORE_HOME_CACHE_TTL_MS
        );
      }
    } catch {
      console.error('Failed to fetch trending products');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = (await response.json()) as CategoryApiRow[];
      if (Array.isArray(data)) {
        const parentCategories = data
          .filter((cat) => !cat.parentId && Array.isArray(cat.children) && cat.children.length > 0)
          .map((cat) => ({ name: cat.name, id: cat.id, slug: cat.slug, imageUrl: cat.imageUrl ?? null }));

        const topLevelCategories = data
          .filter((cat) => !cat.parentId)
          .map((cat) => ({ name: cat.name, id: cat.id, slug: cat.slug, imageUrl: cat.imageUrl ?? null }));

        const categoriesToUse = parentCategories.length > 0 ? parentCategories : topLevelCategories;
        const uniqueCategories = categoriesToUse.filter(
          (cat, index, self) => index === self.findIndex((candidate) => candidate.name === cat.name)
        );
        const shuffledCategories = [...uniqueCategories].sort(() => Math.random() - 0.5);
        const nextCategories = shuffledCategories.slice(0, 6);
        setCategories(nextCategories);
        setClientCache('home:categories', nextCategories, STORE_HOME_CACHE_TTL_MS);
      }
    } catch {
      console.error('Failed to fetch categories');
    }
  };

  const refreshTopSections = useEffectEvent(() => {
    void fetchFeaturedProducts();
    void fetchBestSellers();
  });

  const refreshTrendingSection = useEffectEvent(() => {
    void fetchTrendingProducts();
  });

  const refreshCategories = useEffectEvent(() => {
    void fetchCategories();
  });

  useEffect(() => {
    refreshTopSections();
  }, [homeBestSellerProductIds]);

  useEffect(() => {
    refreshTrendingSection();
  }, [homeTrendingProductIds, bestSellers]);

  useEffect(() => {
    refreshCategories();
  }, []);

  const handleAddProduct = (product: HomeProduct) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0],
      slug: product.slug,
      isDigital: Boolean(product.isDigital),
      weight: product.weight || undefined,
    });
    setNotification({
      message: `${product.name} added to cart!`,
      visible: true,
    });
  };

  return (
    <Layout>
      <AddToCartNotification
        message={notification.message}
        isVisible={notification.visible}
        onClose={() => setNotification({ message: '', visible: false })}
      />
      <div className="bg-bg-gray">
        <HeroCarousel />
        <CategoryCarousel categories={categories} />
        <RecentlyViewedSection />
        <FeaturedProductsSection products={featuredProducts} onQuickAdd={handleAddProduct} />
        {bestSellers.length > 0 && (
          <ProductCarousel
            products={bestSellers}
            title="Best Sellers"
            description="Most popular products loved by our customers"
            type="bestseller"
          />
        )}
        <section className="theme-section-shell py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4">
            <ProductRecommendations
              limit={8}
              title="Trending Now"
              showTitle={true}
              productsOverride={trendingProducts}
              recommendationTypeOverride="trending"
              excludeProductIds={bestSellers.map((product) => product.id)}
              onAddToCart={handleAddProduct}
            />
          </div>
        </section>
        <FeaturesSection />
        <LatestBlogPostsSection />
      </div>
    </Layout>
  );
}
