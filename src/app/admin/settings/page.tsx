'use client';

import { useEffect, useEffectEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

type ThemeKey = 'default' | 'minimal' | 'modern' | 'green';

type ProductOption = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images?: string[];
};

type AdminStoreSettings = {
  id: string;
  storeName: string;
  storeAbbreviation: string | null;
  domain: string | null;
  logoUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  footerDescription: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  themeKey: ThemeKey;
  codEnabled: boolean;
  homeBestSellerProductIds: string[];
  homeTrendingProductIds: string[];
  heroSlides?: unknown;
  landingPage?: unknown;
  socialLinks?: unknown;
  footerHighlights?: unknown;
};

type StoreSettingsForm = {
  storeName: string;
  storeAbbreviation: string;
  domain: string;
  logoUrl: string;
  seoTitle: string;
  seoDescription: string;
  footerDescription: string;
  contactEmail: string;
  contactPhone: string;
  themeKey: ThemeKey;
  codEnabled: boolean;
  homeBestSellerProductIds: string[];
  homeTrendingProductIds: string[];
  heroSlidesJson: string;
  landingPageJson: string;
  socialLinksJson: string;
  footerHighlightsJson: string;
};

type ProductSearchState = {
  query: string;
  results: ProductOption[];
  loading: boolean;
};

const EMPTY_FORM: StoreSettingsForm = {
  storeName: '',
  storeAbbreviation: '',
  domain: '',
  logoUrl: '',
  seoTitle: '',
  seoDescription: '',
  footerDescription: '',
  contactEmail: '',
  contactPhone: '',
  themeKey: 'default',
  codEnabled: true,
  homeBestSellerProductIds: [],
  homeTrendingProductIds: [],
  heroSlidesJson: '[]',
  landingPageJson: '{}',
  socialLinksJson: '[]',
  footerHighlightsJson: '[]',
};

const EMPTY_SEARCH: ProductSearchState = {
  query: '',
  results: [],
  loading: false,
};

function formatJson(value: unknown) {
  return JSON.stringify(value ?? [], null, 2);
}

