'use client';

import { useEffect, useEffectEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

type ThemeKey = 'default' | 'minimal' | 'modern' | 'green';

type AdminStoreSettings = {
  id: string;
  storeName: string;
  domain: string | null;
  logoUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  footerDescription: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  themeKey: ThemeKey;
  codEnabled: boolean;
};

type StoreSettingsForm = {
  storeName: string;
  domain: string;
  logoUrl: string;
  seoTitle: string;
  seoDescription: string;
  footerDescription: string;
  contactEmail: string;
  contactPhone: string;
  themeKey: ThemeKey;
  codEnabled: boolean;
};

const EMPTY_FORM: StoreSettingsForm = {
  storeName: '',
  domain: '',
  logoUrl: '',
  seoTitle: '',
  seoDescription: '',
  footerDescription: '',
  contactEmail: '',
  contactPhone: '',
  themeKey: 'default',
  codEnabled: true,
};

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<AdminStoreSettings | null>(null);
  const [formData, setFormData] = useState<StoreSettingsForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const loadSettings = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    try {
      const response = await fetch('/api/admin/store-settings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 403) {
        setAuthError('Access denied. You are not authorized to manage store settings.');
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.error || 'Failed to load store settings.');
        return;
      }

      setSettings(data.settings);
      setFormData({
        storeName: data.settings.storeName || '',
        domain: data.settings.domain || '',
        logoUrl: data.settings.logoUrl || '',
        seoTitle: data.settings.seoTitle || '',
        seoDescription: data.settings.seoDescription || '',
        footerDescription: data.settings.footerDescription || '',
        contactEmail: data.settings.contactEmail || '',
        contactPhone: data.settings.contactPhone || '',
        themeKey: data.settings.themeKey || 'default',
        codEnabled: Boolean(data.settings.codEnabled),
      });
      setAuthError(null);
    } catch (error) {
      console.error('Error loading store settings:', error);
      setMessage('Failed to load store settings.');
    } finally {
      setLoading(false);
    }
  };

  const loadSettingsEvent = useEffectEvent(() => {
    void loadSettings();
  });

  useEffect(() => {
    loadSettingsEvent();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' && 'checked' in e.target ? e.target.checked : undefined;

    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/store-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.error || 'Failed to update store settings.');
        return;
      }

      setSettings(data.settings);
      setMessage('Store settings updated successfully.');
    } catch (error) {
      console.error('Error updating store settings:', error);
      setMessage('Failed to update store settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  if (authError) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white rounded-lg shadow p-8 max-w-md text-center">
            <h1 className="text-2xl font-bold mb-2 text-gray-900">{authError}</h1>
            <p className="text-gray-600">Please contact an administrator or log in with an admin account.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6 md:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
              <p className="text-sm text-gray-600 mt-2">
                Manage branding, SEO, contact details, theme, and checkout settings for{' '}
                {settings?.storeName || 'your store'}.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Branding</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Store Name</label>
                    <input
                      type="text"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleChange}
                      className="theme-form-input"
                      placeholder="OnlyInKani"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Theme</label>
                    <select
                      name="themeKey"
                      value={formData.themeKey}
                      onChange={handleChange}
                      className="theme-form-input"
                    >
                      <option value="default">Default</option>
                      <option value="minimal">Minimal</option>
                      <option value="modern">Modern</option>
                      <option value="green">Green</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Logo URL</label>
                    <input
                      type="text"
                      name="logoUrl"
                      value={formData.logoUrl}
                      onChange={handleChange}
                      className="theme-form-input"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Store Domain</label>
                    <input
                      type="text"
                      name="domain"
                      value={formData.domain}
                      onChange={handleChange}
                      className="theme-form-input"
                      placeholder="https://onlyinkani.in"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">SEO</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">SEO Title</label>
                    <input
                      type="text"
                      name="seoTitle"
                      value={formData.seoTitle}
                      onChange={handleChange}
                      className="theme-form-input"
                      placeholder="Store title for search results"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">SEO Description</label>
                    <textarea
                      name="seoDescription"
                      value={formData.seoDescription}
                      onChange={handleChange}
                      rows={3}
                      className="theme-form-input"
                      placeholder="Short search engine description"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Contact and Footer</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Email</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      className="theme-form-input"
                      placeholder="support@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Phone</label>
                    <input
                      type="text"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      className="theme-form-input"
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Footer Description</label>
                    <textarea
                      name="footerDescription"
                      value={formData.footerDescription}
                      onChange={handleChange}
                      rows={4}
                      className="theme-form-input"
                      placeholder="Short footer copy about the store"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Checkout</h2>
                <div className="rounded-xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">Cash on Delivery</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Turn COD on or off for checkout across the storefront.
                      </p>
                    </div>

                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="codEnabled"
                        className="sr-only peer"
                        checked={formData.codEnabled}
                        onChange={handleChange}
                      />
                      <div className="relative h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-emerald-500 peer-focus:outline-none after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5" />
                    </label>
                  </div>

                  <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    Current status:{' '}
                    <span className="font-semibold">{formData.codEnabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </section>

              {message && (
                <div
                  className={`rounded-lg px-4 py-3 text-sm ${
                    message.toLowerCase().includes('success')
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-block-primary-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
