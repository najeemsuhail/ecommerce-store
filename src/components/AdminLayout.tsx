import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Admin Header */}
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/admin" className="text-2xl font-bold text-blue-600">
              Admin Panel
            </Link>
            <div className="flex gap-4">
              <Link href="/admin" className="text-gray-600 hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/admin/products" className="text-gray-600 hover:text-blue-600">
                Products
              </Link>
              <Link href="/admin/orders" className="text-gray-600 hover:text-blue-600">
                Orders
              </Link>
              <Link href="/" className="text-gray-600 hover:text-blue-600">
                ← Store
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {children}
      </main>

      {/* Simple admin footer */}
      <footer className="bg-white border-t py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© 2025 E-Store Admin Panel</p>
        </div>
      </footer>
    </div>
  );
}