function ProductPickerSection({
  title,
  description,
  query,
  results,
  loading,
  selectedProducts,
  onQueryChange,
  onAddProduct,
  onRemoveProduct,
  onMoveProduct,
}: {
  title: string;
  description: string;
  query: string;
  results: ProductOption[];
  loading: boolean;
  selectedProducts: ProductOption[];
  onQueryChange: (value: string) => void;
  onAddProduct: (product: ProductOption) => void;
  onRemoveProduct: (productId: string) => void;
  onMoveProduct: (productId: string, direction: 'up' | 'down') => void;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>

      <div className="space-y-3">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="theme-form-input"
          placeholder="Search products by name"
        />

        {query.trim() && (
          <div className="rounded-lg border border-slate-200 bg-slate-50">
            {loading ? (
              <div className="px-4 py-3 text-sm text-slate-500">Searching...</div>
            ) : results.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {results.map((product) => (
                  <div key={product.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 truncate">{product.name}</div>
                      <div className="text-xs text-slate-500 truncate">/{product.slug}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAddProduct(product)}
                      className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-slate-500">No matching products found.</div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200">
        <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
          Selected products
        </div>
        {selectedProducts.length === 0 ? (
          <div className="px-4 py-4 text-sm text-slate-500">No products selected.</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {selectedProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-400">#{index + 1}</div>
                  <div className="font-medium text-slate-900 truncate">{product.name}</div>
                  <div className="text-xs text-slate-500 truncate">/{product.slug}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onMoveProduct(product.id, 'up')}
                    disabled={index === 0}
                    className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-40"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveProduct(product.id, 'down')}
                    disabled={index === selectedProducts.length - 1}
                    className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-40"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveProduct(product.id)}
                    className="rounded border border-red-200 px-2 py-1 text-xs text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<AdminStoreSettings | null>(null);
  const [formData, setFormData] = useState<StoreSettingsForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [bestSellerSearch, setBestSellerSearch] = useState<ProductSearchState>(EMPTY_SEARCH);
  const [trendingSearch, setTrendingSearch] = useState<ProductSearchState>(EMPTY_SEARCH);
  const [bestSellerProducts, setBestSellerProducts] = useState<ProductOption[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<ProductOption[]>([]);

  const getToken = () => localStorage.getItem('token');

  const fetchProductsByIds = async (ids: string[]): Promise<ProductOption[]> => {
    if (ids.length === 0) {
      return [];
    }

    const response = await fetch(`/api/products?ids=${encodeURIComponent(ids.join(','))}`);
    const data = await response.json();
    return data.success ? (data.products ?? []) : [];
  };

  const searchProducts = async (query: string): Promise<ProductOption[]> => {
    if (!query.trim()) {
      return [];
    }

    const response = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=8`);
    const data = await response.json();
    return data.success ? (data.products ?? []) : [];
  };

  const loadSettings = async () => {
    const token = getToken();
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
        storeAbbreviation: data.settings.storeAbbreviation || '',
        domain: data.settings.domain || '',
        logoUrl: data.settings.logoUrl || '',
        seoTitle: data.settings.seoTitle || '',
        seoDescription: data.settings.seoDescription || '',
        footerDescription: data.settings.footerDescription || '',
        contactEmail: data.settings.contactEmail || '',
        contactPhone: data.settings.contactPhone || '',
        themeKey: data.settings.themeKey || 'default',
        codEnabled: Boolean(data.settings.codEnabled),
        homeBestSellerProductIds: data.settings.homeBestSellerProductIds || [],
        homeTrendingProductIds: data.settings.homeTrendingProductIds || [],
        heroSlidesJson: formatJson(data.settings.heroSlides),
        landingPageJson: JSON.stringify(data.settings.landingPage ?? {}, null, 2),
        socialLinksJson: formatJson(data.settings.socialLinks),
        footerHighlightsJson: formatJson(data.settings.footerHighlights),
      });

      const [selectedBestSellers, selectedTrending] = await Promise.all([
        fetchProductsByIds(data.settings.homeBestSellerProductIds || []),
        fetchProductsByIds(data.settings.homeTrendingProductIds || []),
      ]);

      setBestSellerProducts(selectedBestSellers);
      setTrendingProducts(selectedTrending);
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

  const updateSearch = async (
    kind: 'best' | 'trending',
    query: string
  ) => {
    const setter = kind === 'best' ? setBestSellerSearch : setTrendingSearch;

    setter((current) => ({ ...current, query, loading: Boolean(query.trim()) }));

    if (!query.trim()) {
      setter({ query: '', results: [], loading: false });
      return;
    }

    try {
      const results = await searchProducts(query);
      setter({ query, results, loading: false });
    } catch (error) {
      console.error('Error searching products:', error);
      setter({ query, results: [], loading: false });
    }
  };

  const addProductToSection = (
    kind: 'best' | 'trending',
    product: ProductOption
  ) => {
    if (kind === 'best') {
      if (formData.homeBestSellerProductIds.includes(product.id)) {
        return;
      }
      setFormData((current) => ({
        ...current,
        homeBestSellerProductIds: [...current.homeBestSellerProductIds, product.id],
      }));
      setBestSellerProducts((current) => [...current, product]);
    } else {
      if (formData.homeTrendingProductIds.includes(product.id)) {
        return;
      }
      setFormData((current) => ({
        ...current,
        homeTrendingProductIds: [...current.homeTrendingProductIds, product.id],
      }));
      setTrendingProducts((current) => [...current, product]);
    }
  };

  const removeProductFromSection = (kind: 'best' | 'trending', productId: string) => {
    if (kind === 'best') {
      setFormData((current) => ({
        ...current,
        homeBestSellerProductIds: current.homeBestSellerProductIds.filter((id) => id !== productId),
      }));
      setBestSellerProducts((current) => current.filter((product) => product.id !== productId));
    } else {
      setFormData((current) => ({
        ...current,
        homeTrendingProductIds: current.homeTrendingProductIds.filter((id) => id !== productId),
      }));
      setTrendingProducts((current) => current.filter((product) => product.id !== productId));
    }
  };

  const moveProductInSection = (
    kind: 'best' | 'trending',
    productId: string,
    direction: 'up' | 'down'
  ) => {
    const updateOrder = (ids: string[]) => {
      const index = ids.indexOf(productId);
      if (index === -1) {
        return ids;
      }

      const nextIndex = direction === 'up' ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= ids.length) {
        return ids;
      }

      const nextIds = [...ids];
      [nextIds[index], nextIds[nextIndex]] = [nextIds[nextIndex], nextIds[index]];
      return nextIds;
    };

    const reorderProducts = (products: ProductOption[]) => {
      const index = products.findIndex((product) => product.id === productId);
      if (index === -1) {
        return products;
      }

      const nextIndex = direction === 'up' ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= products.length) {
        return products;
      }

      const nextProducts = [...products];
      [nextProducts[index], nextProducts[nextIndex]] = [nextProducts[nextIndex], nextProducts[index]];
      return nextProducts;
    };

    if (kind === 'best') {
      setFormData((current) => ({
        ...current,
        homeBestSellerProductIds: updateOrder(current.homeBestSellerProductIds),
      }));
      setBestSellerProducts((current) => reorderProducts(current));
    } else {
      setFormData((current) => ({
        ...current,
        homeTrendingProductIds: updateOrder(current.homeTrendingProductIds),
      }));
      setTrendingProducts((current) => reorderProducts(current));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      router.push('/auth');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      let heroSlides: unknown;
      let landingPage: unknown;
      let socialLinks: unknown;
      let footerHighlights: unknown;

      try {
        heroSlides = JSON.parse(formData.heroSlidesJson || '[]');
        landingPage = JSON.parse(formData.landingPageJson || '{}');
        socialLinks = JSON.parse(formData.socialLinksJson || '[]');
        footerHighlights = JSON.parse(formData.footerHighlightsJson || '[]');
      } catch {
        setMessage('One of the JSON fields is invalid. Please correct it and try again.');
        return;
      }

      const response = await fetch('/api/admin/store-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          heroSlides,
          landingPage,
          socialLinks,
          footerHighlights,
        }),
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
                Manage branding, SEO, contact details, theme, checkout, and home page product sections for{' '}
                {settings?.storeName || 'your store'}.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Branding</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Store Name</label>
                    <input type="text" name="storeName" value={formData.storeName} onChange={handleChange} className="theme-form-input" placeholder="OnlyInKani" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Store Abbreviation</label>
                    <input
                      type="text"
                      name="storeAbbreviation"
                      value={formData.storeAbbreviation}
                      onChange={handleChange}
                      className="theme-form-input"
                      placeholder="OINK"
                      maxLength={6}
                    />
                    <p className="mt-1 text-xs text-gray-500">Used as the order ID prefix. Letters and numbers only, uppercase, max 6 characters.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Theme</label>
                    <select name="themeKey" value={formData.themeKey} onChange={handleChange} className="theme-form-input">
                      <option value="default">Default</option>
                      <option value="minimal">Minimal</option>
                      <option value="modern">Modern</option>
                      <option value="green">Green</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Logo URL</label>
                    <input type="text" name="logoUrl" value={formData.logoUrl} onChange={handleChange} className="theme-form-input" placeholder="https://example.com/logo.png" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Store Domain</label>
                    <input type="text" name="domain" value={formData.domain} onChange={handleChange} className="theme-form-input" placeholder="https://onlyinkani.in" />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">SEO</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">SEO Title</label>
                    <input type="text" name="seoTitle" value={formData.seoTitle} onChange={handleChange} className="theme-form-input" placeholder="Store title for search results" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">SEO Description</label>
                    <textarea name="seoDescription" value={formData.seoDescription} onChange={handleChange} rows={3} className="theme-form-input" placeholder="Short search engine description" />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Contact and Footer</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Email</label>
                    <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="theme-form-input" placeholder="support@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Phone</label>
                    <input type="text" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="theme-form-input" placeholder="+91 9876543210" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Footer Description</label>
                    <textarea name="footerDescription" value={formData.footerDescription} onChange={handleChange} rows={4} className="theme-form-input" placeholder="Short footer copy about the store" />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Advanced Content</h2>
                <p className="text-sm text-gray-600">
                  Edit storefront-managed content for the homepage, landing page, and footer with JSON.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Hero Slides JSON</label>
                    <textarea
                      name="heroSlidesJson"
                      value={formData.heroSlidesJson}
                      onChange={handleChange}
                      rows={10}
                      className="theme-form-input font-mono text-xs"
                      placeholder='[{"badge":"New","badgeEmoji":"✨","category":"Collection","mainHeading":"Heading","subHeading":"Sub heading","description":"Copy","primaryCTA":{"label":"Shop Now","href":"/products"},"secondaryCTA":{"label":"View More","href":"/collections"},"image":{"src":"https://...","alt":"Hero"}}]'
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Landing Page JSON</label>
                    <textarea
                      name="landingPageJson"
                      value={formData.landingPageJson}
                      onChange={handleChange}
                      rows={14}
                      className="theme-form-input font-mono text-xs"
                      placeholder='{"badge":"OnlyInKani","title":"Landing headline","description":"Short campaign copy","primaryCTA":{"label":"Shop Products","href":"/products"},"secondaryCTA":{"label":"Talk to Us","href":"/contact"},"audiencePillars":[{"title":"Curated Picks","description":"..."},{"title":"Fast Support","description":"..."},{"title":"Flexible Checkout","description":"..."}],"steps":[{"title":"Explore Collections","description":"...","label":"View Categories","href":"/categories"}],"promoCards":[{"eyebrow":"Featured","title":"Show premium picks","description":"...","label":"Open Featured","href":"/products?isFeatured=true"}]}'
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Social Links JSON</label>
                    <textarea
                      name="socialLinksJson"
                      value={formData.socialLinksJson}
                      onChange={handleChange}
                      rows={6}
                      className="theme-form-input font-mono text-xs"
                      placeholder='[{"platform":"instagram","url":"https://instagram.com/yourstore","label":"Instagram"}]'
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Footer Highlights JSON</label>
                    <textarea
                      name="footerHighlightsJson"
                      value={formData.footerHighlightsJson}
                      onChange={handleChange}
                      rows={6}
                      className="theme-form-input font-mono text-xs"
                      placeholder='[{"icon":"🚚","title":"Fast Delivery","description":"Across India"}]'
                    />
                  </div>
                </div>
              </section>

              <ProductPickerSection
                title="Home Best Sellers"
                description="Choose the exact products to show in the Best Sellers section. If left empty, the store uses the automatic bestseller logic."
                query={bestSellerSearch.query}
                results={bestSellerSearch.results.filter((product) => !formData.homeBestSellerProductIds.includes(product.id))}
                loading={bestSellerSearch.loading}
                selectedProducts={bestSellerProducts}
                onQueryChange={(value) => void updateSearch('best', value)}
                onAddProduct={(product) => addProductToSection('best', product)}
                onRemoveProduct={(productId) => removeProductFromSection('best', productId)}
                onMoveProduct={(productId, direction) => moveProductInSection('best', productId, direction)}
              />

              <ProductPickerSection
                title="Home Trending"
                description="Choose the exact products to show in the Trending section. If left empty, the store uses the automatic trending logic."
                query={trendingSearch.query}
                results={trendingSearch.results.filter((product) => !formData.homeTrendingProductIds.includes(product.id))}
                loading={trendingSearch.loading}
                selectedProducts={trendingProducts}
                onQueryChange={(value) => void updateSearch('trending', value)}
                onAddProduct={(product) => addProductToSection('trending', product)}
                onRemoveProduct={(productId) => removeProductFromSection('trending', productId)}
                onMoveProduct={(productId, direction) => moveProductInSection('trending', productId, direction)}
              />

              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Checkout</h2>
                <div className="rounded-xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">Cash on Delivery</h3>
                      <p className="text-sm text-gray-600 mt-1">Turn COD on or off for checkout across the storefront.</p>
                    </div>

                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="codEnabled" className="sr-only peer" checked={formData.codEnabled} onChange={handleChange} />
                      <div className="relative h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-emerald-500 peer-focus:outline-none after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5" />
                    </label>
                  </div>

                  <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    Current status: <span className="font-semibold">{formData.codEnabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </section>

              {message && (
                <div className={`rounded-lg px-4 py-3 text-sm ${message.toLowerCase().includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {message}
                </div>
              )}

              <div className="flex justify-end">
                <button type="submit" disabled={saving} className="btn-block-primary-md disabled:opacity-50 disabled:cursor-not-allowed">
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
