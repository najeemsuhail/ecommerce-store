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

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; id: string; slug: string }>>([]);
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0 });
  const [notification, setNotification] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });
  const { totalItems, addItem } = useCart();

  useEffect(() => {
    fetchFeaturedProducts();
    fetchBestSellers();
    fetchCategories();
    fetchStats();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products?isFeatured=true');
      const data = await response.json();
      if (data.success) {
        setFeaturedProducts(data.products.slice(0, 8));
      }
    } catch (error) {
      console.error('Failed to fetch featured products');
    }
  };

  const fetchBestSellers = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        // Sort by average rating and take top 8
        const sorted = data.products
          .sort((a: any, b: any) => (b.averageRating || 0) - (a.averageRating || 0))
          .slice(0, 8);
        setBestSellers(sorted);
      }
    } catch (error) {
      console.error('Failed to fetch best sellers');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      if (Array.isArray(data)) {
        // Get top-level categories (no parent) for home page display
        const topLevelCategories = data
          .filter((cat: any) => !cat.parentId)
          .map((cat: any) => ({ name: cat.name, id: cat.id, slug: cat.slug }));
        
        // Remove duplicates by name (keep first occurrence)
        const uniqueCategories = topLevelCategories.filter(
          (cat: any, index: number, self: any[]) =>
            index === self.findIndex((c: any) => c.name === cat.name)
        );
        
        setCategories(uniqueCategories.slice(0, 6));
      }
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setStats({
          products: data.count,
          customers: 1000,
          orders: 500,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

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
        <LatestBlogPostsSection />
        <section className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <ProductRecommendations 
              limit={8}
              title="Trending Now"
              showTitle={true}
              onAddToCart={handleAddToCartRecommendations}
            />
          </div>
        </section>
        <FeaturesSection />
      </div>
    </Layout>
  );
}