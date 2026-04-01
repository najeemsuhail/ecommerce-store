'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { formatPrice } from '@/lib/currency';
import { getOrderPaymentMethodLabel } from '@/lib/orderPayment';
import { formatOrderStatus } from '@/lib/orderStatus';

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
