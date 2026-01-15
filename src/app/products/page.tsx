'use client';

import { useEffect, useState, Suspense } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import AddToCartNotification from '@/components/AddToCartNotification';
import AddToWishlistModal from '@/components/AddToWishlistModal';
import FacetFilter from '@/components/FacetFilter';

interface FacetFilters {
  brands: string[];
  categories: string[];
  priceRange: {
    min: number;
    max: number;
  };
  isDigital?: boolean;
  isFeatured?: boolean;
}

interface FacetData {
  brands: { name: string; count: number }[];
  categories: { name: string; count: number }[];
  priceRange: { min: number; max: number };
}

// Separate component that uses useSearchParams
function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [facets, setFacets] = useState<FacetData>({
    brands: [],
    categories: [],
    priceRange: { min: 0, max: 100000 },
  });
  const [facetFilters, setFacetFilters] = useState<FacetFilters>({
    brands: [],
    categories: [],
    priceRange: { min: 0, max: 100000 },
  });
  const [notification, setNotification] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });
  const [wishlistModal, setWishlistModal] = useState<{
    isOpen: boolean;
    productId: string;
    productName: string;
    productPrice: number;
    productImage?: string;
    productSlug: string;
  }>({
    isOpen: false,
    productId: '',
    productName: '',
    productPrice: 0,
    productSlug: '',
  });
  const { addItem } = useCart();
  const { isInWishlist, groups, createGroup, addItemToGroup, removeItemFromGroup } = useWishlist();

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setFacetFilters((prev) => ({
        ...prev,
        categories: [category],
      }));
    }
  }, [searchParams]);

  // Fetch all products once for facets
  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Fetch filtered products when filters change
  useEffect(() => {
    fetchProducts();
  }, [facetFilters]);

  const fetchAllProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setAllProducts(data.products);
        
        // Extract facets from all products
        const brands = new Map<string, number>();
        const categories = new Map<string, number>();
        let minPrice = Number.MAX_VALUE;
        let maxPrice = 0;

        data.products.forEach((p: any) => {
          if (p.brand) {
            brands.set(p.brand, (brands.get(p.brand) || 0) + 1);
          }
          if (p.category) {
            categories.set(p.category, (categories.get(p.category) || 0) + 1);
          }
          if (p.price) {
            minPrice = Math.min(minPrice, p.price);
            maxPrice = Math.max(maxPrice, p.price);
          }
        });

        setFacets({
          brands: Array.from(brands.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => a.name.localeCompare(b.name)),
          categories: Array.from(categories.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count),
          priceRange: { min: minPrice === Number.MAX_VALUE ? 0 : minPrice, max: maxPrice },
        });

        // Set initial price range
        setFacetFilters((prev) => ({
          ...prev,
          priceRange: {
            min: prev.priceRange.min,
            max: maxPrice,
          },
        }));
      }
    } catch (error) {
      console.error('Failed to fetch all products');
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/api/products?';
      
      if (facetFilters.brands.length > 0) {
        facetFilters.brands.forEach((brand) => {
          url += `brand=${encodeURIComponent(brand)}&`;
        });
      }
      
      if (facetFilters.categories.length > 0) {
        facetFilters.categories.forEach((category) => {
          url += `category=${encodeURIComponent(category)}&`;
        });
      }
      
      if (facetFilters.priceRange.min > 0) {
        url += `minPrice=${facetFilters.priceRange.min}&`;
      }
      
      if (facetFilters.priceRange.max < facets.priceRange.max) {
        url += `maxPrice=${facetFilters.priceRange.max}&`;
      }
      
      if (facetFilters.isDigital !== undefined) {
        url += `isDigital=${facetFilters.isDigital}&`;
      }
      
      if (facetFilters.isFeatured !== undefined) {
        url += `isFeatured=${facetFilters.isFeatured}&`;
      }

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
    setNotification({
      message: `${product.name} added to cart!`,
      visible: true,
    });
  };

  const handleWishlistToggle = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isInWishlist(product.id)) {
      // If already in wishlist, remove from all groups
      groups.forEach((group) => {
        const isInThisGroup = group.items.some(
          (item) => item.productId === product.id
        );
        if (isInThisGroup) {
          removeItemFromGroup(group.id, product.id);
        }
      });
      setNotification({
        message: `${product.name} removed from wishlist!`,
        visible: true,
      });
    } else {
      // If not in wishlist, show modal to select group
      setWishlistModal({
        isOpen: true,
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        productImage: product.images?.[0],
        productSlug: product.slug,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AddToCartNotification
        message={notification.message}
        isVisible={notification.visible}
        onClose={() => setNotification({ ...notification, visible: false })}
      />
      <AddToWishlistModal
        isOpen={wishlistModal.isOpen}
        onClose={() => setWishlistModal({ ...wishlistModal, isOpen: false })}
        productId={wishlistModal.productId}
        productName={wishlistModal.productName}
        productPrice={wishlistModal.productPrice}
        productImage={wishlistModal.productImage}
        productSlug={wishlistModal.productSlug}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">All Products</h1>
        </div>

        {/* Selected Filters Display */}
        {(facetFilters.brands.length > 0 ||
          facetFilters.categories.length > 0 ||
          facetFilters.isDigital ||
          facetFilters.isFeatured ||
          facetFilters.priceRange.min > 0 ||
          facetFilters.priceRange.max < facets.priceRange.max) && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Active Filters:</h3>
              <button
                onClick={() =>
                  setFacetFilters({
                    brands: [],
                    categories: [],
                    priceRange: { min: 0, max: facets.priceRange.max },
                    isDigital: undefined,
                    isFeatured: undefined,
                  })
                }
                className="text-sm text-red-600 hover:text-red-700 font-semibold"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {facetFilters.brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() =>
                    setFacetFilters((prev) => ({
                      ...prev,
                      brands: prev.brands.filter((b) => b !== brand),
                    }))
                  }
                  className="inline-flex items-center gap-2 bg-white border border-blue-300 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-100 transition-colors"
                >
                  {brand}
                  <span className="text-blue-400">✕</span>
                </button>
              ))}
              {facetFilters.categories.map((category) => (
                <button
                  key={category}
                  onClick={() =>
                    setFacetFilters((prev) => ({
                      ...prev,
                      categories: prev.categories.filter((c) => c !== category),
                    }))
                  }
                  className="inline-flex items-center gap-2 bg-white border border-blue-300 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-100 transition-colors"
                >
                  {category}
                  <span className="text-blue-400">✕</span>
                </button>
              ))}
              {(facetFilters.priceRange.min > 0 || facetFilters.priceRange.max < facets.priceRange.max) && (
                <button
                  onClick={() =>
                    setFacetFilters((prev) => ({
                      ...prev,
                      priceRange: { min: 0, max: facets.priceRange.max },
                    }))
                  }
                  className="inline-flex items-center gap-2 bg-white border border-blue-300 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-100 transition-colors"
                >
                  Price: ₹{facetFilters.priceRange.min} - ₹{facetFilters.priceRange.max}
                  <span className="text-blue-400">✕</span>
                </button>
              )}
              {facetFilters.isDigital && (
                <button
                  onClick={() =>
                    setFacetFilters((prev) => ({
                      ...prev,
                      isDigital: undefined,
                    }))
                  }
                  className="inline-flex items-center gap-2 bg-white border border-blue-300 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-100 transition-colors"
                >
                  Digital Products
                  <span className="text-blue-400">✕</span>
                </button>
              )}
              {facetFilters.isFeatured && (
                <button
                  onClick={() =>
                    setFacetFilters((prev) => ({
                      ...prev,
                      isFeatured: undefined,
                    }))
                  }
                  className="inline-flex items-center gap-2 bg-white border border-blue-300 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-100 transition-colors"
                >
                  Featured Only
                  <span className="text-blue-400">✕</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Products Layout with Facet Filter */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters (hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-1">
            <FacetFilter
              facets={facets}
              selectedFilters={facetFilters}
              onFilterChange={setFacetFilters}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Results Count */}
            {!loading && products.length > 0 && (
              <div className="mb-6 text-gray-600">
                Showing <span className="font-semibold">{products.length}</span> product{products.length !== 1 ? 's' : ''}
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
                setFacetFilters({
                  brands: [],
                  categories: [],
                  priceRange: { min: 0, max: facets.priceRange.max },
                });
              }}
              className="text-blue-600 hover:underline"
            >
              Clear filters
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
                  onClick={() =>
                    setFacetFilters({
                      brands: [],
                      categories: [],
                      priceRange: { min: 0, max: facets.priceRange.max },
                    })
                  }
                  className="text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
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

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={(e) => handleWishlistToggle(product, e)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            isInWishlist(product.id)
                              ? 'bg-red-100 text-red-600 border-2 border-red-300'
                              : 'bg-gray-100 text-gray-600 border-2 border-gray-300 hover:border-red-500 hover:text-red-600'
                          }`}
                          title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          ♥
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function ProductsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="flex gap-2 mb-8">
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function ProductsPage() {
  return (
    <Layout>
      <Suspense fallback={<ProductsLoading />}>
        <ProductsContent />
      </Suspense>
    </Layout>
  );
}