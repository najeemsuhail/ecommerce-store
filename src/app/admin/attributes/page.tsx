'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';

interface Attribute {
  id: string;
  categoryId: string;
  name: string;
  type: string;
  filterable: boolean;
  _count?: { values: number };
}

interface Category {
  id: string;
  name: string;
}

const ATTRIBUTE_TYPES: { [key: string]: string } = {
  text: 'Text',
  number: 'Number',
  select: 'Select',
  multiselect: 'Multi-select',
  color: 'Color',
  size: 'Size'
};

export default function AttributesPage() {
  const router = useRouter();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchAttributes();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchAttributes();
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data.filter((cat: any) => !cat.parentId)); // Top-level only
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttributes = async () => {
    try {
      const url = selectedCategory
        ? `/api/admin/attributes?categoryId=${selectedCategory}`
        : '/api/admin/attributes';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch attributes');
      const data = await res.json();
      setAttributes(data);
    } catch (err) {
      setError('Failed to load attributes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteAttribute = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      const res = await fetch(`/api/admin/attributes/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchAttributes();
    } catch (err) {
      setError('Failed to delete attribute');
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <nav className="bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Attributes</h1>
            <p className="text-sm text-gray-600">Manage category-specific product attributes</p>
          </div>
          <Link
            href="/admin/attributes/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + New Attribute
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Loading attributes...</p>
          </div>
        ) : attributes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No attributes found</p>
            <Link
              href="/admin/attributes/new"
              className="text-blue-600 hover:underline"
            >
              Create your first attribute
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Filterable</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attributes.map(attr => (
                  <tr key={attr.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{attr.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{ATTRIBUTE_TYPES[attr.type] || attr.type}</td>
                    <td className="px-6 py-4 text-sm">
                      {attr.filterable ? (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Yes</span>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      <Link
                        href={`/admin/attributes/${attr.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteAttribute(attr.id)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
