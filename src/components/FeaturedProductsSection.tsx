'use client';

import Link from 'next/link';
import { formatPrice } from '@/lib/currency';

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
  if (products.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 text-gray-900">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Featured
            </span>{' '}
            <span className="text-gray-900">Products</span>
          </h2>
          <p className="text-xl text-gray-600 font-medium">Hand-picked items just for you</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="group bg-light-theme rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-border-color hover:border-primary hover:-translate-y-2"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Link href={`/products/${product.slug}`} className="block">
              <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-lighter">
                    <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {product.comparePrice && (
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-bold shadow-lg text-white" style={{backgroundColor: '#dc2626'}}>
                    SALE
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </Link>
            
            <div className="p-5">
              <Link href={`/products/${product.slug}`}>
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
              
              <div className="flex gap-2">
                {product.isActive !== false ? (
                  <button
                    onClick={() => onQuickAdd(product)}
                    className="flex-1 btn-primary-theme py-2.5 rounded-lg font-medium hover:scale-105"
                  >
                    Add to Cart
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 bg-gray-300 text-gray-600 py-2.5 rounded-lg cursor-not-allowed"
                  >
                    Not Available
                  </button>
                )}
                <Link
                  href={`/products/${product.slug}`}
                  className="px-4 py-2.5 border-2 border-gray-theme rounded-lg hover:border-primary-theme hover:text-primary-theme transition-all duration-300 flex items-center justify-center"
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
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-white hover:scale-105"
            >
              View All Products
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
      </div>
    </section>
  );
}
