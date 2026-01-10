'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import Link from 'next/link';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutFlowPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');

  // Form data
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'India',
  });

  const [billingAddress, setBillingAddress] = useState({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'India',
  });

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [guestEmail, setGuestEmail] = useState('');

  // Check if user is logged in
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isLoggedIn = !!token;

  // Calculate totals
  const hasPhysicalProducts = items.some((item) => !item.isDigital);
  const shippingCost = hasPhysicalProducts ? 50.0 : 0;
  const codFee = paymentMethod === 'cod' ? 20.0 : 0; // COD handling fee
  const total = totalPrice + shippingCost + codFee;

  // Load Razorpay script
  useEffect(() => {
    if (paymentMethod === 'razorpay') {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [paymentMethod]);

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            
              <Link href="/products"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Step 1: Create order
      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress,
        billingAddress: billingSameAsShipping ? shippingAddress : billingAddress,
        billingSameAsShipping,
        paymentMethod,
        ...(isLoggedIn ? {} : { guestEmail, guestName: shippingAddress.name }),
      };

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(orderData),
      });

      const orderResult = await orderResponse.json();

      if (!orderResult.success) {
        setMessage(`Error: ${orderResult.error}`);
        setLoading(false);
        return;
      }

      setOrderId(orderResult.order.id);

      // Handle payment based on selected method
      if (paymentMethod === 'cod') {
        // COD: Mark order as COD and redirect to success
        clearCart();
        router.push(`/order-success?orderId=${orderResult.order.id}&method=cod`);
      } else {
        // Razorpay: Continue with payment flow
        await handleRazorpayPayment(orderResult.order.id);
      }
    } catch (error) {
      setMessage('Failed to process order. Please try again.');
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async (orderId: string) => {
    try {
      // Step 2: Create Razorpay order
      const paymentResponse = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResult.success) {
        setMessage(`Error: ${paymentResult.error}`);
        setLoading(false);
        return;
      }

      // Step 3: Open Razorpay checkout
      const options = {
        key: paymentResult.keyId,
        amount: paymentResult.amount,
        currency: paymentResult.currency,
        name: 'E-Store',
        description: 'Order Payment',
        order_id: paymentResult.razorpayOrderId,
        prefill: {
          name: shippingAddress.name,
          email: guestEmail || 'customer@example.com',
          contact: shippingAddress.phone,
        },
        theme: {
          color: '#2563eb',
        },
        handler: async function (response: any) {
          // Step 4: Verify payment
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId,
            }),
          });

          const verifyResult = await verifyResponse.json();

          if (verifyResult.success) {
            clearCart();
            router.push(`/order-success?orderId=${orderId}&method=razorpay`);
          } else {
            setMessage('Payment verification failed');
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setMessage('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setLoading(false);
    } catch (error) {
      setMessage('Failed to process payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <form onSubmit={handleCheckout} className="space-y-6">
                {/* Payment Method Selection */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                  
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'razorpay')}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="font-semibold">Online Payment (Razorpay)</div>
                        <div className="text-sm text-gray-600">Pay with UPI, Card, Net Banking, Wallet</div>
                      </div>
                      <div className="flex gap-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-6" />
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="font-semibold">Cash on Delivery</div>
                        <div className="text-sm text-gray-600">Pay when you receive the product</div>
                        {paymentMethod === 'cod' && (
                          <div className="text-xs text-orange-600 mt-1">+ ₹{codFee} handling fee</div>
                        )}
                      </div>
                      <div className="text-2xl">💵</div>
                    </label>
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4">Shipping Information</h2>

                  <div className="space-y-4">
                    {/* Guest Email */}
                    {!isLoggedIn && (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="you@example.com"
                        />
                      </div>
                    )}

                    {/* Shipping Address Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingAddress.name}
                          onChange={(e) =>
                            setShippingAddress({ ...shippingAddress, name: e.target.value })
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={shippingAddress.phone}
                          onChange={(e) =>
                            setShippingAddress({ ...shippingAddress, phone: e.target.value })
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="+91 9876543210"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">
                          Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingAddress.address}
                          onChange={(e) =>
                            setShippingAddress({ ...shippingAddress, address: e.target.value })
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={shippingAddress.city}
                          onChange={(e) =>
                            setShippingAddress({ ...shippingAddress, city: e.target.value })
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          PIN Code *
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingAddress.postalCode}
                          onChange={(e) =>
                            setShippingAddress({
                              ...shippingAddress,
                              postalCode: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="400001"
                        />
                      </div>
                    </div>

                    {/* Billing Address Same as Shipping */}
                    <div className="pt-4 border-t">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={billingSameAsShipping}
                          onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-medium">
                          Billing address same as shipping
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {message && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold text-lg"
                >
                  {loading ? 'Processing...' : paymentMethod === 'cod' ? `Place Order - ₹${total.toFixed(2)}` : `Pay ₹${total.toFixed(2)}`}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>

                  {shippingCost > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>₹{shippingCost.toFixed(2)}</span>
                    </div>
                  )}

                  {codFee > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>COD Handling Fee</span>
                      <span>₹{codFee.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>
                      {paymentMethod === 'cod' ? 'Secure COD order' : 'Secure payment with Razorpay'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}