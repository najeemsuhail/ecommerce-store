'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProductRecommendations from '@/components/ProductRecommendations';
import AddToCartNotification from '@/components/AddToCartNotification';
import WhatsAppOrderButton from '@/components/WhatsAppOrderButton';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';
import { formatPrice } from '@/lib/currency';
import { calculateShippingCost } from '@/lib/shipping';
import { buildCartWhatsAppMessage } from '@/lib/whatsapp';

type RecommendationProduct = {
  id: string;
  name: string;
  price: number;
  slug: string;
  images?: string[];
  isDigital?: boolean;
  weight?: number | null;
};

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
  const { storeName } = useStoreSettings();

  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
  });

  const router = useRouter();

  // Calculate shipping based on order total
  const hasPhysicalProducts = items.some((item) => !item.isDigital);
  const shippingCost = calculateShippingCost(totalPrice, hasPhysicalProducts);
  const total = totalPrice + shippingCost;
  const whatsappMessage = buildCartWhatsAppMessage({
    storeName,
    items,
    total,
    shippingCost,
  });

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    router.push('/checkout-flow');
  };

  const handleAddToCart = (product: RecommendationProduct) => {
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

  if (items.length === 0) {
    return (
      <Layout>
        <div className="theme-page-shell min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-dark-theme mb-4">
              Your cart is empty
            </h1>
            <p className="text-text-light mb-6">
              Add some products to get started!
            </p>

            <Link
              href="/products"
              className="theme-cta-primary"
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

      <div className="theme-page-shell min-h-screen py-4 md:py-8">
        <div className="max-w-6xl mx-auto px-3 md:px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-3">
            <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart</h1>
            <button
              onClick={clearCart}
              className="theme-inline-link text-xs md:text-sm underline"
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
                  className="theme-surface p-3 md:p-6 flex items-center gap-3 md:gap-6"
                >
                  {/* Product Image */}
                  <div className="theme-product-media flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
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
                      {item.isDigital && (
                        <span className="text-xs bg-primary-light text-primary-theme px-2 py-1 rounded">Digital</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-theme rounded overflow-hidden">
                        <button
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                          className="px-2 py-1 theme-info-note hover:bg-light-gray-theme disabled:opacity-50 text-sm"
                        >−</button>
                        <span className="px-3 py-1 border-x border-gray-theme text-sm bg-light-gray-theme">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                          className="px-2 py-1 theme-info-note hover:bg-light-gray-theme text-sm"
                        >+</button>
                      </div>
                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="theme-inline-link text-xs underline ml-2"
                      >Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="theme-summary-card p-4 md:p-6 sticky top-4 md:top-8">
                <h2 className="text-lg md:text-xl font-bold mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between theme-info-note text-sm md:text-base">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>

                  <div className="flex justify-between theme-info-note text-sm md:text-base">
                    <span>Shipping</span>
                    {shippingCost === 0 && hasPhysicalProducts ? (
                      <span className="theme-success-text font-semibold">FREE</span>
                    ) : (
                      <span>{formatPrice(shippingCost)}</span>
                    )}
                  </div>

                  {hasPhysicalProducts && totalPrice < 1000 && (
                    <div className="text-xs text-text-lighter">
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
                  className="theme-cta-primary w-full"
                >
                  Proceed to Checkout
                </button>

                <WhatsAppOrderButton
                  message={whatsappMessage}
                  label={`Buy on WhatsApp - ${formatPrice(total)}`}
                  className="mt-3 w-full"
                  unavailableLabel="WhatsApp number not set"
                />

                <p className="mt-3 text-xs text-text-lighter">
                  Prefer chat-based ordering? Send your cart to WhatsApp and complete the order there.
                </p>

                <Link
                  href="/products"
                  className="theme-cta-secondary mt-4 w-full"
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
              title="Similar Products You May Like"
              onAddToCart={handleAddToCart}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
