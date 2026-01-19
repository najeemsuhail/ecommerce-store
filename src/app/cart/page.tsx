'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProductRecommendations from '@/components/ProductRecommendations';
import AddToCartNotification from '@/components/AddToCartNotification';

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

  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
  });

  const router = useRouter();

  const shippingCost = items.some((item) => !item.isDigital) ? 50.0 : 0;
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
    });
    
    setNotification({
      isVisible: true,
      message: `${product.name} added to cart!`,
    });
  };

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
                  className="bg-light-theme rounded-lg shadow p-3 md:p-6 flex flex-col md:flex-row gap-3 md:gap-4"
                >
                  {/* Product Image */}
                  <div className="w-full md:w-24 md:h-24 h-40 bg-bg-gray rounded flex-shrink-0 relative">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-lighter">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-base md:text-lg mb-1">
                      {item.name}
                    </h3>
                    {item.variantName && (
                      <p className="text-text-lighter text-xs md:text-sm mb-2">
                        {item.variantName}
                      </p>
                    )}
                    <p className="text-text-light text-sm mb-3 md:mb-2">
                      ₹{item.price.toFixed(2)}
                      {item.isDigital && (
                        <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                          Digital
                        </span>
                      )}
                    </p>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center border rounded">
                        <button
                          disabled={item.quantity <= 1}
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity - 1,
                              item.variantId
                            )
                          }
                          className="px-2 md:px-3 py-1 hover:bg-gray-100 disabled:opacity-50 text-sm"
                        >
                          −
                        </button>

                        <span className="px-3 md:px-4 py-1 border-x text-sm">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity + 1,
                              item.variantId
                            )
                          }
                          className="px-2 md:px-3 py-1 hover:bg-gray-100 text-sm"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="text-red-600 hover:text-red-700 text-xs md:text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start">
                    <span className="text-gray-600 text-xs md:hidden">Total:</span>
                    <p className="font-semibold text-base md:text-lg">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
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
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>

                  {shippingCost > 0 && (
                    <div className="flex justify-between text-gray-600 text-sm md:text-base">
                      <span>Shipping</span>
                      <span>₹{shippingCost.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t pt-3 flex justify-between font-bold text-base md:text-lg">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
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
