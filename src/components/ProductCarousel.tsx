'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AddToCartNotification from './AddToCartNotification';
import AddToWishlistModal from './AddToWishlistModal';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { formatPrice } from '@/lib/currency';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images?: string[];
  averageRating?: number;
  isFeatured?: boolean;
  isDigital?: boolean;
  isActive?: boolean;
  stock?: number;
  weight?: number;
}

interface ProductCarouselProps {
  products: Product[];
  title: string;
  description?: string;
  type?: 'default' | 'bestseller';
}

export default function ProductCarousel({
  products,
  title,
  description,
  type = 'default',
}: ProductCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [notification, setNotification] = useState<{
    message: string;
    visible: boolean;
  }>({
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
  const { isInWishlist } = useWishlist();

  const checkScroll = () => {
    const element = carouselRef.current;
    if (element) {
      setCanScrollLeft(element.scrollLeft > 0);
      setCanScrollRight(
        element.scrollLeft < element.scrollWidth - element.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    checkScroll();
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        carousel.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    const element = carouselRef.current;
    if (element) {
      // Scroll by one item width (w-80 = 320px) + gap (gap-6 = 24px) = 344px
      const itemWidth = 344;
      if (direction === 'left') {
        element.scrollBy({ left: -itemWidth, behavior: 'smooth' });
      } else {
        element.scrollBy({ left: itemWidth, behavior: 'smooth' });
      }
      setTimeout(checkScroll, 300);
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
      isDigital: product.isDigital || false,
      weight: product.weight || undefined,
    });
    setNotification({
      message: `${product.name} added to cart!`,
      visible: true,
    });
  };

  const handleWishlistClick = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    setWishlistModal({
      isOpen: true,
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      productImage: product.images?.[0],
      productSlug: product.slug,
    });
  };

  const handleNotificationClose = useCallback(() => {
    setNotification({ message: '', visible: false });
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
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

      <div className="mb-12">
        <h2 className="text-4xl font-bold mb-4">
          <span className="text-primary-theme">
            {title}
          </span>
        </h2>
        {description && (
          <p className="text-text-light text-lg">{description}</p>
        )}
      </div>

      <div className="relative group">
        {/* Left Navigation Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 btn-primary-theme shadow-2xl rounded-full p-3 hover:shadow-3xl hover:scale-110 transition-all duration-300 -ml-6 opacity-0 group-hover:opacity-100"
          aria-label="Scroll left"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Carousel Container */}
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto scroll-smooth"
          style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Hide scrollbar for all browsers */}
          <style>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-80 group/card bg-light-theme rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-border-color hover:border-primary"
            >
              <Link href={`/products/${product.slug}`} className="block">
                <div className="relative h-64 bg-bg-gray overflow-hidden">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-lighter">
                      <svg
                        className="w-20 h-20"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  {product.comparePrice && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-bold shadow-lg text-white" style={{backgroundColor: '#dc2626'}}>
                      SALE
                    </div>
                  )}
                  {product.isActive !== false && (
                    <div className="absolute inset-0 bg-black/40 opacity-100 md:opacity-0 md:group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
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
                  )}
                </div>
              </Link>

              {/* Card Content - show based on type */}
              {type === 'default' ? (
                <div className="p-5">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover/card:text-primary-theme transition-colors min-h-[3.5rem]">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-primary-theme">
                        {formatPrice(product.price)}
                      </span>
                      {product.comparePrice && (
                        <span className="text-sm text-text-lighter line-through ml-2">
                          {formatPrice(product.comparePrice)}
                        </span>
                      )}
                    </div>
                    {product.averageRating && product.averageRating > 0 && (
                      <div className="flex items-center gap-1 text-warning text-sm">
                        <svg
                          className="w-4 h-4 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                        <span className="font-semibold">{product.averageRating}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleWishlistClick(product, e)}
                      className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
                        isInWishlist(product.id)
                          ? 'bg-danger/20 text-danger border-2 border-danger'
                          : 'bg-bg-gray text-text-light border-2 border-border-color hover:border-danger hover:text-danger'
                      }`}
                      title="Add to wishlist"
                    >
                      ♥
                    </button>
                  </div>
                </div>
              ) : (
                /* Minimal card for bestseller - only title */
                <div className="p-3 bg-white">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover/card:text-primary-theme transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Navigation Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 gradient-primary-accent text-white-theme shadow-2xl rounded-full p-3 hover:shadow-3xl hover:scale-110 transition-all duration-300 -mr-6 opacity-0 group-hover:opacity-100"
          aria-label="Scroll right"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
