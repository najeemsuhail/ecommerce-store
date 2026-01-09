'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [product, setProduct] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    isDigital: false,
    stock: '',
    sku: '',
    trackInventory: true,
    images: [''],
    category: '',
    tags: '',
    brand: '',
    weight: '',
    slug: '',
    metaTitle: '',
    metaDescription: '',
    isFeatured: false,
    isActive: true,
    specifications: '{}',
  });

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/admin/products?search=${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success && data.products.length > 0) {
        const prod = data.products.find((p: any) => p.id === params.id);
        if (prod) {
          setProduct(prod);
          setFormData({
            name: prod.name,
            description: prod.description,
            price: prod.price.toString(),
            comparePrice: prod.comparePrice?.toString() || '',
            isDigital: prod.isDigital,
            stock: prod.stock?.toString() || '',
            sku: prod.sku || '',
            trackInventory: prod.trackInventory,
            images: prod.images.length > 0 ? prod.images : [''],
            category: prod.category || '',
            tags: prod.tags.join(', '),
            brand: prod.brand || '',
            weight: prod.weight?.toString() || '',
            slug: prod.slug,
            metaTitle: prod.metaTitle || '',
            metaDescription: prod.metaDescription || '',
            isFeatured: prod.isFeatured,
            isActive: prod.isActive,
            specifications: prod.specifications ? JSON.stringify(prod.specifications, null, 2) : '{}',
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const token = localStorage.getItem('token');

    try {
      let specs;
      try {
        specs = formData.specifications ? JSON.parse(formData.specifications) : null;
      } catch (error) {
        setMessage('Invalid JSON format in specifications');
        setSaving(false);
        return;
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
        isDigital: formData.isDigital,
        stock: formData.stock ? parseInt(formData.stock) : null,
        sku: formData.sku || null,
        trackInventory: formData.trackInventory,
        images: formData.images.filter((img) => img.trim() !== ''),
        category: formData.category || null,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
        brand: formData.brand || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        slug: formData.slug,
        metaTitle: formData.metaTitle || null,
        metaDescription: formData.metaDescription || null,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        specifications: specs,
      };

      const response = await fetch(`/api/products/${product.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Product updated successfully!');
        router.push('/admin/products');
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const addImageField = () => {
    setFormData({
      ...formData,
      images: [...formData.images, ''],
    });
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Product not found</p>
          <Link href="/admin/products" className="text-blue-600 hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/admin" className="text-2xl font-bold text-blue-600">
              Admin Panel
            </Link>
            <div className="flex gap-4">
              <Link href="/admin" className="text-gray-600 hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/admin/products" className="font-semibold text-blue-600">
                Products
              </Link>
              <Link href="/admin/orders" className="text-gray-600 hover:text-blue-600">
                Orders
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <Link
            href="/admin/products"
            className="text-blue-600 hover:underline"
          >
            ← Back to Products
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Same form fields as Add Product - copy from above */}
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Pricing</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Compare Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.comparePrice}
                  onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Inventory</h2>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDigital"
                checked={formData.isDigital}
                onChange={(e) => setFormData({ ...formData, isDigital: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isDigital" className="text-sm font-medium">
                Digital Product
              </label>
            </div>

            {!formData.isDigital && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Product Images</h2>

            {formData.images.map((image, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => updateImage(index, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.images.length > 1 && (
                  <button
                    type="button"onClick={() => removeImage(index)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addImageField}
              className="text-blue-600 hover:underline text-sm"
            >
              + Add Another Image
            </button>
          </div>

          {/* Organization */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Organization</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isFeatured" className="text-sm font-medium">
                  Featured Product
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Active
                </label>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Specifications (JSON)</h2>

            <div>
              <textarea
                rows={6}
                value={formData.specifications}
                onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                JSON format: {`{"key": "value", "key2": "value2"}`}
              </p>
            </div>
          </div>

          {/* SEO */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">SEO (Optional)</h2>

            <div>
              <label className="block text-sm font-medium mb-1">
                Meta Title
              </label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Meta Description
              </label>
              <textarea
                rows={2}
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {message && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
              {message}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href="/admin/products"
              className="px-6 py-3 border rounded-lg hover:bg-gray-50 font-semibold text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}