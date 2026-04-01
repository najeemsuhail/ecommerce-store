'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { formatPrice } from '@/lib/currency';
import { getOrderPaymentMethodLabel, isOrderPayNowEligible } from '@/lib/orderPayment';
import { formatOrderStatus } from '@/lib/orderStatus';
import {
  loadRazorpayCheckoutScript,
  type RazorpayPaymentResponse,
} from '@/lib/razorpayClient';

interface TrackOrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: {
    name?: string;
  };
}

interface TrackOrder {
  id: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string | null;
  guestEmail?: string | null;
  shippingAddress?: {
    name?: string;
    phone?: string;
  } | null;
  user?: {
    email?: string;
  } | null;
  trackingNumber?: string | null;
  total: number;
  items?: TrackOrderItem[];
}

function OrderTrackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const guestEmail = searchParams.get('guestEmail') || searchParams.get('email');
  const [order, setOrder] = useState<TrackOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentMessageType, setPaymentMessageType] = useState<'success' | 'error' | null>(null);
  const [isPayingNow, setIsPayingNow] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setError('Missing order id in tracking link.');
      setLoading(false);
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const query = guestEmail ? `?guestEmail=${encodeURIComponent(guestEmail)}` : '';
      let response = await fetch(`/api/orders/${orderId}${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      let data = await response.json();

      if (token && response.ok && data.success) {
        router.replace(`/dashboard/orders/${orderId}`);
        return;
      }

      if (token && guestEmail && (!response.ok || !data.success)) {
        response = await fetch(`/api/orders/${orderId}?guestEmail=${encodeURIComponent(guestEmail)}`);
        data = await response.json();
      }

      if (!response.ok || !data.success) {
        setError(data.error || 'Unable to load order details.');
        return;
      }

      setOrder(data.order);
      setError('');
    } catch {
      setError('Unable to load order details.');
    } finally {
      setLoading(false);
    }
  }, [guestEmail, orderId, router]);

  useEffect(() => {
    void fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (!order || !isOrderPayNowEligible(order)) {
      return;
    }

    void loadRazorpayCheckoutScript().catch(() => {
      // Visible error handling happens on click.
    });
  }, [order]);

  const handlePayNow = async () => {
    if (!order || !isOrderPayNowEligible(order) || isPayingNow) {
      return;
    }

    try {
      setIsPayingNow(true);
      setPaymentMessage('');
      setPaymentMessageType(null);

      await loadRazorpayCheckoutScript();

      const paymentResponse = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          guestEmail: guestEmail || order.guestEmail,
        }),
      });

      const paymentResult = await paymentResponse.json();
      if (!paymentResponse.ok || !paymentResult.success) {
        setPaymentMessage(paymentResult.error || 'Unable to start payment.');
        setPaymentMessageType('error');
        setIsPayingNow(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: paymentResult.keyId,
        amount: paymentResult.amount,
        currency: paymentResult.currency,
        name: 'onlyinkani.in',
        description: `Payment for Order #${order.id}`,
        order_id: paymentResult.razorpayOrderId,
        prefill: {
          name: order.shippingAddress?.name || '',
          email: guestEmail || order.guestEmail || order.user?.email || '',
          contact: order.shippingAddress?.phone || '',
        },
        theme: {
          color: '#2563eb',
        },
        handler: async (response: RazorpayPaymentResponse) => {
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order.id,
            }),
          });

          const verifyResult = await verifyResponse.json();
          if (!verifyResponse.ok || !verifyResult.success) {
            setPaymentMessage(verifyResult.error || 'Payment verification failed.');
            setPaymentMessageType('error');
            setIsPayingNow(false);
            return;
          }

          setPaymentMessage('Payment completed successfully.');
          setPaymentMessageType('success');
          await fetchOrder();
          setIsPayingNow(false);
        },
        modal: {
          ondismiss: () => {
            setPaymentMessage('Payment cancelled.');
            setPaymentMessageType('error');
            setIsPayingNow(false);
          },
        },
      });

      razorpay.open();
    } catch {
      setPaymentMessage('Unable to launch Razorpay checkout.');
      setPaymentMessageType('error');
      setIsPayingNow(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-light-theme rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-4">Track Your Order</h1>

            {loading && (
              <div className="py-6 text-center text-gray-600">Loading order details...</div>
            )}

            {!loading && error && (
              <div className="py-4">
                <p className="text-red-600 mb-4">{error}</p>
                <p className="text-sm text-gray-600 mb-4">
                  If this is a guest order, open the link from your email exactly as received.
                </p>
                <Link href="/contact" className="text-primary-theme hover:underline">
                  Contact Support
                </Link>
              </div>
            )}

            {!loading && order && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p>
                    <span className="text-gray-600">Order ID:</span>{' '}
                    <span className="font-mono break-all">{order.id}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Status:</span>{' '}
                    <span className="font-semibold">{formatOrderStatus(order.status)}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Method:</span>{' '}
                    <span className="font-semibold">{getOrderPaymentMethodLabel(order)}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Payment:</span>{' '}
                    <span className="capitalize">{order.paymentStatus}</span>
                  </p>
                  {order.trackingNumber && (
                    <p>
                      <span className="text-gray-600">Tracking Number:</span>{' '}
                      <span className="font-mono">{order.trackingNumber}</span>
                    </p>
                  )}
                  <p>
                    <span className="text-gray-600">Total:</span>{' '}
                    <span className="font-semibold">{formatPrice(order.total)}</span>
                  </p>
                </div>

                {paymentMessage && (
                  <div
                    className={`rounded-lg border px-4 py-3 text-sm ${
                      paymentMessageType === 'error'
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-green-200 bg-green-50 text-green-700'
                    }`}
                  >
                    {paymentMessage}
                  </div>
                )}

                {isOrderPayNowEligible(order) && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm text-blue-900 mb-3">
                      This order can still be paid online before delivery.
                    </p>
                    <button
                      onClick={() => void handlePayNow()}
                      disabled={isPayingNow}
                      className="btn-primary-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPayingNow ? 'Opening Payment...' : `Pay Now ${formatPrice(order.total)}`}
                    </button>
                  </div>
                )}

                <div>
                  <h2 className="font-semibold mb-2">Items</h2>
                  <div className="space-y-3">
                    {order.items?.map((item: TrackOrderItem) => (
                      <div key={item.id} className="flex justify-between gap-3 border-b pb-2">
                        <span className="text-sm">{item.product?.name || 'Product'}</span>
                        <span className="text-sm text-gray-700">
                          {item.quantity} x {formatPrice(item.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Link href="/products" className="text-primary-theme hover:underline">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function OrderTrackPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <OrderTrackContent />
    </Suspense>
  );
}
