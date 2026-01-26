'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children: Category[];
  _count: { products: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      setError('Failed to load categories');
      console.error(err);
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

  const deleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete category');
      await fetchCategories();
    } catch (err) {
      setError('Failed to delete category');
      console.error(err);
    }
  };

  const renderCategory = (category: Category, level: number = 0) => (
    <div key={category.id} className="border-l-2 border-gray-200">
      <div
        className="flex items-center justify-between p-3 hover:bg-gray-50"
        style={{ paddingLeft: `${level * 20 + 12}px` }}
      >
        <div className="flex items-center gap-3 flex-1">
          {category.children.length > 0 && (
            <button
              onClick={() => toggleExpand(category.id)}
              className="text-gray-500 hover:text-gray-700"
            >
              {expandedIds.has(category.id) ? '▼' : '▶'}
            </button>
          )}
          {category.children.length === 0 && <span className="w-5" />}
          <div>
            <h3 className="font-medium text-gray-900">{category.name}</h3>
            <p className="text-sm text-gray-500">{category._count.products} products</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/categories/${category.id}`}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit
          </Link>
          <button
            onClick={() => deleteCategory(category.id)}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
      {expandedIds.has(category.id) && category.children.length > 0 && (
        <div>
          {category.children.map((child) => renderCategory(child, level + 1))}
        </div>
      )}
    </div>
  );

  return (
    <AdminLayout>
      <nav className="bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-sm text-gray-600">Manage your product categories</p>
          </div>
          <Link
            href="/admin/categories/new"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            New Category
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No categories yet. Create your first category to get started.</p>
            <Link
              href="/admin/categories/new"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Create Category
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {categories
              .filter((cat) => !cat.parentId)
              .map((cat) => renderCategory(cat))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
