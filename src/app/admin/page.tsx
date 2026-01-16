'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdmin();

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      checkAdmin();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
        alert('Access denied. Admin only.');
        router.push('/');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Error:', error);
      router.push('/');
    } finally {
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

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm mb-1">Total Revenue</div>
            <div className="text-3xl font-bold text-green-600">
              ₹{stats?.totalRevenue?.toFixed(2) || 0}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm mb-1">Total Orders</div>
            <div className="text-3xl font-bold text-blue-600">
              {stats?.totalOrders || 0}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm mb-1">Total Products</div>
            <div className="text-3xl font-bold text-purple-600">
              {stats?.totalProducts || 0}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm mb-1">Total Users</div>
            <div className="text-3xl font-bold text-orange-600">
              {stats?.totalUsers || 0}
            </div>
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Orders by Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats?.ordersByStatus?.map((item: any) => (
              <div key={item.status} className="text-center p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold">{item._count}</div>
                <div className="text-sm text-gray-600 capitalize">{item.status}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Recent Orders</h2>
              <Link
                href="/admin/orders"
                className="text-blue-600 hover:underline text-sm"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {stats?.recentOrders?.map((order: any) => (
                <div key={order.id} className="border-b pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm">
                        {order.user?.name || order.guestEmail}
                      </p>
                      <p className="text-xs text-gray-600">
                        {order.items.length} items • ₹{order.total}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'shipped'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Top Selling Products</h2>
            <div className="space-y-3">
              {stats?.topProducts?.map((product: any) => (
                <div key={product.id} className="flex gap-3 items-center border-b pb-3">
                  <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover rounded"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{product.name}</p>
                    <p className="text-xs text-gray-600">
                      Sold: {product.totalSold} units
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">₹{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </AdminLayout>
    
  );
}