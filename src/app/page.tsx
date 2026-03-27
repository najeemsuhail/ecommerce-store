'use client';

import { useEffect, useState, useCallback } from 'react';
import { useCart } from '@/contexts/CartContext';
import Layout from '@/components/Layout';
import AddToCartNotification from '@/components/AddToCartNotification';
import ProductCarousel from '@/components/ProductCarousel';
import HeroCarousel from '@/components/HeroCarousel';
// import StatsSection from '@/components/StatsSection'; // Commented out temporarily
import CategoryCarousel from '@/components/CategoryCarousel';
import FeaturedProductsSection from '@/components/FeaturedProductsSection';
import FeaturesSection from '@/components/FeaturesSection';
import LatestBlogPostsSection from '@/components/LatestBlogPostsSection';
import ProductRecommendations from '@/components/ProductRecommendations';
import RecentlyViewedSection from '@/components/RecentlyViewedSection';
import { getClientCache, setClientCache } from '@/lib/clientCache';

const STORE_HOME_CACHE_TTL_MS = 5 * 60 * 1000;

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; id: string; slug: string; imageUrl?: string | null }>>([]);
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0 });
  const [notification, setNotification] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });
  const { totalItems, addItem } = useCart();

  const fetchFeaturedProducts = async () => {
    const cacheKey = 'home:featured-products';
    try {
      const response = await fetch('/api/products?isFeatured=true');
      const data = await response.json();
      if (data.success) {
        const nextProducts = data.products.slice(0, 8);
        setFeaturedProducts(nextProducts);
        setClientCache(cacheKey, nextProducts, STORE_HOME_CACHE_TTL_MS);
      }
    } catch (error) {
      console.error('Failed to fetch featured products');
    }
  };

  const fetchBestSellers = async () => {
    const cacheKey = 'home:best-sellers';
    try {
      const response = await fetch('/api/products/recommendations?mode=bestsellers&limit=8');
      const data = await response.json();
      if (data.success) {
        const nextProducts = data.recommendations ?? [];
        setBestSellers(nextProducts);
        setClientCache(cacheKey, nextProducts, STORE_HOME_CACHE_TTL_MS);
      }
    } catch (error) {
      console.error('Failed to fetch best sellers');
    }
  };

  const fetchCategories = async () => {
    const cacheKey = 'home:categories';
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      if (Array.isArray(data)) {
        // Prefer true parent categories (top-level categories that have children).
        const parentCategories = data
          .filter((cat: any) => !cat.parentId && Array.isArray(cat.children) && cat.children.length > 0)
          .map((cat: any) => ({ name: cat.name, id: cat.id, slug: cat.slug, imageUrl: cat.imageUrl ?? null }));

        // Fallback to top-level categories when no parent categories exist.
        const topLevelCategories = data
          .filter((cat: any) => !cat.parentId)
          .map((cat: any) => ({ name: cat.name, id: cat.id, slug: cat.slug, imageUrl: cat.imageUrl ?? null }));
        const categoriesToUse = parentCategories.length > 0 ? parentCategories : topLevelCategories;
        
        // Remove duplicates by name (keep first occurrence)
        const uniqueCategories = categoriesToUse.filter(
          (cat: any, index: number, self: any[]) =>
            index === self.findIndex((c: any) => c.name === cat.name)
        );
        
        const shuffledCategories = [...uniqueCategories].sort(() => Math.random() - 0.5);
        const nextCategories = shuffledCategories.slice(0, 6);
        setCategories(nextCategories);
        setClientCache(cacheKey, nextCategories, STORE_HOME_CACHE_TTL_MS);
      }
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchStats = async () => {
    const cacheKey = 'home:stats';
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        const nextStats = {
          products: data.count,
          customers: 1000,
          orders: 500,
        };
        setStats(nextStats);
        setClientCache(cacheKey, nextStats, STORE_HOME_CACHE_TTL_MS);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  useEffect(() => {
    const cachedFeaturedProducts = getClientCache<any[]>('home:featured-products');
    if (cachedFeaturedProducts) {
      setFeaturedProducts(cachedFeaturedProducts);
    }

    const cachedBestSellers = getClientCache<any[]>('home:best-sellers');
    if (cachedBestSellers) {
      setBestSellers(cachedBestSellers);
    }

    const cachedCategories = getClientCache<Array<{ name: string; id: string; slug: string; imageUrl?: string | null }>>('home:categories');
    if (cachedCategories) {
      setCategories(cachedCategories);
    }

    const cachedStats = getClientCache<{ products: number; customers: number; orders: number }>('home:stats');
    if (cachedStats) {
      setStats(cachedStats);
    }

    fetchFeaturedProducts();
    fetchBestSellers();
    fetchCategories();
    fetchStats();
  }, []);

  const handleQuickAdd = (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0],
      slug: product.slug,
      isDigital: product.isDigital,
      weight: product.weight || undefined,
    });
    setNotification({
      message: `${product.name} added to cart!`,
      visible: true,
    });
  };

  const handleNotificationClose = useCallback(() => {
    setNotification({ message: '', visible: false });
  }, []);

  const handleAddToCartRecommendations = (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0],
      slug: product.slug,
      isDigital: product.isDigital,
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
        onClose={handleNotificationClose}
      />
      <div className="bg-bg-gray">
        <HeroCarousel />
        {/* <StatsSection stats={stats} /> */} {/* Commented out temporarily */}
        <CategoryCarousel categories={categories} />
        <RecentlyViewedSection />
        <FeaturedProductsSection products={featuredProducts} onQuickAdd={handleQuickAdd} />
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
              excludeProductIds={bestSellers.map((product) => product.id)}
              onAddToCart={handleAddToCartRecommendations}
            />
          </div>
        </section>
        <FeaturesSection />
        <LatestBlogPostsSection />
      </div>
    </Layout>
  );
}
