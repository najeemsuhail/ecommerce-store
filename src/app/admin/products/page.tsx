'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import ProductImporter from '@/components/ProductImporter';

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [showImporter, setShowImporter] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 10;

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    scrollToTop();
  };

  useEffect(() => {
    fetchProducts();

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      fetchProducts();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [searchTerm, currentPage]);

  const fetchProducts = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    try {
      let url = '/api/admin/products';
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      params.append('skip', String((currentPage - 1) * productsPerPage));
      params.append('limit', String(productsPerPage));
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 403) {
        setAuthError('Access denied. Admin only.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setAuthError('Failed to load products. Please refresh.');
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
        setTotalProducts(data.total || data.products.length);
        setAuthError(null);
      } else {
        setAuthError('Failed to load products.');
      }
    } catch (error) {
      console.error('Error:', error);
      setAuthError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Delete "${productName}"? This cannot be undone.`)) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setMessage('✓ Product deleted successfully');
        setTimeout(() => setMessage(''), 3000);
        fetchProducts();
      } else {
        setMessage(`✗ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('✗ Failed to delete product');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) {
      setMessage('✗ Please select products to delete');
      return;
    }

    const count = selectedProducts.size;
    if (!confirm(`Delete ${count} product(s)? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/admin/products/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productIds: Array.from(selectedProducts),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage(`✓ ${data.message}`);
        setSelectedProducts(new Set());
        setTimeout(() => setMessage(''), 3000);
        fetchProducts();
      } else {
        setMessage(`✗ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('✗ Failed to delete products');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map((p) => p.id)));
    }
  };

  const toggleActive = async (product: any) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/products/${product.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...product,
          isActive: !product.isActive,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage(`✓ Product ${!product.isActive ? 'activated' : 'deactivated'}`);
        setTimeout(() => setMessage(''), 2500);
        fetchProducts();
      }
    } catch (error) {
      setMessage('✗ Failed to update product');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl">Loading products...</p>
        </div>
      </AdminLayout>
    );
  }

  if (authError) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-light-theme rounded-lg shadow p-8 max-w-md text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900">{authError}</h1>
            <p className="text-gray-600 mb-6">Please contact an administrator or try logging in again.</p>
            <Link 
              href="/" 
              className="btn-block-primary-md"
            >
              Back to Store
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
   <AdminLayout>  
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Message Alert */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes('✗')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        {/* Header with Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📦 Products Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your product inventory, categories, and attributes</p>
            </div>
            <Link
              href="/admin/products/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
            >
              + Add New Product
            </Link>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              href="/admin/categories"
              className="p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-center"
            >
              <div className="text-lg mb-1">📁</div>
              <div className="text-xs font-medium text-gray-700">Manage Categories</div>
            </Link>
            <Link
              href="/admin/attributes"
              className="p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-center"
            >
              <div className="text-lg mb-1">🎯</div>
              <div className="text-xs font-medium text-gray-700">Manage Attributes</div>
            </Link>
            <button
              onClick={() => setShowImporter(!showImporter)}
              className="p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-center"
            >
              <div className="text-lg mb-1">📥</div>
              <div className="text-xs font-medium text-gray-700">Import Products</div>
            </button>
            <Link
              href="/"
              className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-center"
            >
              <div className="text-lg mb-1">👁️</div>
              <div className="text-xs font-medium text-gray-700">View Store</div>
            </Link>
          </div>
        </div>

        {/* Product Importer */}
        {showImporter && (
          <div className="mb-8">
            <ProductImporter />
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {products.length === 0 && searchTerm && (
            <p className="text-sm text-gray-600 mt-2">No products found matching "{searchTerm}"</p>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {selectedProducts.size > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedProducts.size === products.length && products.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700">
                {selectedProducts.size} product(s) selected
              </span>
            </div>
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-sm transition-colors"
            >
              {isDeleting ? 'Deleting...' : '🗑️ Delete Selected'}
            </button>
          </div>
        )}

        {/* Products Table */}
        {products.length === 0 ? (
          <div className="bg-light-theme rounded-lg shadow p-8 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first product</p>
            <Link
              href="/admin/products/new"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Product
            </Link>
          </div>
        ) : (
          <div className="bg-light-theme rounded-lg shadow overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
                      <input
                        type="checkbox"
                        checked={selectedProducts.size === products.length && products.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Sales
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product) => (
                    <tr key={product.id} className={`hover:bg-gray-50 ${selectedProducts.has(product.id) ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.id)}
                          onChange={() => toggleProduct(product.id)}
                          className="w-4 h-4 rounded cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0">
                            {product.images?.[0] && (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover rounded"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold">₹{product.price}</p>
                        {product.comparePrice && (
                          <p className="text-xs text-gray-500 line-through">
                            ₹{product.comparePrice}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {product.isDigital ? (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Digital
                          </span>
                        ) : (
                          <span
                            className={`text-sm font-semibold ${
                              product.stock > 10
                                ? 'text-green-600'
                                : product.stock > 0
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}
                          >
                            {product.stock || 0}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(product)}
                          className={`text-xs px-3 py-1 rounded font-medium ${
                            product.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          } transition-colors`}
                        >
                          {product.isActive ? '✓ Active' : '○ Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {product._count.orderItems} sold
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/products/edit/${product.id}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline text-xs font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="text-red-600 hover:text-red-800 hover:underline text-xs font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white border rounded-lg p-4 space-y-3">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0">
                      {product.images?.[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover rounded"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500 mb-2">{product.sku}</p>
                      <p className="font-semibold text-sm">₹{product.price}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-gray-500 text-xs">Stock</div>
                      <div className="font-bold text-gray-900">
                        {product.isDigital ? 'Digital' : (product.stock || 0)}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-gray-500 text-xs">Status</div>
                      <div className="font-bold">
                        {product.isActive ? '✓' : '○'}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-gray-500 text-xs">Sold</div>
                      <div className="font-bold text-gray-900">{product._count.orderItems}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <button
                      onClick={() => toggleActive(product)}
                      className={`flex-1 py-2 rounded text-xs font-medium transition-colors ${
                        product.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {product.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <Link
                      href={`/admin/products/edit/${product.id}`}
                      className="flex-1 py-2 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 text-center transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="flex-1 py-2 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalProducts > productsPerPage && (
              <div className="mt-8 flex justify-center items-center gap-2 px-4 pb-4">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  ← Previous
                </button>
                
                <div className="flex gap-1">
                  {[...Array(Math.ceil(totalProducts / productsPerPage))].map((_, i) => {
                    const pageNum = i + 1;
                    const maxPagesToShow = 5;
                    const halfWindow = Math.floor(maxPagesToShow / 2);
                    
                    const showPage = 
                      pageNum === 1 || 
                      pageNum === Math.ceil(totalProducts / productsPerPage) ||
                      (pageNum >= currentPage - halfWindow && pageNum <= currentPage + halfWindow);
                    
                    if (!showPage && i !== 0 && i !== Math.ceil(totalProducts / productsPerPage) - 1) {
                      if (i === 1 || i === Math.ceil(totalProducts / productsPerPage) - 2) {
                        return <span key={`ellipsis-${i}`} className="px-2">...</span>;
                      }
                      return null;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg transition-colors font-medium ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(Math.min(Math.ceil(totalProducts / productsPerPage), currentPage + 1))}
                  disabled={currentPage === Math.ceil(totalProducts / productsPerPage)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Next →
                </button>
              </div>
            )}
            
            {/* Results Info */}
            {totalProducts > 0 && (
              <div className="text-center text-gray-600 text-sm py-4">
                Showing {(currentPage - 1) * productsPerPage + 1} to {Math.min(currentPage * productsPerPage, totalProducts)} of {totalProducts} products
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </AdminLayout>
  );
}