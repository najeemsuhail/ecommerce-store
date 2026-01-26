'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';

interface Attribute {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  type: string;
  required: boolean;
  filterable: boolean;
  searchable: boolean;
  options: string[];
}

const ATTRIBUTE_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select (Single)' },
  { value: 'multiselect', label: 'Multi-select' },
  { value: 'color', label: 'Color' },
  { value: 'size', label: 'Size' }
];

export default function EditAttributePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [attribute, setAttribute] = useState<Attribute | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'text',
    required: false,
    filterable: true,
    searchable: false,
    options: '' // comma-separated
  });

  useEffect(() => {
    fetchAttribute();
  }, [params.id]);

  const fetchAttribute = async () => {
    try {
      const res = await fetch(`/api/admin/attributes/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch attribute');
      const data = await res.json();
      setAttribute(data);
      setFormData({
        name: data.name,
        slug: data.slug,
        type: data.type,
        required: data.required,
        filterable: data.filterable,
        searchable: data.searchable,
        options: data.options.join(', ')
      });
    } catch (err) {
      setError('Failed to load attribute');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/attributes/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          type: formData.type,
          required: formData.required,
          filterable: formData.filterable,
          searchable: formData.searchable,
          options: formData.options
            .split(',')
            .map(o => o.trim())
            .filter(Boolean)
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update attribute');
      }

      router.push('/admin/attributes');
    } catch (err: any) {
      setError(err.message || 'Failed to update attribute');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-600">Loading...</p>
      </div>
    </AdminLayout>
  );
  
  if (!attribute) return (
    <AdminLayout>
      <div className="flex items-center justify-center py-20">
        <p className="text-red-600">Attribute not found</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <nav className="bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Attribute</h1>
            <p className="text-sm text-gray-600">Update attribute settings</p>
          </div>
          <Link
            href="/admin/attributes"
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back to Attributes
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ATTRIBUTE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {['select', 'multiselect', 'size'].includes(formData.type) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Options (comma-separated) *
              </label>
              <input
                type="text"
                value={formData.options}
                onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                placeholder="Small, Medium, Large"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.required}
                onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Required</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.filterable}
                onChange={(e) => setFormData({ ...formData, filterable: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Filterable in store</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.searchable}
                onChange={(e) => setFormData({ ...formData, searchable: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Searchable</span>
            </label>
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              {saving ? 'Saving...' : 'Save Attribute'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
