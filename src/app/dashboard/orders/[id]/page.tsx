'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { formatPrice } from '@/lib/currency';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [returnEligibility, setReturnEligibility] = useState<{
    eligible: boolean;
    reason: string | null;
    expiresAt: string | null;
  } | null>(null);
  const [requestingAction, setRequestingAction] = useState<'return' | 'refund' | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestMessageType, setRequestMessageType] = useState<'success' | 'error' | null>(null);
  const [selectedRequestType, setSelectedRequestType] = useState<'return' | 'refund' | null>(null);
  const [requestReason, setRequestReason] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      fetchOrder();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fetchOrder = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setOrder(data.order);
        setReturnEligibility(data.returnEligibility || null);
      } else {
        router.push('/dashboard/orders');
      }
    } catch (error) {
      console.error('Failed to fetch order');
      router.push('/dashboard/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReturnOrRefund = async (requestType: 'return' | 'refund', reason: string) => {
    const token = localStorage.getItem('token');

    try {
      setRequestMessage('');
      setRequestMessageType(null);
      setRequestingAction(requestType);

      const response = await fetch(`/api/orders/${params.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestType,
          reason,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setRequestMessage(data.error || 'Failed to submit request');
        setRequestMessageType('error');
        return;
      }

      setRequestMessage(data.message || 'Request submitted successfully');
      setRequestMessageType('success');
      setSelectedRequestType(null);
      setRequestReason('');
      await fetchOrder();
    } catch (error) {
      setRequestMessage('Failed to submit request');
      setRequestMessageType('error');
    } finally {
      setRequestingAction(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return null;
  }

  const getStatusSteps = () => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = steps.indexOf(order.status);
    return steps.map((step, index) => ({
      name: step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Link
                href="/dashboard/orders"
                className="text-primary-theme hover:underline text-sm mb-2 inline-block"
              >
                ← Back to Orders
              </Link>
              <h2 className="text-2xl font-bold">Order #{order.id.substring(0, 8)}</h2>
              <p className="text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                order.status === 'pending'
                  ? 'badge-pending'
                  : order.status === 'processing'
                  ? 'badge-processing'
                  : order.status === 'shipped'
                  ? 'badge-shipped'
                  : order.status === 'delivered'
                  ? 'badge-delivered'
                  : order.status === 'return_requested'
                  ? 'badge-processing'
                  : order.status === 'returned'
                  ? 'badge-cancelled'
                  : 'badge-cancelled'
              }`}
            >
              {order.status}
            </span>
          </div>

          {requestMessage && (
            <div
              className={`mt-4 text-sm font-medium rounded-lg px-3 py-2 border ${
                requestMessageType === 'error'
                  ? 'text-red-700 bg-red-50 border-red-200'
                  : 'text-green-700 bg-green-50 border-green-200'
              }`}
            >
              {requestMessage}
            </div>
          )}

          {returnEligibility?.eligible && (
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setSelectedRequestType('return');
                  setRequestReason('');
                  setRequestMessage('');
                  setRequestMessageType(null);
                }}
                disabled={requestingAction !== null}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600 font-medium disabled:opacity-50"
              >
                {requestingAction === 'return' ? 'Submitting...' : 'Request Return'}
              </button>
              {order.paymentStatus === 'paid' && (
                <button
                  onClick={() => {
                    setSelectedRequestType('refund');
                    setRequestReason('');
                    setRequestMessage('');
                    setRequestMessageType(null);
                  }}
                  disabled={requestingAction !== null}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600 font-medium disabled:opacity-50"
                >
                  {requestingAction === 'refund' ? 'Submitting...' : 'Request Refund'}
                </button>
              )}
              {returnEligibility.expiresAt && (
                <p className="text-xs text-gray-600 w-full">
                  Eligible until{' '}
                  {new Date(returnEligibility.expiresAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          )}

          {selectedRequestType && (
            <div className="mt-4 border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-blue-900">
                {selectedRequestType === 'refund' ? 'Refund request' : 'Return request'}
              </p>
              <textarea
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                rows={3}
                placeholder={`Add a short reason for ${selectedRequestType} (optional)`}
                className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleRequestReturnOrRefund(selectedRequestType, requestReason.trim())}
                  disabled={requestingAction !== null}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {requestingAction === selectedRequestType ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  onClick={() => {
                    setSelectedRequestType(null);
                    setRequestReason('');
                  }}
                  disabled={requestingAction !== null}
                  className="px-4 py-2 border border-blue-200 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!returnEligibility?.eligible && order.status === 'delivered' && returnEligibility?.reason && (
            <p className="mt-4 text-sm text-gray-600">{returnEligibility.reason}</p>
          )}

          {/* Order Status Timeline */}
          <div className="mt-8">
            <div className="flex justify-between items-center">
              {getStatusSteps().map((step, index) => (
                <div key={step.name} className="flex-1 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        step.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step.completed ? '✓' : index + 1}
                    </div>
                    <p className={`mt-2 text-xs font-medium capitalize ${
                      step.completed ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </p>
                  </div>
                  {index < getStatusSteps().length - 1 && (
                    <div
                      className={`absolute top-5 left-1/2 w-full h-0.5 ${
                        step.completed ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                      style={{ zIndex: -1 }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-4">Order Items</h3>
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0">
                  {item.product.images?.[0] && (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-semibold hover:text-blue-600"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity}
                  </p>
                  <p className="text-sm text-gray-600">
                    Price: {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Total */}
          <div className="mt-6 pt-6 border-t space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>{formatPrice(order.total - order.shippingCost)}</span>
            </div>
            {order.shippingCost > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Shipping:</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2">
              <span>Total:</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-light-theme rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Shipping Address</h3>
              <div className="text-gray-700 space-y-1">
                <p className="font-semibold">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="pt-2">Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-4">Payment Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-semibold">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay (Online)'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    order.paymentStatus === 'paid'
                      ? 'badge-delivered'
                      : 'badge-pending'
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              {order.trackingNumber && (
                <div>
                  <p className="text-sm text-gray-600">Tracking Number</p>
                  <p className="font-mono font-semibold">{order.trackingNumber}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-primary-light border border-primary-theme rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">💬</div>
            <div>
              <h3 className="font-bold mb-2">Need Help?</h3>
              <p className="text-sm text-gray-700 mb-4">
                If you have any questions about your order, please contact our customer support.
              </p>
              <Link href="/contact" className="btn-primary-sm">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
