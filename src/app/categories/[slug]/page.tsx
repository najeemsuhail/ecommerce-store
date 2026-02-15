'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faHeart, faStar } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import AddToCartNotification from '@/components/AddToCartNotification';
import AddToWishlistModal from '@/components/AddToWishlistModal';
import { formatPrice } from '@/lib/currency';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parent?: {
    id: string;
    name: string;
    slug: string;
  };
  children: {
    id: string;
    name: string;
    slug: string;
  }[];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: string[];
  brand?: string;
  isDigital: boolean;
  isActive: boolean;
  stock?: number;
  weight?: number;
  averageRating?: number;
  reviewCount?: number;
}

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [notification, setNotification] = useState({ message: '', visible: false });
  const [wishlistModal, setWishlistModal] = useState({ 
    isOpen: false, 
    productId: '', 
    productName: '',
    productPrice: 0,
    productImage: '',
    productSlug: '',
  });

  const { addItem } = useCart();
  const { isInWishlist, removeItemFromGroup, groups } = useWishlist();

  useEffect(() => {
    if (slug) {
      fetchCategory();
    }
  }, [slug]);

  useEffect(() => {
    if (category) {
      fetchProducts();
    }
  }, [category, sortBy]);

  const fetchCategory = async () => {
    setCategoryLoading(true);
    try {
      const response = await fetch(`/api/categories/${slug}`);
      const data = await response.json();
      
      if (data.success) {
        setCategory(data.category);
      } else {
        console.error('Category not found');
        router.push('/categories');
      }
    } catch (error) {
      console.error('Failed to fetch category:', error);
      router.push('/categories');
    } finally {
      setCategoryLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (!category) return;
    
    setLoading(true);
    try {
      // Fetch products by category name (using the category name from the fetched category)
      const response = await fetch(`/api/products?category=${encodeURIComponent(category.name)}&sort=${sortBy}&limit=100`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
      } else {
        console.error('Failed to fetch products:', data.error);
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
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

  const handleWishlistToggle = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    if (isInWishlist(product.id)) {
      removeItemFromGroup(groups[0]?.id, product.id);
      setNotification({ message: 'Removed from wishlist', visible: true });
    } else {
      setWishlistModal({
        isOpen: true,
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        productImage: product.images?.[0] || '',
        productSlug: product.slug,
      });
    }
  };

  const handleWishlistModalClose = () => {
    setWishlistModal({ 
      isOpen: false, 
      productId: '', 
      productName: '', 
      productPrice: 0,
      productImage: '',
      productSlug: '',
    });
  };

  if (categoryLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Loading category...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
            <Link href="/categories" className="text-primary hover:underline">
              Browse All Categories
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-primary">
                  Home
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <Link href="/categories" className="text-gray-600 hover:text-primary">
                  Categories
                </Link>
              </li>
              {category?.parent && (
                <>
                  <li className="text-gray-400">/</li>
                  <li>
                    <Link 
                      href={`/categories/${category.parent.slug}`}
                      className="text-gray-600 hover:text-primary"
                    >
                      {category.parent.name}
                    </Link>
                  </li>
                </>
              )}
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 font-medium">{category?.name}</li>
            </ol>
          </nav>

          {/* Category Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-gray-900">{category?.name}</h1>
            <p className="text-gray-600">
              {products.length} {products.length === 1 ? 'product' : 'products'} found
            </p>
          </div>

          {/* Subcategories */}
          {category && category.children && category.children.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Subcategories</h2>
              <div className="flex flex-wrap gap-3">
                {category.children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/categories/${child.slug}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-primary hover:text-primary transition-colors"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Sort Options */}
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <label htmlFor="sort" className="text-sm font-medium text-gray-700">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Popular</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <p className="text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg">
              <p className="text-gray-600 text-lg mb-4">No products found in this category</p>
              <Link href="/products" className="text-primary hover:underline">
                Browse All Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gray-100">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    
                    {/* Quick Actions */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleWishlistToggle(product, e)}
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                      >
                        <FontAwesomeIcon
                          icon={faHeart}
                          className={`w-4 h-4 ${isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400'}`}
                        />
                      </button>
                    </div>

                    {product.isActive && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="bg-white text-blue-600 p-3 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-110"
                          title="Add to Cart"
                        >
                          <FontAwesomeIcon icon={faShoppingCart} className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {/* Discount Badge */}
                    {product.comparePrice && product.comparePrice > product.price && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    
                    {product.brand && (
                      <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
                    )}

                    {/* Rating */}
                    {product.averageRating && product.averageRating > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <FontAwesomeIcon icon={faStar} className="w-3 h-3 text-yellow-400" />
                        <span className="text-sm font-medium">{product.averageRating.toFixed(1)}</span>
                        {product.reviewCount && (
                          <span className="text-xs text-gray-500">({product.reviewCount})</span>
                        )}
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.comparePrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <AddToCartNotification
        message={notification.message}
        isVisible={notification.visible}
        onClose={() => setNotification({ message: '', visible: false })}
      />

      <AddToWishlistModal
        isOpen={wishlistModal.isOpen}
        productId={wishlistModal.productId}
        productName={wishlistModal.productName}
        productPrice={wishlistModal.productPrice}
        productImage={wishlistModal.productImage}
        productSlug={wishlistModal.productSlug}
        onClose={handleWishlistModalClose}
      />
    </Layout>
  );
}
