'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout'; 

type Order = {
  id: string;
  total: number;
  status: string;
  items?: any[];
};

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    fetchOrder(orderId);
  }, [orderId]);

  const fetchOrder = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${id}`);
      const data = await response.json();

      if (data?.success) {
        setOrder(data.order);
      }
    } catch (error) {
      console.error('Failed to fetch order', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Successful!
            </h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your order has been confirmed.
            </p>
          </div>

          {/* Order Details */}
          {loading && <p className="text-gray-500 mb-4">Loading order...</p>}

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
                  <span className="font-semibold">₹{order.total}</span>
                </p>

                <p>
                  <span className="text-gray-600">Status:</span>{' '}
                  <span className="capitalize">{order.status}</span>
                </p>

                <p>
                  <span className="text-gray-600">Items:</span>{' '}
                  {order.items?.length ?? 0}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/products"
              className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Continue Shopping
            </Link>

            <Link
              href="/orders"
              className="block w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 font-medium"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
