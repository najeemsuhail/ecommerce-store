import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Admin Header */}
      <nav className="bg-light-theme shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <Link href="/admin" className="text-lg md:text-2xl font-bold text-primary-theme whitespace-nowrap">
              Admin Panel
            </Link>
            <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
              <Link href="/admin" className="text-xs md:text-sm text-gray-theme hover:text-primary-theme px-3 py-2 rounded hover-bg-gray-light transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/products" className="text-xs md:text-sm text-gray-theme hover:text-primary-theme px-3 py-2 rounded hover-bg-gray-light transition-colors">
                Products
              </Link>
              <Link href="/admin/orders" className="text-xs md:text-sm text-gray-theme hover:text-primary-theme px-3 py-2 rounded hover-bg-gray-light transition-colors">
                Orders
              </Link>
              <Link href="/" className="text-xs md:text-sm text-gray-theme hover:text-primary-theme px-3 py-2 rounded hover-bg-gray-light transition-colors ml-auto md:ml-0">
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
      <footer className="bg-light-theme border-t py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 text-xs md:text-sm">
          <p>© 2025 E-Store Admin Panel</p>
        </div>
      </footer>
    </div>
  );
}