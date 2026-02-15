'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      if (Array.isArray(data)) {
        // Filter out child categories, show only top-level
        const topLevel = data.filter((cat: any) => !cat.parentId);
        setCategories(topLevel);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                All Categories
              </span>
            </h1>
            <p className="text-base md:text-xl text-gray-600">Browse all available product categories</p>
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <p className="text-gray-600">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">No categories available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/products?category=${encodeURIComponent(category.name)}`}
                  className="group relative overflow-hidden rounded-2xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-2xl transform hover:-translate-y-2"
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <pattern id={`pattern-${index}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                          <circle cx="10" cy="10" r="2" fill="white" />
                        </pattern>
                      </defs>
                      <rect width="100" height="100" fill={`url(#pattern-${index})`} />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="relative px-4 py-8 md:px-8 md:py-12 text-center flex flex-col items-center justify-center min-h-28 md:min-h-32">
                    <h3 className="font-bold text-base md:text-lg lg:text-2xl text-white group-hover:scale-105 transition-transform duration-300 line-clamp-3">
                      {category.name}
                    </h3>
                    <div className="mt-2 md:mt-4 text-white/80 group-hover:text-white transition-colors text-xs md:text-sm font-semibold">
                      Browse →
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                </Link>
              ))}
            </div>
          )}

          {/* Back to Home */}
          <div className="mt-16 text-center">
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
