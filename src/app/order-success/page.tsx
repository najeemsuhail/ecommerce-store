'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import Link from 'next/link';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const paymentMethod = searchParams.get('method');
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      if (data.success) {
        setOrder(data.order);
      }
    } catch (error) {
      console.error('Failed to fetch order');
    }
  };

  const isCOD = paymentMethod === 'cod' || order?.paymentMethod === 'cod';

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-light-theme rounded-lg shadow-lg p-8 w-full max-w-md text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-success-theme"
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
                  <span className="font-semibold">₹{order.total}</span>
                </p>
                <p>
                  <span className="text-gray-600">Payment:</span>{' '}
                  <span className={`font-semibold ${isCOD ? 'text-orange-600' : 'text-green-600'}`}>
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

          {isCOD && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💵</div>
                <div className="text-left text-sm">
                  <p className="font-semibold text-orange-900 mb-1">Cash on Delivery</p>
                  <p className="text-orange-700">
                    Please keep ₹{order?.total || '0'} ready for payment when the delivery person arrives.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            
             <Link href="/products"
              className="w-full btn-full-primary"
            >
              Continue Shopping
            </Link>
            
             <Link href="/orders/test"
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 font-medium"
            >
              View My Orders
            </Link>
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