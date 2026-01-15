'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import SearchAutocomplete from './SearchAutocomplete';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faUser, faShoppingCart, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

interface MobileSuggestion {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [mobileSuggestions, setMobileSuggestions] = useState<MobileSuggestion[]>([]);
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false);
  const [mobileLoadingSearch, setMobileLoadingSearch] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const mobileSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Fetch mobile search autocomplete suggestions
  const fetchMobileSuggestions = async (query: string) => {
    if (query.trim().length < 1) {
      setMobileSuggestions([]);
      setShowMobileSuggestions(false);
      return;
    }

    setMobileLoadingSearch(true);
    try {
      const response = await fetch(`/api/products/autocomplete?q=${encodeURIComponent(query)}&limit=6`);
      const data = await response.json();
      if (data.success) {
        setMobileSuggestions(data.suggestions);
        setShowMobileSuggestions(true);
      }
    } catch (error) {
      console.error('Failed to fetch mobile suggestions:', error);
    } finally {
      setMobileLoadingSearch(false);
    }
  };

  const handleMobileSearchChange = (value: string) => {
    setMobileSearchQuery(value);
    
    if (mobileSearchTimeoutRef.current) {
      clearTimeout(mobileSearchTimeoutRef.current);
    }

    mobileSearchTimeoutRef.current = setTimeout(() => {
      fetchMobileSuggestions(value);
    }, 300);
  };

  const handleMobileSuggestionSelect = (suggestion: MobileSuggestion) => {
    router.push(`/products/${suggestion.slug}`);
    setMobileSearchQuery('');
    setShowMobileSuggestions(false);
    setMenuOpen(false);
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
              <Link 
                href="/products" 
                className={`font-medium transition-colors ${
                  pathname === '/products' || pathname.startsWith('/products/')
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Shop
              </Link>
              <Link 
                href="/about" 
                className={`font-medium transition-colors ${
                  pathname === '/about'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                About Us
              </Link>
              <Link 
                href="/contact" 
                className={`font-medium transition-colors ${
                  pathname === '/contact'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Contact Us
              </Link>
              {isLoggedIn && (
                <Link 
                  href="/dashboard" 
                  className={`font-medium transition-colors ${
                    pathname === '/dashboard' || pathname.startsWith('/dashboard/')
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className={`font-bold transition-colors ${
                    pathname === '/admin' || pathname.startsWith('/admin/')
                      ? 'text-red-600 border-b-2 border-red-600'
                      : 'text-red-600 hover:text-red-700'
                  }`}
                >
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
            <div className="relative">
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
                title={isLoggedIn ? 'Account' : 'Login'}
              >
                <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
              </button>

              {/* Account Dropdown Menu */}
              {accountMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {!isLoggedIn ? (
                    <>
                      <Link
                        href="/auth"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-900 font-medium border-b border-gray-100 transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-900 font-medium transition-colors"
                      >
                        Sign Up
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-900 font-medium border-b border-gray-100 transition-colors"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          localStorage.removeItem('token');
                          setIsLoggedIn(false);
                          setAccountMenuOpen(false);
                          router.push('/');
                        }}
                        className="block w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-900 font-medium transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

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
            className="fixed top-16 left-0 right-0 bottom-0 md:hidden z-50 px-6 py-8 flex flex-col border-t-2 border-gray-200 shadow-2xl overflow-y-auto"
            style={{ backgroundColor: '#ffffff', width: '100vw', height: 'calc(100vh - 4rem)' }}
          >
            {/* Mobile Search */}
            <div className="mb-6 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={mobileSearchQuery}
                onChange={(e) => handleMobileSearchChange(e.target.value)}
                onFocus={() => {
                  if (mobileSearchQuery.trim()) {
                    setShowMobileSuggestions(true);
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />

              {/* Mobile Autocomplete Dropdown */}
              {showMobileSuggestions && mobileSearchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                  {mobileLoadingSearch ? (
                    <div className="px-4 py-3 text-gray-500 text-sm">Loading...</div>
                  ) : mobileSuggestions.length > 0 ? (
                    <ul className="max-h-64 overflow-y-auto">
                      {mobileSuggestions.map((suggestion) => (
                        <li key={suggestion.id}>
                          <button
                            onClick={() => handleMobileSuggestionSelect(suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            {suggestion.image && (
                              <img 
                                src={suggestion.image} 
                                alt={suggestion.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{suggestion.name}</div>
                              <div className="text-xs text-gray-600">₹{suggestion.price.toLocaleString('en-IN')}</div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-sm">No products found</div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <Link 
                href="/products" 
                onClick={() => setMenuOpen(false)} 
                className={`block w-full py-4 px-4 text-base font-bold rounded-lg transition-all duration-150 ${
                  pathname === '/products' || pathname.startsWith('/products/')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-900 hover:bg-blue-100 hover:text-blue-700'
                }`}
              >
                Shop
              </Link>
              <Link 
                href="/about" 
                onClick={() => setMenuOpen(false)} 
                className={`block w-full py-4 px-4 text-base font-bold rounded-lg transition-all duration-150 ${
                  pathname === '/about'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-900 hover:bg-blue-100 hover:text-blue-700'
                }`}
              >
                About Us
              </Link>
              <Link 
                href="/contact" 
                onClick={() => setMenuOpen(false)} 
                className={`block w-full py-4 px-4 text-base font-bold rounded-lg transition-all duration-150 ${
                  pathname === '/contact'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-900 hover:bg-blue-100 hover:text-blue-700'
                }`}
              >
                Contact Us
              </Link>
              {isAdmin && (
                <Link 
                  href="/admin" 
                  onClick={() => setMenuOpen(false)} 
                  className={`block w-full py-4 px-4 text-base font-bold rounded-lg transition-all duration-150 ${
                    pathname === '/admin' || pathname.startsWith('/admin/')
                      ? 'bg-red-600 text-white'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
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
                className={`block w-full py-4 px-4 text-base font-bold rounded-lg transition-all duration-150 text-left ${
                  pathname === '/dashboard' || pathname.startsWith('/dashboard/')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-900 hover:bg-blue-100 hover:text-blue-700'
                }`}
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

