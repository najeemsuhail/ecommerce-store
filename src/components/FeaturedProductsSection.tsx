'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/currency';
import { useWishlist } from '@/contexts/WishlistContext';
import AddToWishlistModal from '@/components/AddToWishlistModal';

interface Product {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  slug: string;
  images?: string[];
  averageRating?: number;
  isDigital?: boolean;
  isActive?: boolean;
  stock?: number;
  weight?: number;
}

interface FeaturedProductsSectionProps {
  products: Product[];
  onQuickAdd: (product: Product) => void;
}

export default function FeaturedProductsSection({ products, onQuickAdd }: FeaturedProductsSectionProps) {
  const { isInWishlist, groups, removeItemFromGroup } = useWishlist();
  const [wishlistModal, setWishlistModal] = useState({
    isOpen: false,
    productId: '',
    productName: '',
    productPrice: 0,
    productImage: '',
    productSlug: '',
  });

  const handleWishlistClick = (product: Product, e: React.MouseEvent) => {
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

  if (products.length === 0) return null;

  return (
    <section className="theme-section-shell py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="theme-section-heading text-5xl font-bold mb-4">
            <span className="theme-heading-accent">
              Featured
            </span>{' '}
            <span>Products</span>
          </h2>
          <p className="text-xl text-text-light font-medium">Hand-picked items just for you</p>
        </div>
        
        <div className="grid grid-cols-2 grid-rows-2 sm:grid-cols-2 sm:grid-rows-none lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="theme-product-card group overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Link href={`/products/${product.slug}`} scroll={true} className="block">
              <div className="theme-product-media relative h-64 overflow-hidden">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-lighter">
                    <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {/* Sale badge removed */}
                {product.isActive !== false && (
                  <div className="theme-product-hover absolute inset-0 hidden items-center justify-center gap-4 transition-opacity duration-300 md:flex md:opacity-0 md:group-hover:opacity-100">
                    <button
                      onClick={() => onQuickAdd(product)}
                      className="theme-action-fab p-3"
                      title="Add to Cart"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 6H6.28l-.31-1.243A1 1 0 005 4H3zm5 16a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => handleWishlistClick(product, e)}
                      className={`theme-action-fab theme-action-fab-danger p-3 ${
                        isInWishlist(product.id)
                          ? 'theme-wishlist-active'
                          : ''
                      }`}
                      title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {/* Mobile action buttons */}
                {product.isActive !== false && (
                  <div className="flex gap-2 md:hidden items-center p-4 border-t border-border-color">
                    <button
                      onClick={() => onQuickAdd(product)}
                      className="theme-button-primary flex-1 px-4 py-2 font-medium text-sm"
                      title="Add to Cart"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={(e) => handleWishlistClick(product, e)}
                      className={`theme-icon-button theme-icon-button-danger p-2.5 ${
                        isInWishlist(product.id)
                          ? 'theme-wishlist-active'
                          : ''
                      }`}
                      title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </Link>
            
            <div className="p-5">
              <Link href={`/products/${product.slug}`} scroll={true}>
                <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary-theme transition-colors min-h-[3.5rem]">
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
                  <div className="flex items-center gap-1 text-yellow-500 text-sm">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                    <span className="font-semibold">{product.averageRating}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 justify-center">
                <Link
                  href={`/products/${product.slug}`}
                  scroll={true}
                  className="theme-button-secondary px-4 py-2.5 flex items-center justify-center"
                  title="View Details"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-16">
            <Link
              href="/products"
              className="theme-button-primary inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg"
            >
              View All Products
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
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
