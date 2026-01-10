'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]); // Store all products
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  // Fetch all products once for categories
  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Fetch filtered products when filters change
  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory]);

  const fetchAllProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setAllProducts(data.products);
        
        // Extract unique categories from all products
        const uniqueCategories = Array.from(
          new Set(data.products.map((p: any) => p.category).filter(Boolean))
        ) as string[];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Failed to fetch all products');
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/api/products?';
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
      if (selectedCategory) url += `category=${encodeURIComponent(selectedCategory)}&`;

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0],
      slug: product.slug,
      isDigital: product.isDigital,
    });
    alert(`${product.name} added to cart!`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header with Search */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">All Products</h1>
            
            {/* Search Bar */}
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === ''
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white border hover:bg-gray-50'
                }`}
              >
                All Categories ({allProducts.length})
              </button>
              {categories.map((category) => {
                const count = allProducts.filter(p => p.category === category).length;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white border hover:bg-gray-50'
                    }`}
                  >
                    {category} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedCategory) && (
            <div className="mb-6 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Search: {searchTerm}
                  <button
                    onClick={() => setSearchTerm('')}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    ✕
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Category: {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    ✕
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="text-sm text-red-600 hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-xl mt-4">Loading products...</p>
            </div>
          )}

          {/* No Results */}
          {!loading && products.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xl text-gray-600 mb-4">No products found</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="text-blue-600 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Results Count */}
          {!loading && products.length > 0 && (
            <div className="mb-4 text-gray-600">
              Showing <span className="font-semibold">{products.length}</span> product{products.length !== 1 ? 's' : ''}
              {selectedCategory && ` in ${selectedCategory}`}
              {searchTerm && ` for "${searchTerm}"`}
            </div>
          )}

          {/* Products Grid */}
          {!loading && products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
                >
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    {product.isFeatured && (
                      <span className="absolute top-2 right-2 bg-yellow-400 text-xs px-2 py-1 rounded">
                        Featured
                      </span>
                    )}
                    {product.comparePrice && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-semibold">
                        SALE
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-2xl font-bold text-blue-600">
                          ₹{product.price}
                        </span>
                        {product.comparePrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₹{product.comparePrice}
                          </span>
                        )}
                      </div>
                      {product.isDigital && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Digital
                        </span>
                      )}
                    </div>

                    {product.averageRating > 0 && (
                      <div className="flex items-center gap-1 mb-3 text-sm">
                        <span className="text-yellow-400">
                          {'★'.repeat(Math.round(product.averageRating))}
                        </span>
                        <span className="text-gray-600">
                          ({product.reviewCount})
                        </span>
                      </div>
                    )}

                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}