'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CategoryBreadcrumbProps {
  categoryIds?: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parent?: Category;
}

export default function CategoryBreadcrumb({ categoryIds = [] }: CategoryBreadcrumbProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (categoryIds.length === 0) {
      setLoading(false);
      return;
    }

    fetchCategories();
  }, [categoryIds]);

  const fetchCategories = async () => {
    try {
      // Fetch all categories
      const res = await fetch('/api/admin/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const allCategories = await res.json();

      // Get categories that match the provided IDs
      const selectedCats = allCategories.filter((cat: any) =>
        categoryIds.includes(cat.id)
      );
      
      setCategories(selectedCats);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Build breadcrumb path for a category
  const getBreadcrumbPath = (categoryId: string, allCategories: Category[]): string[] => {
    const path: string[] = [];
    let currentId: string | null = categoryId;

    while (currentId) {
      const cat = allCategories.find(c => c.id === currentId);
      if (!cat) break;
      path.unshift(cat.name);
      currentId = cat.parentId;
    }

    return path;
  };

  if (loading || categories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Categories</h3>
      <div className="space-y-2">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${encodeURIComponent(cat.name)}`}
            className="inline-block px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
