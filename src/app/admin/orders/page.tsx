'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    try {
      let url = '/api/admin/orders';
      if (statusFilter) url += `?status=${statusFilter}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 403) {
        router.push('/');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async (orderId: string, updates: any) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      if (data.success) {
        alert('Order updated successfully');
        setShowModal(false);
        fetchOrders();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to update order');
    }
  };

  const openOrderModal = (order: any) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <h1 className="text-3xl font-bold mb-6">Orders Management</h1>

          {/* Status Filter */}
          <div className="mb-6 flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-4 py-2 rounded-lg ${
                statusFilter === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border hover:bg-gray-50'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg ${
                statusFilter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border hover:bg-gray-50'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('processing')}
              className={`px-4 py-2 rounded-lg ${
                statusFilter === 'processing'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border hover:bg-gray-50'
              }`}
            >
              Processing
            </button>
            <button
              onClick={() => setStatusFilter('shipped')}
              className={`px-4 py-2 rounded-lg ${
                statusFilter === 'shipped'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border hover:bg-gray-50'
              }`}
            >
              Shipped
            </button>
            <button
              onClick={() => setStatusFilter('delivered')}
              className={`px-4 py-2 rounded-lg ${
                statusFilter === 'delivered'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border hover:bg-gray-50'
              }`}
            >
              Delivered
            </button>
          </div>

          {/* Orders Table */}
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-mono">
                          {order.id.substring(0, 8)}...
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-sm">
                          {order.user?.name || order.guestName || 'Guest'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.user?.email || order.guestEmail}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold">₹{order.total}</p>
                        <p className="text-xs text-gray-500">
                          {order.items.length} items
                        </p>
                      </td>
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openOrderModal(order)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {orders.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No orders found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Management Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Order Details</h2>
                  <p className="text-sm text-gray-600 font-mono">
                    {selectedOrder.id}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Customer Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <p className="text-sm">
                  <strong>Name:</strong>{' '}
                  {selectedOrder.user?.name || selectedOrder.guestName}
                </p>
                <p className="text-sm">
                  <strong>Email:</strong>{' '}
                  {selectedOrder.user?.email || selectedOrder.guestEmail}
                </p>
                {selectedOrder.shippingAddress && (
                  <>
                    <p className="text-sm mt-2">
                      <strong>Phone:</strong>{' '}
                      {selectedOrder.shippingAddress.phone}
                    </p>
                    <p className="text-sm">
                      <strong>Address:</strong>{' '}
                      {selectedOrder.shippingAddress.address},{' '}
                      {selectedOrder.shippingAddress.city},{' '}
                      {selectedOrder.shippingAddress.postalCode}
                    </p>
                  </>
                )}
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="flex gap-3 items-center border-b pb-2">
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
                        <p className="font-semibold text-sm">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          Qty: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ₹{(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Subtotal:</span>
                    <span>
                      ₹{(selectedOrder.total - selectedOrder.shippingCost).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Shipping:</span>
                    <span>₹{selectedOrder.shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₹{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Update Order Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Order Status
                  </label>
                  <select
                    defaultValue={selectedOrder.status}
                    onChange={(e) => {
                      handleUpdateOrder(selectedOrder.id, {
                        status: e.target.value,
                        paymentStatus: selectedOrder.paymentStatus,
                        trackingNumber: selectedOrder.trackingNumber,
                        notes: selectedOrder.notes,
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Payment Status
                  </label>
                  <select
                    defaultValue={selectedOrder.paymentStatus}
                    onChange={(e) => {
                      handleUpdateOrder(selectedOrder.id, {
                        status: selectedOrder.status,
                        paymentStatus: e.target.value,
                        trackingNumber: selectedOrder.trackingNumber,
                        notes: selectedOrder.notes,
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tracking Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      defaultValue={selectedOrder.trackingNumber || ''}
                      placeholder="Enter tracking number"
                      id="trackingNumber"
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById('trackingNumber') as HTMLInputElement;
                        handleUpdateOrder(selectedOrder.id, {
                          status: selectedOrder.status,
                          paymentStatus: selectedOrder.paymentStatus,
                          trackingNumber: input.value,
                          notes: selectedOrder.notes,
                        });
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Admin Notes
                  </label>
                  <textarea
                    defaultValue={selectedOrder.notes || ''}
                    placeholder="Add internal notes..."
                    rows={3}
                    id="notes"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      const textarea = document.getElementById('notes') as HTMLTextAreaElement;
                      handleUpdateOrder(selectedOrder.id, {
                        status: selectedOrder.status,
                        paymentStatus: selectedOrder.paymentStatus,
                        trackingNumber: selectedOrder.trackingNumber,
                        notes: textarea.value,
                      });
                    }}
                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Save Notes
                  </button>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </AdminLayout>
  );
}