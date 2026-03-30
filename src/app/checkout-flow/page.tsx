'use client';

import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import Link from 'next/link';
import ProductRecommendations from '@/components/ProductRecommendations';
import AddToCartNotification from '@/components/AddToCartNotification';
import CouponInput from '@/components/CouponInput';
import DeliveryPinChecker from '@/components/DeliveryPinChecker';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';
import { formatPrice } from '@/lib/currency';
import { calculateShippingCost } from '@/lib/shipping';
import { trackBeginCheckout } from '@/lib/analytics';

type RazorpayPaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayPaymentResponse) => Promise<void>;
  modal: {
    ondismiss: () => void;
  };
};

type SavedAddress = {
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
};

type AddressForm = {
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

type BillingAddressForm = {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

type RecommendationProduct = {
  id: string;
  name: string;
  price: number;
  slug: string;
  images?: string[];
  isDigital?: boolean;
  weight?: number | null;
};

type StoredCheckoutUser = {
  address?: SavedAddress[];
};

const EMPTY_SHIPPING_ADDRESS: AddressForm = {
  name: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'India',
};

const EMPTY_BILLING_ADDRESS: BillingAddressForm = {
  name: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'India',
};

function getStoredAddresses(): SavedAddress[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const userData = localStorage.getItem('user');
  if (!userData) {
    return [];
  }

  const user = JSON.parse(userData) as StoredCheckoutUser;
  return user.address || [];
}

function getDefaultAddressIndex(addresses: SavedAddress[]): number | null {
  const defaultIndex = addresses.findIndex((addr) => addr.isDefault);
  return defaultIndex === -1 ? null : defaultIndex;
}

function mapSavedAddressToShipping(address: SavedAddress): AddressForm {
  return {
    name: address.name,
    phone: address.phone,
    address: address.address,
    city: address.city,
    postalCode: address.postalCode,
    country: address.country,
  };
}

function mapSavedAddressToBilling(address: SavedAddress): BillingAddressForm {
  return {
    name: address.name,
    address: address.address,
    city: address.city,
    postalCode: address.postalCode,
    country: address.country,
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export default function CheckoutFlowPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart, addItem } = useCart();
  const { codEnabled } = useStoreSettings();
  const initialSavedAddresses = getStoredAddresses();
  const defaultShippingAddressIndex = getDefaultAddressIndex(initialSavedAddresses);
  const beginCheckoutTracked = useRef(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [notification, setNotification] = useState({ isVisible: false, message: '' });

  // Saved addresses
  const [savedAddresses] = useState<SavedAddress[]>(initialSavedAddresses);
  const [selectedShippingAddressIndex, setSelectedShippingAddressIndex] = useState<number | null>(defaultShippingAddressIndex);
  const [selectedBillingAddressIndex, setSelectedBillingAddressIndex] = useState<number | null>(null);
  const [useNewShippingAddress, setUseNewShippingAddress] = useState(defaultShippingAddressIndex === null);
  const [useNewBillingAddress, setUseNewBillingAddress] = useState(false);

  // Form data
  const [shippingAddress, setShippingAddress] = useState<AddressForm>(
    defaultShippingAddressIndex === null
      ? EMPTY_SHIPPING_ADDRESS
      : mapSavedAddressToShipping(initialSavedAddresses[defaultShippingAddressIndex])
  );

  const [billingAddress, setBillingAddress] = useState<BillingAddressForm>(EMPTY_BILLING_ADDRESS);

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  // Coupon states
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [appliedCouponId, setAppliedCouponId] = useState('');

  const handleCouponApplied = (discount: number, code: string, couponId: string) => {
    setAppliedDiscount(discount);
    setAppliedCouponCode(code);
    setAppliedCouponId(couponId);
  };

  const handleAddToCartRecommendations = (product: RecommendationProduct) => {
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
      isVisible: true,
      message: `${product.name} added to cart!`,
    });
  };

  // Check if user is logged in
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isLoggedIn = !!token;

  // Redirect to login if not logged in
  useEffect(() => {
    const checkAuth = () => {
      const currentToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!currentToken) {
        router.push('/auth?redirect=/checkout-flow');
      }
    };

    checkAuth();

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [router]);

  // Calculate totals
  const hasPhysicalProducts = items.some((item) => !item.isDigital);
  const shippingCost = calculateShippingCost(totalPrice, hasPhysicalProducts);
  const effectivePaymentMethod = codEnabled ? paymentMethod : 'razorpay';
  const codFee = effectivePaymentMethod === 'cod' ? 20.0 : 0; // COD handling fee
  const subtotal = totalPrice + shippingCost + codFee;
  const total = Math.max(0, subtotal - appliedDiscount);

  useEffect(() => {
    if (items.length === 0 || beginCheckoutTracked.current) {
      return;
    }

    trackBeginCheckout(
      items.map((item) => ({
        item_id: item.productId,
        item_name: item.name,
        item_variant: item.variantName,
        price: item.price,
        quantity: item.quantity,
      })),
      total
    );
    beginCheckoutTracked.current = true;
  }, [items, total]);

  // Load Razorpay script
  useEffect(() => {
    if (effectivePaymentMethod === 'razorpay') {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [effectivePaymentMethod]);

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <Layout>
        <div className="theme-page-shell min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            
              <Link href="/products"
              className="theme-cta-primary"
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
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        shippingAddress,
        billingAddress: billingSameAsShipping ? shippingAddress : billingAddress,
        billingSameAsShipping,
        paymentMethod: effectivePaymentMethod,
        couponCode: appliedCouponCode,
        couponId: appliedCouponId,
        discount: appliedDiscount,
      };

      console.log('Sending order data:', orderData);

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(orderData),
      });

      const orderResult = await orderResponse.json();

      console.log('Order response:', orderResult);

      if (!orderResult.success) {
        setMessage(`Error: ${orderResult.error}`);
        setLoading(false);
        return;
      }

      // Handle payment based on selected method
      if (effectivePaymentMethod === 'cod') {
        // COD: Mark order as COD and redirect to success
        clearCart();
        router.push(`/order-success?orderId=${orderResult.order.id}&method=cod`);
      } else {
        // Razorpay: Continue with payment flow
        await handleRazorpayPayment(orderResult.order.id);
      }
    } catch {
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
        name: 'onlyinkani.in',
        description: 'Order Payment',
        order_id: paymentResult.razorpayOrderId,
        prefill: {
          name: shippingAddress.name,
          email: localStorage.getItem('userEmail') || shippingAddress.name,
          contact: shippingAddress.phone,
        },
        theme: {
          color: '#2563eb',
        },
        handler: async function (response: RazorpayPaymentResponse) {
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
    } catch {
      setMessage('Failed to process payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <AddToCartNotification
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification({ isVisible: false, message: '' })}
      />

      <div className="theme-page-shell min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <form onSubmit={handleCheckout} noValidate className="space-y-6">
                {/* Coupon Section */}
                <div className="theme-surface p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🎟️</span>
                    <h2 className="text-xl font-bold">Apply Coupon Code</h2>
                  </div>
                  <p className="theme-info-note text-sm mb-4">Have a coupon code? Apply it here to get a discount on your order.</p>
                  <CouponInput 
                    orderTotal={subtotal}
                    onCouponApplied={handleCouponApplied}
                    appliedCode={appliedCouponCode}
                  />
                </div>

                {/* Payment Method Selection */}
                <div className="theme-surface p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <svg className="w-6 h-6 text-primary-theme" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h10m4 0a1 1 0 100-2 1 1 0 000 2zM7 3h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                    </svg>
                    <h2 className="text-xl font-bold">Payment Method</h2>
                  </div>
                  
                  <div className={`grid grid-cols-1 gap-4 ${codEnabled ? 'md:grid-cols-2' : ''}`}>
                    <label className={`theme-option-card flex items-start gap-3 p-4 cursor-pointer ${
                      effectivePaymentMethod === 'razorpay'
                        ? 'theme-option-card-active'
                        : ''
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={effectivePaymentMethod === 'razorpay'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'razorpay')}
                        className="theme-check w-5 h-5 mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-dark-theme">Online Payment</div>
                        <div className="theme-info-note text-sm">UPI, Card, Net Banking, Wallet</div>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-5 mt-2" />
                      </div>
                    </label>

                    {codEnabled && (
                    <label className={`theme-option-card flex items-start gap-3 p-4 cursor-pointer ${
                        effectivePaymentMethod === 'cod'
                        ? 'theme-option-card-active'
                        : ''
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                          checked={effectivePaymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                        className="theme-check w-5 h-5 mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-dark-theme">Cash on Delivery</div>
                        <div className="theme-info-note text-sm">Pay on delivery</div>
                          {effectivePaymentMethod === 'cod' && (
                          <div className="text-xs text-orange-600 mt-2 font-medium">💰 +{formatPrice(codFee)} handling fee</div>
                        )}
                      </div>
                    </label>
                    )}
                  </div>
                  {!codEnabled && (
                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      Cash on Delivery is currently unavailable. Online payment is enabled for this store.
                    </div>
                  )}
                </div>

                {/* Shipping Information */}
                <div className="theme-surface p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <svg className="w-6 h-6 text-primary-theme" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8c4.627-1.332 6.39-1.332 11 0M5 8v10c0 1.657.895 3 2 3h12c1.105 0 2-1.343 2-3V8M5 8l7-3m7 3l-7-3" />
                    </svg>
                    <h2 className="text-xl font-bold">Shipping Address</h2>
                  </div>

                  {/* Saved Addresses Selection */}
                  {savedAddresses.length > 0 && (
                    <div className="mb-6 pb-6 border-b">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-theme">Your saved addresses</h3>
                        <Link href="/dashboard/addresses" className="theme-inline-link text-xs underline">
                          Manage
                        </Link>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {savedAddresses.map((addr, index) => (
                          <label key={index} className={`theme-option-card relative flex items-start gap-3 p-4 cursor-pointer ${
                            !useNewShippingAddress && selectedShippingAddressIndex === index
                              ? 'theme-option-card-active'
                              : ''
                          }`}>
                            <input
                              type="radio"
                              name="shippingAddressOption"
                              checked={!useNewShippingAddress && selectedShippingAddressIndex === index}
                              onChange={() => {
                                setUseNewShippingAddress(false);
                                setSelectedShippingAddressIndex(index);
                                setShippingAddress(mapSavedAddressToShipping(addr));
                              }}
                              className="theme-check w-5 h-5 mt-0.5 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="font-semibold text-dark-theme">{addr.name}</div>
                                {addr.isDefault && (
                                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className="theme-info-note text-sm">{addr.address}</div>
                              <div className="theme-info-note text-sm">{addr.city}, {addr.postalCode}</div>
                              {addr.phone && <div className="text-xs text-gray-500 mt-1">☎ {addr.phone}</div>}
                            </div>
                            {!useNewShippingAddress && selectedShippingAddressIndex === index && (
                              <div className="absolute top-4 right-4 text-primary-theme">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </label>
                        ))}
                      </div>
                      
                      <label className="theme-option-card flex items-center gap-3 p-4 border-dashed cursor-pointer mt-3">
                        <input
                          type="radio"
                          name="shippingAddressOption"
                          checked={useNewShippingAddress}
                          onChange={() => {
                            setUseNewShippingAddress(true);
                            setSelectedShippingAddressIndex(null);
                            setShippingAddress(EMPTY_SHIPPING_ADDRESS);
                          }}
                          className="theme-check w-5 h-5"
                        />
                        <span className="text-sm font-medium text-gray-theme">+ Add a new address</span>
                      </label>
                    </div>
                  )}

                  {useNewShippingAddress && (
                    <div className="mb-6 pb-6 border-b">
                      <h3 className="font-semibold text-gray-theme mb-4">Enter shipping address</h3>
                    </div>
                  )}

                  <div className={`space-y-4 ${!useNewShippingAddress && savedAddresses.length > 0 ? 'hidden' : ''}`}>
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
                          className="theme-form-input"
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
                          className="theme-form-input"
                          placeholder="Enter 10-digit phone number"
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
                          className="theme-form-input"
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
                          className="theme-form-input"
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
                          className="theme-form-input"
                          placeholder="Enter 6-digit PIN code"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Pincode Checker - Optional check */}
                  <div className="theme-muted-panel my-6 p-4">
                    <p className="theme-info-note text-sm mb-3">Want to check if we deliver to your area?</p>
                    <DeliveryPinChecker />
                  </div>

                  {/* Billing Address Same as Shipping - OUTSIDE hidden shipping form */}
                  <div className="pt-4 border-t">
                    <label className="theme-option-card flex items-center gap-3 p-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={billingSameAsShipping}
                        onChange={(e) => {
                          setBillingSameAsShipping(e.target.checked);
                          if (e.target.checked) {
                            setUseNewBillingAddress(false);
                            setSelectedBillingAddressIndex(null);
                            setBillingAddress(EMPTY_BILLING_ADDRESS);
                          }
                        }}
                        className="theme-check w-5 h-5 rounded"
                      />
                      <span className="text-sm font-medium text-gray-theme">
                        Billing address same as shipping
                      </span>
                    </label>
                  </div>

                  {/* Billing Address Form (shown when unchecked) - OUTSIDE hidden shipping form */}
                  {!billingSameAsShipping && (
                    <div className="pt-6 border-t">
                      <div className="flex items-center gap-2 mb-6">
                        <svg className="w-6 h-6 text-primary-theme" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-bold">Billing Address</h3>
                      </div>

                      {/* Saved Addresses Selection for Billing */}
                      {isLoggedIn && savedAddresses.length > 0 && (
                        <div className="mb-6 pb-6 border-b">
                          <h4 className="text-sm font-semibold text-gray-theme mb-3">Use a saved address</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {savedAddresses.map((addr, index) => (
                              <label key={index} className={`theme-option-card relative flex items-start gap-3 p-4 cursor-pointer ${
                                !useNewBillingAddress && selectedBillingAddressIndex === index
                                  ? 'theme-option-card-active'
                                  : ''
                              }`}>
                                <input
                                  type="radio"
                                  name="billingAddressOption"
                                checked={!useNewBillingAddress && selectedBillingAddressIndex === index}
                                onChange={() => {
                                  setUseNewBillingAddress(false);
                                  setSelectedBillingAddressIndex(index);
                                  setBillingAddress(mapSavedAddressToBilling(addr));
                                }}
                                  className="theme-check w-5 h-5 mt-0.5 flex-shrink-0 cursor-pointer"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-dark-theme text-sm">{addr.name}</div>
                                  <div className="theme-info-note text-sm">{addr.address}</div>
                                  <div className="theme-info-note text-sm">{addr.city}, {addr.postalCode}</div>
                                </div>
                                {!useNewBillingAddress && selectedBillingAddressIndex === index && (
                                  <div className="absolute top-4 right-4 text-primary-theme">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </label>
                            ))}
                          </div>
                          
                          <label className="theme-option-card flex items-center gap-3 p-4 border-dashed cursor-pointer mt-3">
                            <input
                              type="radio"
                              name="billingAddressOption"
                              checked={useNewBillingAddress}
                              onChange={() => {
                                setUseNewBillingAddress(true);
                                setSelectedBillingAddressIndex(null);
                                setBillingAddress(EMPTY_BILLING_ADDRESS);
                              }}
                              className="theme-check w-5 h-5 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-gray-theme">+ Add a new address</span>
                          </label>
                        </div>
                      )}

                      {(savedAddresses.length === 0 || useNewBillingAddress) && (
                        <div className="mb-6 pb-6 border-b">
                          <h4 className="font-semibold text-gray-theme mb-4">Enter billing address</h4>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={billingAddress.name}
                            onChange={(e) =>
                              setBillingAddress({ ...billingAddress, name: e.target.value })
                            }
                            className="theme-form-input"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-1">
                            Address *
                          </label>
                          <input
                            type="text"
                            required
                            value={billingAddress.address}
                            onChange={(e) =>
                              setBillingAddress({ ...billingAddress, address: e.target.value })
                            }
                            className="theme-form-input"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">City *</label>
                          <input
                            type="text"
                            required
                            value={billingAddress.city}
                            onChange={(e) =>
                              setBillingAddress({ ...billingAddress, city: e.target.value })
                            }
                            className="theme-form-input"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            PIN Code *
                          </label>
                          <input
                            type="text"
                            required
                            value={billingAddress.postalCode}
                            onChange={(e) =>
                              setBillingAddress({
                                ...billingAddress,
                                postalCode: e.target.value,
                              })
                            }
                            className="theme-form-input"
                            placeholder="Enter 6-digit PIN code"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-1">
                            Country
                          </label>
                          <input
                            type="text"
                            value={billingAddress.country}
                            onChange={(e) =>
                              setBillingAddress({ ...billingAddress, country: e.target.value })
                            }
                            className="theme-form-input"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {message && (
                  <div className="flex items-start gap-3 p-4 bg-danger-light border border-danger-theme text-danger-theme rounded-lg">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="theme-cta-primary disabled:bg-gray-400 disabled:cursor-not-allowed w-full"
                >
                  {loading && (
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                  <span>
                    {loading ? 'Processing...' : effectivePaymentMethod === 'cod' ? `Place Order - ${formatPrice(total)}` : `Pay ${formatPrice(total)}`}
                  </span>
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="theme-summary-card p-6 sticky top-8">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.variantId ? `${item.productId}-${item.variantId}` : item.productId} className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-light rounded flex-shrink-0">
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
                        {item.variantName && (
                          <p className="text-xs text-text-lighter">{item.variantName}</p>
                        )}
                        <p className="theme-info-note text-sm">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between theme-info-note">
                    <span>Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>

                  <div className="flex justify-between theme-info-note">
                    <span>Shipping</span>
                    {shippingCost === 0 && hasPhysicalProducts ? (
                      <span className="theme-success-text font-semibold">FREE</span>
                    ) : (
                      <span>{formatPrice(shippingCost)}</span>
                    )}
                  </div>

                  {hasPhysicalProducts && totalPrice < 1000 && (
                    <div className="theme-success-text text-xs">
                      Add {formatPrice(1000 - totalPrice)} more for FREE shipping!
                    </div>
                  )}

                  {codFee > 0 && (
                    <div className="flex justify-between text-warning">
                      <span>COD Handling Fee</span>
                      <span>{formatPrice(codFee)}</span>
                    </div>
                  )}

                  {appliedDiscount > 0 && (
                    <div className="flex justify-between theme-success-text font-semibold">
                      <span>Coupon Discount ({appliedCouponCode})</span>
                      <span>-{formatPrice(appliedDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm theme-info-note">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>
                      {effectivePaymentMethod === 'cod' ? 'Secure COD order' : 'Secure payment with Razorpay'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Recommendations - Full Width */}
          <div className="theme-section-shell mt-12 -mx-4 md:-mx-8 px-4 md:px-8 py-12 md:py-16">
            <div className="max-w-6xl mx-auto">
              <h3 className="theme-section-heading text-3xl md:text-4xl font-bold mb-2">Add Items to Your Order</h3>
              <p className="text-text-light mb-8">Enhance your order with these recommended products</p>
              <ProductRecommendations 
                limit={4}
                showTitle={false}
                className="px-0"
                onAddToCart={handleAddToCartRecommendations}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
