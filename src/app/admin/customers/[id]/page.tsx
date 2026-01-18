'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';

interface CustomerDetail {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  address: any;
  createdAt: string;
  updatedAt: string;
  orders: any[];
  reviews: any[];
  wishlistGroups: any[];
  stats: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    totalReviews: number;
    totalWishlists: number;
  };
}

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin && customerId) {
      fetchCustomer();
    }
  }, [isAdmin, customerId]);

  const checkAdmin = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 403) {
        setAuthError('Access denied. You are not authorized to view this page.');
        setLoading(false);
        return;
      }

      if (response.ok) {
        setIsAdmin(true);
        setAuthError(null);
      } else {
        setAuthError('Failed to verify admin access.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setAuthError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const fetchCustomer = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomer(data.data);
      } else if (response.status === 404) {
        setAuthError('Customer not found');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customer:', error);
      setAuthError('Failed to fetch customer details');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  if (authError) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white rounded-lg shadow p-8 max-w-md text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900">{authError}</h1>
            <Link href="/admin/customers" className="text-blue-600 hover:underline mt-4 inline-block">
              Back to Customers
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin || !customer) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/admin/customers" className="text-blue-600 hover:underline mb-4 inline-block">
              ← Back to Customers
            </Link>
            <h1 className="text-3xl font-bold mt-2">{customer.name || 'Guest Customer'}</h1>
          </div>

          {/* Customer Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm mb-1">Total Orders</div>
              <div className="text-3xl font-bold text-blue-600">
                {customer.stats.totalOrders}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm mb-1">Total Spent</div>
              <div className="text-3xl font-bold text-green-600">
                ₹{customer.stats.totalSpent.toFixed(2)}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm mb-1">Avg Order Value</div>
              <div className="text-3xl font-bold text-purple-600">
                ₹{customer.stats.averageOrderValue.toFixed(2)}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm mb-1">Reviews</div>
              <div className="text-3xl font-bold text-orange-600">
                {customer.stats.totalReviews}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm mb-1">Wishlists</div>
              <div className="text-3xl font-bold text-pink-600">
                {customer.stats.totalWishlists}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Customer Information */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Customer Information</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">{customer.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold break-all">{customer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{customer.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="font-semibold">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-semibold text-xs">
                      {new Date(customer.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Addresses</h2>
                {customer.address && typeof customer.address === 'object' && Object.keys(customer.address).length > 0 ? (
                  <div className="space-y-4">
                    {Array.isArray(customer.address) ? (
                      customer.address.map((addr: any, idx: number) => (
                        <div key={idx} className="border rounded p-4 bg-gray-50">
                          <h3 className="font-semibold mb-2">{addr.type || `Address ${idx + 1}`}</h3>
                          <p className="text-sm text-gray-700">{addr.address}</p>
                          <p className="text-sm text-gray-700">
                            {addr.city}, {addr.state} {addr.pincode}
                          </p>
                          <p className="text-sm text-gray-700">{addr.country}</p>
                        </div>
                      ))
                    ) : (
                      <div className="border rounded p-4 bg-gray-50">
                        <pre className="text-sm overflow-auto">
                          {JSON.stringify(customer.address, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">No addresses on file</p>
                )}
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Orders ({customer.orders.length})</h2>
            {customer.orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">Order ID</th>
                      <th className="px-4 py-2 text-left font-semibold">Items</th>
                      <th className="px-4 py-2 text-right font-semibold">Total</th>
                      <th className="px-4 py-2 text-center font-semibold">Status</th>
                      <th className="px-4 py-2 text-center font-semibold">Payment</th>
                      <th className="px-4 py-2 text-left font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {customer.orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/orders#${order.id}`}
                            className="text-blue-600 hover:underline font-mono text-xs"
                          >
                            {order.id.substring(0, 8)}...
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          ₹{order.total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'processing'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'shipped'
                                ? 'bg-purple-100 text-purple-800'
                                : order.status === 'delivered'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              order.paymentStatus === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : order.paymentStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">No orders yet</p>
            )}
          </div>

          {/* Reviews Section */}
          {customer.reviews.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Recent Reviews ({customer.reviews.length})</h2>
              <div className="space-y-4">
                {customer.reviews.map((review: any) => (
                  <div key={review.id} className="border rounded p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold">{review.product.name}</p>
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1 font-semibold">{review.rating}/5</span>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                    )}
                    {review.isVerified && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
