'use client';

import AdminLayout from '@/components/AdminLayout';
import CouponManager from '@/components/CouponManager';

export default function AdminCouponsPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CouponManager />
      </div>
    </AdminLayout>
  );
}
