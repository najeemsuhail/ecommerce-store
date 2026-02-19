'use client';

import { useState } from 'react';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import AddToWishlistModal from '@/components/AddToWishlistModal';
import Link from 'next/link';
import { formatPrice } from '@/lib/currency';

export default function RecentlyViewedSection() {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();
  const { addItem } = useCart();
  const { isInWishlist, groups, removeItemFromGroup } = useWishlist();
  const [wishlistModal, setWishlistModal] = useState({
    isOpen: false,
    productId: '',
    productName: '',
    productPrice: 0,
    productImage: '',
    productSlug: '',
  });

  const handleWishlistClick = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isInWishlist(product.id)) {
      groups.forEach((group) => {
        const isInThisGroup = group.items.some(
          (item) => item.productId === product.id
        );
        if (isInThisGroup) {
          removeItemFromGroup(group.id, product.id);
        }
      });
    } else {
      setWishlistModal({
        isOpen: true,
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        productImage: product.images?.[0] ?? '',
        productSlug: product.slug,
      });
    }
  };

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Recently Viewed</h2>
          <button
            onClick={clearRecentlyViewed}
            className="text-sm text-red-600 hover:text-red-700 underline"
          >
            Clear History
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {recentlyViewed.map((product) => (
            <div key={product.id} className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-blue-500">
              {/* Product Image */}
              <Link href={`/products/${product.slug}`}>
                <div className="relative overflow-hidden bg-gray-100 h-48">
                  <img
                    src={product.images?.[0] || '/images/products/default.png'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Add to Cart Button on Hover */}
                  <div className="absolute inset-0 bg-black/40 hidden md:opacity-0 md:group-hover:opacity-100 md:flex transition-opacity duration-300 items-center justify-center gap-4">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addItem({
                          productId: product.id,
                          name: product.name,
                          price: product.price,
                          quantity: 1,
                          image: product.images?.[0],
                          slug: product.slug,
                          isDigital: product.isDigital || false,
                          weight: product.weight || undefined,
                        });
                      }}
                      className="bg-white text-blue-600 p-3 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-110"
                      title="Add to Cart"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 6H6.28l-.31-1.243A1 1 0 005 4H3zm5 16a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => handleWishlistClick(product, e)}
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
                </div>
                
                {/* Mobile action buttons */}
                                <div className="flex gap-2 md:hidden items-center p-3 border-t border-border-color">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addItem({
                          productId: product.id,
                          name: product.name,
                          price: product.price,
                          quantity: 1,
                          image: product.images?.[0],
                          slug: product.slug,
                          isDigital: product.isDigital || false,
                          weight: product.weight || undefined,
                        });
                      }}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all font-medium text-sm"
                      title="Add to Cart"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={(e) => handleWishlistClick(product, e)}
                      className={`p-2.5 rounded-lg transition-all ${
                        isInWishlist(product.id)
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                    </button>
                  </div>
              </Link>

              {/* Product Info - Title limited to 2 lines */}
              <div className="p-3">
                <Link
                  href={`/products/${product.slug}`}
                  className="block text-sm font-semibold text-gray-900 hover:text-blue-600 line-clamp-2 leading-tight"
                  title={product.name}
                >
                  {product.name}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddToWishlistModal
        isOpen={wishlistModal.isOpen}
        onClose={() =>
          setWishlistModal({
            isOpen: false,
            productId: '',
            productName: '',
            productPrice: 0,
            productImage: '',
            productSlug: '',
          })
        }
        productId={wishlistModal.productId}
        productName={wishlistModal.productName}
        productPrice={wishlistModal.productPrice}
        productImage={wishlistModal.productImage}
        productSlug={wishlistModal.productSlug}
      />
    </section>
  );
}
