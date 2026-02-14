'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children: Category[];
}

export default function CategoryBrowser() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const renderCategory = (category: Category, level: number = 0) => (
    <div key={category.id}>
      <div
        className="flex items-center gap-2 py-2 px-3 hover:bg-gray-100 rounded cursor-pointer"
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        {category.children.length > 0 && (
          <button
            onClick={() => toggleExpand(category.id)}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            {expandedIds.has(category.id) ? '▼' : '▶'}
          </button>
        )}
        {category.children.length === 0 && <span className="w-4" />}
        <Link
          href={`/products?category=${encodeURIComponent(category.name)}`}
          className="text-gray-700 hover:text-blue-600 flex-1"
        >
          {category.name}
        </Link>
      </div>
      {expandedIds.has(category.id) && category.children.length > 0 && (
        <div>
          {category.children.map((child) => renderCategory(child, level + 1))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Loading categories...</div>;
  }

  if (categories.length === 0) {
    return <div className="text-center py-4 text-gray-500">No categories available</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
      <div className="space-y-1">
        {categories
          .filter((cat) => !cat.parentId)
          .map((cat) => renderCategory(cat))}
      </div>
    </div>
  );
}
