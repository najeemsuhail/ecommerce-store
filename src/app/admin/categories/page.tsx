'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

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
      // Auto-expand all parent categories
      const autoExpanded = new Set<string>();
      const expandAll = (cats: Category[]) => {
        cats.forEach((cat) => {
          if (cat.children && Array.isArray(cat.children) && cat.children.length > 0) {
            autoExpanded.add(cat.id);
            expandAll(cat.children);
          }
        });
      };
      expandAll(data);
      setExpandedIds(autoExpanded);
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    newExpanded.has(id) ? newExpanded.delete(id) : newExpanded.add(id);
    setExpandedIds(newExpanded);
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchCategories();
    } catch (err) {
      setError('Delete failed');
      console.error(err);
    }
  };

  const renderCategory = (category: Category, level: number = 0) => (
    <div key={category.id}>
      <div
        className="flex items-center justify-between p-3 hover:bg-gray-50 border-b"
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        <div className="flex items-center gap-3 flex-1">
          {category.children && category.children.length > 0 && (
            <button
              onClick={() => toggleExpand(category.id)}
              className="text-gray-500 hover:text-gray-700 w-5 text-center"
            >
              <FontAwesomeIcon
                icon={expandedIds.has(category.id) ? faChevronUp : faChevronDown}
                className="w-4 h-4"
              />
            </button>
          )}
          {!category.children || category.children.length === 0 && <span className="w-5" />}
          <div>
            <p className="font-medium text-gray-900">{category.name}</p>
            <p className="text-xs text-gray-500">{category._count?.products ?? 0} products</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/categories/${category.id}`}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
            title="Edit"
          >
            <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
          </Link>
          <button
            onClick={() => deleteCategory(category.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
            title="Delete"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      </div>
      {expandedIds.has(category.id) && category.children && category.children.length > 0 && (
        <div>
          {category.children.map((child) => renderCategory(child, level + 1))}
        </div>
      )}
    </div>
  );

  return (
    <AdminLayout>
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-sm text-gray-600">Manage product categories</p>
          </div>
          <Link
            href="/admin/categories/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
            New Category
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No categories. Create your first one.</p>
            <Link
              href="/admin/categories/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              Create Category
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            {categories
              .filter((cat) => !cat.parentId)
              .map((cat) => renderCategory(cat))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
