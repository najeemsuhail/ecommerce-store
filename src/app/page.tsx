'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import Layout from '@/components/Layout';
import AddToCartNotification from '@/components/AddToCartNotification';
import ProductCarousel from '@/components/ProductCarousel';
import HeroSection from '@/components/HeroSection';
import StatsSection from '@/components/StatsSection';
import CategoriesSection from '@/components/CategoriesSection';
import FeaturedProductsSection from '@/components/FeaturedProductsSection';
import FeaturesSection from '@/components/FeaturesSection';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
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
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        const uniqueCategories = Array.from(
          new Set(data.products.map((p: any) => p.category).filter(Boolean))
        ) as string[];
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
        onClose={() => setNotification({ ...notification, visible: false })}
      />
      <div className="bg-bg-gray">
        <HeroSection />
        <StatsSection stats={stats} />
        <CategoriesSection categories={categories} />
        <FeaturedProductsSection products={featuredProducts} onQuickAdd={handleQuickAdd} />
        {bestSellers.length > 0 && (
          <ProductCarousel
            products={bestSellers}
            title="Best Sellers"
            description="Most popular products loved by our customers"
          />
        )}
        <FeaturesSection />
      </div>
    </Layout>
  );
}