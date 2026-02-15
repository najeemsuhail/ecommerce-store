'use client';

import { useEffect, useState, Suspense, useCallback, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import AddToCartNotification from '@/components/AddToCartNotification';
import AddToWishlistModal from '@/components/AddToWishlistModal';
import FacetFilter from '@/components/FacetFilter';
import { formatPrice } from '@/lib/currency';

interface FacetFilters {
  brands: string[];
  categories: string[];
  categoryIds: string[];
  priceRange: {
    min: number;
    max: number;
  };
  isDigital?: boolean;
  isFeatured?: boolean;
  attributes?: { [key: string]: string[] };
}

interface FacetData {
  brands: { name: string; count: number }[];
  categories: { name: string; id: string; count: number }[];
  priceRange: { min: number; max: number };
}

// Filter Skeleton Component
function FilterSkeleton() {
  return (
    <div className="bg-light-theme rounded-lg shadow p-6 h-fit sticky top-20 space-y-6">
      {/* Price Skeleton */}
      <div className="border-b pb-6">
        <div className="h-6 bg-gray-200 rounded w-20 mb-4 animate-pulse" />
        <div className="space-y-3">
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Categories Skeleton */}
      <div className="border-b pb-6">
        <div className="h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-6 bg-gray-200 rounded w-full animate-pulse" />
          ))}
        </div>
      </div>

      {/* Attributes Skeleton */}
      <div className="border-b pb-6">
        <div className="h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
              <div className="h-5 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-5 bg-gray-200 rounded w-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Separate component that uses useSearchParams
