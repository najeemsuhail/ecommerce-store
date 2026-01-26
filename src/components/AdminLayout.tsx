'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faX } from '@fortawesome/free-solid-svg-icons';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/categories', label: 'Categories' },
    { href: '/admin/attributes', label: 'Attributes' },
    { href: '/admin/blog', label: 'Blog' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/customers', label: 'Customers' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Admin Header */}
      <nav className="bg-light-theme shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/admin" className="text-lg md:text-2xl font-bold text-primary-theme whitespace-nowrap">
              Admin Panel
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-700 hover:text-primary-theme px-3 py-2 rounded hover:bg-gray-100 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/"
                className="text-sm text-gray-700 hover:text-primary-theme px-3 py-2 rounded hover:bg-gray-100 transition-colors ml-2"
              >
                ← Store
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-700 hover:text-primary-theme"
              aria-label="Toggle menu"
            >
              <FontAwesomeIcon
                icon={mobileMenuOpen ? faX : faBars}
                className="text-xl"
              />
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-gray-700 hover:text-primary-theme px-3 py-2 rounded hover:bg-gray-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t pt-2 mt-2">
                <Link
                  href="/"
                  className="block text-sm text-gray-700 hover:text-primary-theme px-3 py-2 rounded hover:bg-gray-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ← Back to Store
                </Link>
              </div>
            </div>
          )}
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