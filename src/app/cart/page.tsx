'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProductRecommendations from '@/components/ProductRecommendations';
import AddToCartNotification from '@/components/AddToCartNotification';
import { formatPrice } from '@/lib/currency';
import { calculateShippingCost } from '@/lib/shipping';

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    totalPrice,
    totalItems,
    clearCart,
    addItem,
  } = useCart();

  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
  });

  const router = useRouter();

  // Simulate loading on mount
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Calculate shipping based on order total
  const hasPhysicalProducts = items.some((item) => !item.isDigital);
  const shippingCost = calculateShippingCost(totalPrice, hasPhysicalProducts);
  const total = totalPrice + shippingCost;

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    router.push('/checkout-flow');
  };

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      slug: product.slug,
      image: product.images?.[0],
      isDigital: product.isDigital || false,
      weight: product.weight || undefined,
    });
    
    setNotification({
      isVisible: true,
      message: `${product.name} added to cart!`,
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-bg-gray py-4 md:py-8">
          <div className="max-w-6xl mx-auto px-3 md:px-4">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-3">
              <div className="h-8 md:h-10 bg-bg-200 rounded w-1/3"></div>
              <div className="h-6 bg-bg-200 rounded w-20"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
              {/* Cart Items Skeleton */}
              <div className="lg:col-span-2 space-y-3 md:space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-light-theme rounded-lg shadow p-3 md:p-6 flex flex-col md:flex-row gap-3 md:gap-4"
                  >
                    {/* Product Image Skeleton */}
                    <div className="w-full md:w-24 md:h-24 h-40 bg-bg-200 rounded flex-shrink-0"></div>

                    {/* Product Info Skeleton */}
                    <div className="flex-1">
                      <div className="h-6 bg-bg-200 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-bg-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-bg-200 rounded w-1/3 mb-4"></div>

                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
                        <div className="h-10 bg-bg-200 rounded w-32"></div>
                        <div className="h-4 bg-bg-200 rounded w-16"></div>
                      </div>
                    </div>

                    {/* Item Total Skeleton */}
                    <div className="text-right">
                      <div className="h-6 bg-bg-200 rounded w-24 ml-auto"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary Skeleton */}
              <div className="lg:col-span-1">
                <div className="bg-light-theme rounded-lg shadow p-4 md:p-6 sticky top-4 md:top-8">
                  <div className="h-6 md:h-7 bg-bg-200 rounded w-1/2 mb-4"></div>

                  <div className="space-y-3 mb-6">
                    <div className="h-4 bg-bg-200 rounded"></div>
                    <div className="h-4 bg-bg-200 rounded"></div>
                    <div className="h-4 bg-bg-200 rounded w-2/3"></div>
                  </div>

                  <div className="h-12 bg-bg-200 rounded mb-3"></div>
                  <div className="h-4 bg-bg-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h1>
            <p className="text-text-light mb-6">
              Add some products to get started!
            </p>

            <Link
              href="/products"
              className="inline-block bg-primary-theme text-white-theme px-6 py-3 rounded-lg hover:bg-primary-hover"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AddToCartNotification
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification({ ...notification, isVisible: false })}
      />

      <div className="min-h-screen bg-bg-gray py-4 md:py-8">
        <div className="max-w-6xl mx-auto px-3 md:px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-3">
            <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart</h1>
            <button
              onClick={clearCart}
              className="text-danger hover:text-danger text-xs md:text-sm"
            >
              Clear Cart
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3 md:space-y-4">
              {items.map((item) => (
                <div
                  key={item.variantId ? `${item.productId}-${item.variantId}` : item.productId}
                  className="bg-white rounded-xl shadow-md p-3 md:p-6 flex items-center gap-3 md:gap-6 border border-gray-100"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                        onError={(e) => { e.currentTarget.src = '/images/broken-image.png'; }}
                      />
                    ) : (
                      <img
                        src="/images/broken-image.png"
                        alt="No Image"
                        className="object-contain w-10 h-10"
                      />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-base md:text-lg truncate max-w-[140px] md:max-w-none">{item.name}</h3>
                      <span className="font-bold text-primary-theme text-base md:text-lg">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                    {item.variantName && (
                      <p className="text-text-lighter text-xs md:text-sm mb-1 truncate">{item.variantName}</p>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-500 line-through">{formatPrice(item.price)}</span>
                      {item.isDigital && (
                        <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded">Digital</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border rounded overflow-hidden">
                        <button
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 text-sm"
                        >−</button>
                        <span className="px-3 py-1 border-x text-sm bg-gray-50">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 text-sm"
                        >+</button>
                      </div>
                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="text-xs text-red-500 hover:underline ml-2"
                      >Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-light-theme rounded-lg shadow p-4 md:p-6 sticky top-4 md:top-8">
                <h2 className="text-lg md:text-xl font-bold mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600 text-sm md:text-base">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600 text-sm md:text-base">
                    <span>Shipping</span>
                    {shippingCost === 0 && hasPhysicalProducts ? (
                      <span className="text-green-600 font-semibold">FREE</span>
                    ) : (
                      <span>{formatPrice(shippingCost)}</span>
                    )}
                  </div>

                  {hasPhysicalProducts && totalPrice < 1000 && (
                    <div className="text-xs text-gray-500">
                      Add {formatPrice(1000 - totalPrice)} more for FREE shipping!
                    </div>
                  )}

                  <div className="border-t pt-3 flex justify-between font-bold text-base md:text-lg">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-primary-theme text-white-theme py-2 md:py-3 rounded-lg hover:bg-primary-hover font-medium text-sm md:text-base"
                >
                  Proceed to Checkout
                </button>

                <Link
                  href="/products"
                  className="block text-center text-blue-600 hover:underline mt-4 text-sm md:text-base"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>

          {/* Product Recommendations */}
          <div className="mt-12 md:mt-16">
            <ProductRecommendations 
              limit={4}
              showTitle={true}
              title="Customers Also Bought"
              onAddToCart={handleAddToCart}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
