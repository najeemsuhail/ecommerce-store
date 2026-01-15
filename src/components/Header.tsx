'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import SearchAutocomplete from './SearchAutocomplete';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faUser, faShoppingCart, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function Header() {
  const router = useRouter();
  const { totalItems } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Check if user is admin
    if (token) {
      checkAdminStatus(token);
    }
  }, []);

  const checkAdminStatus = async (token: string) => {
    try {
      const response = await fetch('/api/auth/admin-check', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setIsAdmin(data.isAdmin);
    } catch (error) {
      console.error('Failed to check admin status:', error);
    }
  };

  const handleAccountClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push('/auth?redirect=/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center gap-4">

          {/* LEFT: Logo + Menu */}
          <div className="flex items-center gap-8 flex-shrink-0">
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
              {isAdmin && (
                <Link href="/admin" className="text-red-600 hover:text-red-700 font-bold">
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* CENTER: Search Autocomplete */}
          <SearchAutocomplete />

          {/* RIGHT: Icons (all screens) */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Wishlist */}
            <Link href="/wishlist" className="text-gray-700 hover:text-red-500 transition-colors" title="Wishlist">
              <FontAwesomeIcon icon={faHeart} className="w-5 h-5" />
            </Link>

            {/* Account */}
            <button
              onClick={handleAccountClick}
              className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
              title={isLoggedIn ? 'Dashboard' : 'Login'}
            >
              <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
            </button>

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
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 md:hidden z-40"
            onClick={() => setMenuOpen(false)}
            style={{ backdropFilter: 'blur(4px)' }}
          />
          
          {/* Full Screen Menu */}
          <div 
            className="fixed top-16 left-0 right-0 bottom-0 md:hidden z-50 px-6 py-8 flex flex-col border-t-2 border-gray-200 shadow-2xl"
            style={{ backgroundColor: '#ffffff', width: '100vw', height: 'calc(100vh - 4rem)', overflowY: 'hidden' }}
          >
            <div className="space-y-2 flex-1">
              <Link 
                href="/products" 
                onClick={() => setMenuOpen(false)} 
                className="block w-full py-4 px-4 text-gray-900 text-base font-bold hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-all duration-150"
              >
                Shop
              </Link>
              <Link 
                href="/about" 
                onClick={() => setMenuOpen(false)} 
                className="block w-full py-4 px-4 text-gray-900 text-base font-bold hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-all duration-150"
              >
                About Us
              </Link>
              <Link 
                href="/contact" 
                onClick={() => setMenuOpen(false)} 
                className="block w-full py-4 px-4 text-gray-900 text-base font-bold hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-all duration-150"
              >
                Contact Us
              </Link>
              {isAdmin && (
                <Link 
                  href="/admin" 
                  onClick={() => setMenuOpen(false)} 
                  className="block w-full py-4 px-4 text-white text-base font-bold bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-150"
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  if (!isLoggedIn) {
                    router.push('/auth?redirect=/dashboard');
                  } else {
                    router.push('/dashboard');
                  }
                }}
                className="block w-full py-4 px-4 text-gray-900 text-base font-bold hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-all duration-150 text-left"
              >
                {isLoggedIn ? 'Dashboard' : 'Account'}
              </button>
              
              {/* Divider */}
              <div className="my-6 border-t-2 border-gray-300" />
            </div>
            
            {/* Auth Links at Bottom */}
            {!isLoggedIn && (
              <Link 
                href="/auth" 
                onClick={() => setMenuOpen(false)} 
                className="block w-full py-4 px-4 text-white text-base font-bold bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-150 text-center"
              >
                Login / Register
              </Link>
            )}
          </div>
        </>
      )}
    </nav>
  );
}

