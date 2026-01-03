export const dynamic = "force-dynamic";
'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const { addItem, totalItems } = useCart();

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory]);

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
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data.products.map((p: any) => p.category).filter(Boolean))
        ) as string[];
        setCategories(uniqueCategories);
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            E-Store
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/products" className="hover:text-blue-600">
              Products
            </Link>
            <Link href="/auth" className="hover:text-blue-600">
              Account
            </Link>
            <Link
              href="/cart"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 relative"
            >
              Cart
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

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
              className={`px-4 py-2 rounded-lg ${
                selectedCategory === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border hover:bg-gray-50'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-xl">Loading products...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No products found</p>
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
                        ${product.price}
                      </span>
                      {product.comparePrice && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ${product.comparePrice}
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
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
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
  );
}