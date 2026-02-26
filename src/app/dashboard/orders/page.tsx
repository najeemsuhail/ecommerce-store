'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { formatPrice } from '@/lib/currency';

const RETURN_WINDOW_HOURS = 48;

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      fetchOrders();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const isReturnEligible = (order: any) => {
    if (order.status !== 'delivered') return false;
    if (order.paymentStatus === 'refund_requested' || order.paymentStatus === 'refunded') return false;
    const expiresAt = new Date(
      new Date(order.updatedAt).getTime() + RETURN_WINDOW_HOURS * 60 * 60 * 1000
    );
    return new Date() <= expiresAt;
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-light-theme rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">My Orders</h2>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {['all', 'pending', 'processing', 'shipped', 'delivered'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  filter === status
                    ? 'bg-primary-theme text-white-theme'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">No orders found</p>
              <Link
                href="/products"
                className="btn-block-primary"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="border-2 rounded-lg p-6 hover:border-blue-600 transition-all"
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b">
                    <div>
                      <p className="font-bold text-lg">Order #{order.id.substring(0, 8)}</p>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatPrice(order.total)}</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
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
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.items.slice(0, 2).map((item: any) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0">
                          {item.product.images?.[0] && (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{item.product.name}</p>
                          <p className="text-xs text-gray-600">
                            Qty: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-sm text-gray-600">
                        +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Order Actions */}
                  <div className="flex gap-3">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="btn-primary-sm"
                    >
                      View Details
                    </Link>
                    {isReturnEligible(order) && (
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600 font-medium"
                      >
                        Return / Refund
                      </Link>
                    )}
                    {order.status === 'delivered' && (
                      <button className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600 font-medium">
                        Reorder
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
