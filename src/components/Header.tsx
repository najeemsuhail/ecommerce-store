'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faUser, faShoppingCart, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function Header() {
  const { totalItems } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">

          {/* LEFT: Logo + Menu */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                E-Store
              </span>
            </Link>

            {/* Desktop Menu (after logo) */}
            <div className="hidden md:flex gap-6 items-center">
              <Link href="/products" className="text-gray-700 hover:text-blue-600 font-medium">
                Shop
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">
                About Us
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium">
                Contact Us
              </Link>
              {isLoggedIn && (
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* RIGHT: Icons (all screens) */}
          <div className="flex items-center gap-4">
            {/* Wishlist */}
            <Link href="/wishlist" className="text-gray-700 hover:text-red-500 transition-colors" title="Wishlist">
              <FontAwesomeIcon icon={faHeart} className="w-5 h-5" />
            </Link>

            {/* Account */}
            <Link href="/auth" className="text-gray-700 hover:text-blue-600 transition-colors" title="Account">
              <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative text-gray-700 hover:text-blue-600 transition-colors" title="Shopping Cart">
              <FontAwesomeIcon icon={faShoppingCart} className="w-5 h-5" />

              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Hamburger (mobile only) */}
            <button
              className="md:hidden text-gray-700 hover:text-blue-600 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              title="Menu"
            >
              <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-4">
          <Link href="/products" onClick={() => setMenuOpen(false)} className="block text-gray-700 font-medium">
            Shop
          </Link>
          <Link href="/about" onClick={() => setMenuOpen(false)} className="block text-gray-700 font-medium">
            About Us
          </Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)} className="block text-gray-700 font-medium">
            Contact Us
          </Link>
          {isLoggedIn && (
            <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block text-gray-700 font-medium">
              Dashboard
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