function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerLoad = 12;
  const [displayedCount, setDisplayedCount] = useState(itemsPerLoad);
  const [totalProducts, setTotalProducts] = useState(0);
  const [facets, setFacets] = useState<FacetData>({
    brands: [],
    categories: [],
    priceRange: { min: 0, max: 100000 },
  });

  const [facetFilters, setFacetFilters] = useState<FacetFilters>({
    brands: [],
    categories: [],
    categoryIds: [],
    priceRange: { min: 0, max: 100000 },
    attributes: {},
  });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
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
  const isFetching = useRef(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    if (category) {
      setFacetFilters((prev) => ({
        ...prev,
        categories: [category],
      }));
    }
    
    if (search) {
      setSearchTerm(search);
    }
  }, [searchParams]);

  // Fetch all products once for facets
  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Fetch filtered products when filters change
  useEffect(() => {
    setDisplayedCount(itemsPerLoad); // Reset to initial load
    setProducts([]); // Clear products
    fetchProducts();
  }, [facetFilters, sortBy, searchTerm]);
  
  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && displayedCount < totalProducts) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, displayedCount, totalProducts]);

  const fetchAllProducts = async () => {
    try {
      // Fetch all products (with high limit) to calculate accurate facets
      const response = await fetch('/api/products?limit=10000', {
        next: { revalidate: 300 }, // Revalidate every 5 minutes
      });
      const data = await response.json();
      if (data.success) {
        setAllProducts(data.products);
        
        // Extract facets from all products
        const brands = new Map<string, number>();
        const categories = new Map<string, { id: string; count: number }>();
        let minPrice = Number.MAX_VALUE;
        let maxPrice = 0;

        // Track which products are in which categories to avoid duplicate counting
        const categoryProducts = new Map<string, Set<string>>();
        
        data.products.forEach((p: any) => {
          if (p.brand) {
            brands.set(p.brand, (brands.get(p.brand) || 0) + 1);
          }
          // Collect categories from the many-to-many relationship
          if (p.categories && Array.isArray(p.categories)) {
            p.categories.forEach((cat: any) => {
              const categoryName = cat.category?.name || cat.categoryId;
              const categoryId = cat.category?.id || cat.categoryId;
              if (!categories.has(categoryName)) {
                categories.set(categoryName, { id: categoryId, count: 0 });
                categoryProducts.set(categoryName, new Set());
              }
              // Add product ID to track unique products per category
              categoryProducts.get(categoryName)!.add(p.id);
            });
          }
          if (p.price) {
            minPrice = Math.min(minPrice, p.price);
            maxPrice = Math.max(maxPrice, p.price);
          }
        });
        
        // Update category counts with unique product counts
        categories.forEach((catData, catName) => {
          catData.count = categoryProducts.get(catName)?.size || 0;
        });

        setFacets({
          brands: Array.from(brands.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => a.name.localeCompare(b.name)),
          categories: Array.from(categories.entries())
            .map(([name, { id, count }]) => ({ name, id, count }))
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
      
      if (searchTerm) {
        url += `search=${encodeURIComponent(searchTerm)}&`;
      }
      
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
      
      if (facetFilters.attributes && Object.keys(facetFilters.attributes).length > 0) {
        Object.entries(facetFilters.attributes).forEach(([attrId, values]) => {
          values.forEach((value) => {
            url += `attribute=${encodeURIComponent(attrId)}&value=${encodeURIComponent(value)}&`;
          });
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

      // Add sort parameter
      url += `sort=${sortBy}&`;
      
      // Fetch with large limit to get all filtered products
      url += `skip=0&limit=10000`;

      const response = await fetch(url, {
        next: { revalidate: 300 }, // Revalidate every 5 minutes
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
        setTotalProducts(data.total || data.products.length);
        setHasMore(data.products.length > itemsPerLoad);
      }
    } catch (error) {
      console.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      // Add a small delay to show loading state and create smooth experience
      await new Promise(resolve => setTimeout(resolve, 600));
      const newCount = displayedCount + itemsPerLoad;
      setDisplayedCount(newCount);
      setHasMore(newCount < totalProducts);
    } catch (error) {
      console.error('Failed to load more products');
    } finally {
      setLoadingMore(false);
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
      weight: product.weight || undefined,
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

  const handleNotificationClose = useCallback(() => {
    setNotification({ message: '', visible: false });
  }, []);

  return (
    <div className="min-h-screen bg-bg-gray">
      <AddToCartNotification
        message={notification.message}
        isVisible={notification.visible}
        onClose={handleNotificationClose}
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
      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-8">
    
        {/* Mobile Filter and Sort Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-light-theme border-t border-border-300 p-4 flex z-40">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex-1 text-text-700 py-2 px-3 font-medium hover:text-text-900 transition-colors flex items-center justify-center gap-2 text-sm border-r border-border-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 text-text-light px-3 py-2 bg-light-theme text-sm font-medium focus:outline-none hover:text-text-dark transition-colors"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low</option>
            <option value="price-high">Price: High</option>
            <option value="popular">Popular</option>
            <option value="rating">Rated</option>
          </select>
        </div>

        {/* Products Layout with Facet Filter */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-24 lg:pb-0">
          {/* Desktop Sidebar Filters */}
          {loading ? (
            <div className="hidden lg:block lg:col-span-1">
              <FilterSkeleton />
            </div>
          ) : products.length > 0 ? (
            <div className="hidden lg:block lg:col-span-1">
              <FacetFilter
                facets={facets}
                selectedFilters={facetFilters}
                onFilterChange={setFacetFilters}
              />
            </div>
          ) : null}

          {/* Mobile Filter Modal */}
          {mobileFilterOpen && products.length > 0 && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setMobileFilterOpen(false)}
              />
              {/* Drawer */}
                <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-light-theme z-50 overflow-y-auto lg:hidden">
                <div className="sticky top-0 bg-light-theme border-b p-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="text-text-600 hover:text-text-900"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <FacetFilter
                    facets={facets}
                    selectedFilters={facetFilters}
                    onFilterChange={(filters) => {
                      setFacetFilters(filters);
                    }}
                  />
                </div>
                <div className="sticky bottom-0 bg-light-theme border-t p-4 space-y-2">
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-full btn-primary-theme py-3 rounded-lg font-semibold"
                  >
                    Show Results
                  </button>
                  <button
                    onClick={() => {
                      setFacetFilters({
                        brands: [],
                        categories: [],
                        categoryIds: [],
                        priceRange: { min: 0, max: facets.priceRange.max },
                        isDigital: undefined,
                        isFeatured: undefined,
                        attributes: {},
                      });
                    }}
                    className="w-full bg-bg-200 text-text-900 py-3 rounded-lg font-semibold hover:bg-bg-300 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Active Filters */}
            {(facetFilters.brands.length > 0 ||
              facetFilters.categories.length > 0 ||
              facetFilters.isDigital ||
              facetFilters.isFeatured ||
              facetFilters.priceRange.min > 0 ||
              facetFilters.priceRange.max < facets.priceRange.max) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {facetFilters.brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() =>
                      setFacetFilters((prev) => ({
                        ...prev,
                        brands: prev.brands.filter((b) => b !== brand),
                      }))
                    }
                    className="inline-flex items-center gap-1 bg-primary px-3 py-1 rounded-full text-sm hover:bg-primary-hover transition-colors"
                  >
                    {brand}
                    <span>✕</span>
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
                    className="inline-flex items-center gap-1 bg-primary  px-3 py-1 rounded-full text-sm hover:bg-primary-hover transition-colors"
                  >
                    {category}
                    <span>✕</span>
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
                    className="inline-flex items-center gap-1 bg-primary  px-3 py-1 rounded-full text-sm hover:bg-primary-hover transition-colors"
                  >
                    Price: {formatPrice(facetFilters.priceRange.min)} - {formatPrice(facetFilters.priceRange.max)}
                    <span>✕</span>
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
                    className="inline-flex items-center gap-1 bg-primary text-white px-3 py-1 rounded-full text-sm hover:bg-primary-hover transition-colors"
                  >
                    Digital
                    <span>✕</span>
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
                    className="inline-flex items-center gap-1 bg-primary text-white px-3 py-1 rounded-full text-sm hover:bg-primary-hover transition-colors"
                  >
                    Featured
                    <span>✕</span>
                  </button>
                )}
                <button
                  onClick={() =>
                    setFacetFilters({
                      brands: [],
                      categories: [],
                      categoryIds: [],
                      priceRange: { min: 0, max: facets.priceRange.max },
                      isDigital: undefined,
                      isFeatured: undefined,
                      attributes: {},
                    })
                  }
                  className="text-sm text-text-600 hover:text-text-900 font-semibold ml-2"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Results Count and Sort - Desktop Only */}
            {!loading && products.length > 0 && (
              <div className="mb-6 hidden lg:flex justify-between items-center">
                <div className="text-text-600">
                  Showing <span className="font-semibold">{products.length}</span> product{products.length !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="sort" className="text-sm font-medium text-text-700">Sort by:</label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-border-300 rounded-lg bg-light-theme text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-light-theme rounded-lg shadow overflow-hidden">
                    {/* Image Skeleton */}
                    <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                    
                    {/* Content Skeleton */}
                    <div className="p-4 space-y-3">
                      {/* Title */}
                      <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                      
                      {/* Description */}
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-full"></div>
                        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                      </div>
                      
                      {/* Price and Stock */}
                      <div className="flex justify-between items-center pt-2">
                        <div className="h-6 w-24 bg-gray-300 rounded"></div>
                        <div className="h-6 w-20 bg-gray-300 rounded"></div>
                      </div>
                      
                      {/* Rating */}
                      <div className="h-4 w-32 bg-gray-300 rounded"></div>
                      
                      {/* Button */}
                      <div className="h-10 bg-gray-300 rounded mt-3"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && products.length === 0 && (
              <div className="text-center py-12 bg-light-theme rounded-lg shadow">
                <svg className="w-16 h-16 text-text-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xl text-text-600 mb-4">No products found</p>
                <button
                  onClick={() =>
                    setFacetFilters({
                      brands: [],
                      categories: [],
                      categoryIds: [],
                      priceRange: { min: 0, max: facets.priceRange.max },
                      attributes: {},
                    })
                  }
                  className="text-primary-theme hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Products Grid */}
            {!loading && products.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.slice(0, displayedCount).map((product, index) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="bg-light-theme rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group animate-fadeIn"
                    style={{
                      animationDelay: `${(index % itemsPerLoad) * 50}ms`,
                    }}
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square bg-bg-200 overflow-hidden">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-400">
                          No Image
                        </div>
                      )}
                      {product.isFeatured && (
                        <span className="absolute top-2 right-2 bg-yellow-400 text-xs px-2 py-1 rounded">
                          Featured
                        </span>
                      )}
                      {product.comparePrice && (
                        <span className="absolute top-2 left-2 bg-danger text-white text-xs px-2 py-1 rounded font-semibold" style={{backgroundColor: '#dc2626'}}>
                          SALE
                        </span>
                      )}
                      {product.isActive && (
                        <div className="absolute inset-0 bg-black/40 hidden md:opacity-0 md:group-hover:opacity-100 md:flex transition-opacity duration-300 items-center justify-center gap-4">
                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            className="bg-white text-blue-600 p-3 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-110"
                            title="Add to Cart"
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 6H6.28l-.31-1.243A1 1 0 005 4H3zm5 16a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => handleWishlistToggle(product, e)}
                            className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                              isInWishlist(product.id)
                                ? 'bg-red-500 text-white'
                                : 'bg-white text-gray-600 hover:text-red-500'
                            }`}
                            title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-text-600 text-sm mb-3 line-clamp-2">
                        {product.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
                      </p>

                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-2xl font-bold text-primary-theme">
                            {formatPrice(product.price)}
                          </span>
                          {product.comparePrice && (
                            <span className="text-sm text-text-500 line-through ml-2">
                              {formatPrice(product.comparePrice)}
                            </span>
                          )}
                        </div>
                        {product.isDigital && (
                          <span className="text-xs bg-primary-light text-primary-theme px-2 py-1 rounded">
                            Digital
                          </span>
                        )}
                      </div>

                      {product.averageRating > 0 && (
                        <div className="flex items-center gap-1 mb-3 text-sm">
                          <span className="text-yellow-400">
                            {'★'.repeat(Math.round(product.averageRating))}
                          </span>
                          <span className="text-text-600">
                            ({product.reviewCount})
                          </span>
                        </div>
                      )}

                      {/* Mobile action buttons */}
                      {product.isActive && (
                        <div className="flex gap-2 md:hidden items-center">
                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-all font-medium text-sm"
                            title="Add to Cart"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={(e) => handleWishlistToggle(product, e)}
                            className={`p-3 rounded-lg transition-all ${
                              isInWishlist(product.id)
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Infinite Scroll Trigger */}
            {displayedCount < totalProducts && (
              <div ref={observerTarget} className="mt-12 py-8 text-center">
                <div className="flex flex-col items-center gap-3">
                  {loadingMore && (
                    <>
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-theme"></div>
                      <p className="text-text-600">Loading more products...</p>
                    </>
                  )}
                  {!loadingMore && (
                    <p className="text-text-400 text-sm">Scroll to load more</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Results Info */}
            {!loading && totalProducts > 0 && (
              <div className="mt-6 text-center text-text-600 text-sm">
                Showing {Math.min(displayedCount, products.length)} of {totalProducts} products
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Button (Fixed Bottom) */}
      <button
        onClick={() => setMobileFilterOpen(true)}
        className="fixed bottom-6 left-4 right-4 lg:hidden btn-primary-theme py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg z-30"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L13 9.414V17a1 1 0 01-1.447.894l-4-2A1 1 0 007 15.618V9.414L3.293 5.707A1 1 0 013 5V3z" clipRule="evenodd" />
        </svg>
        Filters
      </button>
    </div>
  );
}

// Loading fallback component
function ProductsLoading() {
  return (
    <div className="min-h-screen bg-bg-gray">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-bg-200 rounded w-1/4 mb-8"></div>
          <div className="h-12 bg-bg-200 rounded mb-4"></div>
          <div className="flex gap-2 mb-8">
            <div className="h-10 bg-bg-200 rounded w-32"></div>
            <div className="h-10 bg-bg-200 rounded w-32"></div>
            <div className="h-10 bg-bg-200 rounded w-32"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-light-theme rounded-lg shadow p-4">
                <div className="h-48 bg-bg-200 rounded mb-4"></div>
                <div className="h-6 bg-bg-200 rounded mb-2"></div>
                <div className="h-4 bg-bg-200 rounded mb-4"></div>
                <div className="h-10 bg-bg-200 rounded"></div>
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
