'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { formatPrice } from '@/lib/currency';
import { getDeliveryEstimateMessage } from '@/lib/deliveryEstimate';
import { getOrderPaymentMethodLabel, isOrderPayNowEligible } from '@/lib/orderPayment';
import {
  loadRazorpayCheckoutScript,
  type RazorpayPaymentResponse,
} from '@/lib/razorpayClient';
import {
  formatOrderStatus,
  getOrderStatusBadgeClass,
  getOrderStatusTimeline,
} from '@/lib/orderStatus';

type OrderDetailItem = {
  id: string;
  quantity: number;
  price: number;
  product: {
    isDigital?: boolean;
    name: string;
    slug: string;
    images?: string[];
  };
};

type OrderDetail = {
  id: string;
  createdAt: string;
  updatedAt?: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string | null;
  total: number;
  shippingCost: number;
  trackingNumber?: string | null;
  shippingAddress?: {
    name?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  } | null;
  user?: {
    email?: string;
  } | null;
  items: OrderDetailItem[];
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [returnEligibility, setReturnEligibility] = useState<{
    eligible: boolean;
    reason: string | null;
    expiresAt: string | null;
  } | null>(null);
  const [requestingAction, setRequestingAction] = useState<'return' | 'refund' | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestMessageType, setRequestMessageType] = useState<'success' | 'error' | null>(null);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentMessageType, setPaymentMessageType] = useState<'success' | 'error' | null>(null);
  const [isPayingNow, setIsPayingNow] = useState(false);
  const [selectedRequestType, setSelectedRequestType] = useState<'return' | 'refund' | null>(null);
  const [requestReason, setRequestReason] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
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
    } catch {
      console.error('Failed to fetch order');
      router.push('/dashboard/orders');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    void fetchOrder();

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      void fetchOrder();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchOrder]);

  useEffect(() => {
    if (!order || !isOrderPayNowEligible(order)) {
      return;
    }

    void loadRazorpayCheckoutScript().catch(() => {
      // Visible error handling happens when the user clicks Pay Now.
    });
  }, [order]);

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
    } catch {
      setRequestMessage('Failed to submit request');
      setRequestMessageType('error');
    } finally {
      setRequestingAction(null);
    }
  };

  const getStoredUserEmail = () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      return '';
    }

    try {
      const user = JSON.parse(userData) as { email?: string };
      return user.email || '';
    } catch {
      return '';
    }
  };

  const handlePayNow = async () => {
    if (!order || !isOrderPayNowEligible(order) || isPayingNow) {
      return;
    }

    const token = localStorage.getItem('token');

    try {
      setIsPayingNow(true);
      setPaymentMessage('');
      setPaymentMessageType(null);

      await loadRazorpayCheckoutScript();

      const paymentResponse = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ orderId: order.id }),
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
          email: order.user?.email || getStoredUserEmail(),
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

  const deliveryEstimateMessage = getDeliveryEstimateMessage(order);
  const statusSteps = getOrderStatusTimeline(order.status);

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
              <h2 className="text-2xl font-bold">Order #{order.id}</h2>
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
              className={`px-4 py-2 rounded-full text-sm font-semibold ${getOrderStatusBadgeClass(order.status)}`}
            >
              {formatOrderStatus(order.status)}
            </span>
          </div>

          {deliveryEstimateMessage && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
              <strong>Delivery estimate:</strong> {deliveryEstimateMessage}
            </div>
          )}

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

          {paymentMessage && (
            <div
              className={`mt-4 text-sm font-medium rounded-lg px-3 py-2 border ${
                paymentMessageType === 'error'
                  ? 'text-red-700 bg-red-50 border-red-200'
                  : 'text-green-700 bg-green-50 border-green-200'
              }`}
            >
              {paymentMessage}
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
              {statusSteps.map((step, index) => (
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
                      {formatOrderStatus(step.name)}
                    </p>
                  </div>
                  {index < statusSteps.length - 1 && (
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
            {order.items.map((item) => (
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
                  {getOrderPaymentMethodLabel(order)}
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
              {isOrderPayNowEligible(order) && (
                <div className="pt-2">
                  <button
                    onClick={() => void handlePayNow()}
                    disabled={isPayingNow}
                    className="btn-primary-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPayingNow ? 'Opening Payment...' : `Pay Now ${formatPrice(order.total)}`}
                  </button>
                  <p className="mt-2 text-xs text-gray-500">
                    Complete payment online any time before delivery.
                  </p>
                </div>
              )}
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
