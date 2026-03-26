'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import Link from 'next/link';
import ProductRecommendations from '@/components/ProductRecommendations';
import { formatPrice } from '@/lib/currency';
import { getDeliveryEstimateMessage } from '@/lib/deliveryEstimate';
import { trackPurchase } from '@/lib/analytics';

type OrderSuccessItem = {
  productId: string;
  variantId?: string | null;
  quantity: number;
  price: number;
  product?: {
    name?: string | null;
  } | null;
};

type OrderSuccessOrder = {
  id: string;
  total: number;
  paymentMethod?: string | null;
  status: string;
  items?: OrderSuccessItem[];
};

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const paymentMethod = searchParams.get('method');
  const [order, setOrder] = useState<OrderSuccessOrder | null>(null);
  const trackedOrderId = useRef<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const run = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();
        if (data.success) {
          setOrder(data.order);
        }
      } catch {
        console.error('Failed to fetch order');
      }
    };

    run();
  }, [orderId]);

  useEffect(() => {
    if (!order || trackedOrderId.current === order.id) {
      return;
    }

    trackPurchase(
      order.id,
      (order.items || []).map((item) => ({
        item_id: item.productId,
        item_name: item.product?.name || 'Product',
        item_variant: item.variantId || undefined,
        price: item.price,
        quantity: item.quantity,
      })),
      order.total
    );
    trackedOrderId.current = order.id;
  }, [order]);

  const isCOD = paymentMethod === 'cod' || order?.paymentMethod === 'cod';
  const deliveryEstimateMessage = getDeliveryEstimateMessage(order);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-md mx-auto px-4 flex items-center justify-center">
          <div className="bg-light-theme rounded-lg shadow-lg p-8 w-full text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order {isCOD ? 'Placed' : 'Successful'}!
              </h1>
              <p className="text-gray-600">
                {isCOD 
                  ? 'Your order has been placed. Pay cash on delivery.'
                  : 'Thank you for your purchase. Your order has been confirmed.'}
              </p>
            </div>

            {order && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h2 className="font-semibold mb-3">Order Details</h2>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-600">Order ID:</span>{' '}
                    <span className="font-mono">{order.id}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Total:</span>{' '}
                    <span className="font-semibold">{formatPrice(order.total)}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Payment:</span>{' '}
                    <span className={`font-semibold px-2 py-1 rounded text-sm ${
                      isCOD ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {isCOD ? 'Cash on Delivery' : 'Paid Online'}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Status:</span>{' '}
                    <span className="capitalize">{order.status}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Items:</span>{' '}
                    {order.items?.length || 0}
                  </p>
                </div>
              </div>
            )}

            {deliveryEstimateMessage && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Delivery estimate:</span> {deliveryEstimateMessage}
                </p>
              </div>
            )}

            {isCOD && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💵</div>
                  <div className="text-left text-sm">
                    <p className="font-semibold text-orange-900 mb-1">Cash on Delivery</p>
                    <p className="text-orange-700">
                      Please keep {formatPrice(order?.total || 0)} ready for payment when the delivery person arrives.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Link href="/products"
                className="theme-cta-primary w-full"
              >
                Continue Shopping
              </Link>
               
              <Link href="/dashboard/orders"
                className="theme-cta-secondary w-full"
              >
                View My Orders
              </Link>
            </div>
          </div>
        </div>

        {/* Recommended For You - Full Width */}
        <div className="mt-12 bg-gradient-to-b from-white to-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <ProductRecommendations 
              limit={4}
              title="Recommended For You"
              showTitle={true}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
