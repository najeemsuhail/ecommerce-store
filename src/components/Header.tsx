'use client';

import { useEffect, useSyncExternalStore, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import SearchAutocomplete from './SearchAutocomplete';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faUser, faShoppingCart, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';

function readAdminFlagFromToken(token: string): boolean {
  try {
    const [, payload] = token.split('.');
    if (!payload) return false;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const decoded = JSON.parse(window.atob(padded)) as { isAdmin?: boolean };
    return decoded.isAdmin === true;
  } catch {
    return false;
  }
}

export default function Header() {
  const { logoUrl, storeName } = useStoreSettings();
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    const syncAuthFromStorage = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
      if (token) {
        setIsAdmin(readAdminFlagFromToken(token));
      } else {
        setIsAdmin(false);
      }
    };

    syncAuthFromStorage();

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      syncAuthFromStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <nav className="theme-header sticky top-0 z-50">
      <div className="theme-header-inner">
        <div className="flex justify-between items-center gap-4">

          {/* LEFT: Logo + Menu */}
          <div className="flex items-center gap-8 flex-shrink-0">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src={logoUrl}
                alt={`${storeName} logo`}
                width={200} 
                height={80}
                className="rounded-lg"
                unoptimized
              />
            </Link>

            {/* Desktop Menu (after logo) */}
            <div className="hidden md:flex gap-6 items-center">
              <Link 
                href="/products" 
                className={`font-medium transition-colors ${
                  pathname === '/products' || pathname.startsWith('/products/')
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-light hover:text-primary'
                }`}
              >
                Shop
              </Link>
              <Link
                href="/categories"
                className={`font-medium transition-colors ${
                  pathname === '/categories' || pathname.startsWith('/categories/')
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-light hover:text-primary'
                }`}
              >
                Collections
              </Link>
              <Link 
                href="/blog" 
                className={`font-medium transition-colors ${
                  pathname === '/blog' || pathname.startsWith('/blog/')
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-light hover:text-primary'
                }`}
              >
                Blog
              </Link>
              <Link 
                href="/about" 
                className={`font-medium transition-colors ${
                  pathname === '/about'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-light hover:text-primary'
                }`}
              >
                About
              </Link>
              
              {isLoggedIn && (
                <Link 
                  href="/dashboard" 
                  className={`font-medium transition-colors ${
                    pathname === '/dashboard' || pathname.startsWith('/dashboard/')
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-text-light hover:text-primary'
                  }`}
                >
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className={`font-medium transition-colors ${
                    pathname === '/admin' || pathname.startsWith('/admin/')
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-text-light hover:text-primary'
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* CENTER: Search Autocomplete */}
          <SearchAutocomplete className="hidden md:flex" />

          {/* RIGHT: Icons (all screens) */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Wishlist */}
            <Link href="/wishlist" className="text-gray-theme hover:text-danger-theme transition-colors" title="Wishlist">
              <FontAwesomeIcon icon={faHeart} className="w-5 h-5" />
            </Link>

            {/* Account */}
            <div
              className="relative"
              onMouseEnter={() => setAccountMenuOpen(true)}
              onMouseLeave={() => setAccountMenuOpen(false)}
            >
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="text-gray-theme hover:text-primary-theme transition-colors cursor-pointer"
                title={isLoggedIn ? 'Account' : 'Login'}
                aria-haspopup="menu"
                aria-expanded={accountMenuOpen}
              >
                <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
              </button>

              {/* Account Dropdown Menu */}
              {accountMenuOpen && (
                <div className="absolute right-0 top-full pt-2 w-48 z-50">
                  <div className="theme-account-menu overflow-hidden">
                    {!isLoggedIn ? (
                      <Link
                        href="/auth"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block w-full text-left px-4 py-3 hover:bg-light-gray-theme text-gray-theme font-medium transition-colors"
                      >
                        Sign In / Sign Up
                      </Link>
                    ) : (
                      <>
                        <Link
                          href="/dashboard"
                          onClick={() => setAccountMenuOpen(false)}
                          className="block w-full text-left px-4 py-3 hover:bg-light-gray-theme text-gray-theme font-medium border-b border-gray-200 transition-colors"
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            localStorage.removeItem('token');
                            setIsLoggedIn(false);
                            setIsAdmin(false);
                            setAccountMenuOpen(false);
                            router.push('/');
                          }}
                          className="block w-full text-left px-4 py-3 hover:bg-light-gray-theme text-dark-theme font-medium transition-colors"
                        >
                          Sign Out
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link href="/cart" className="relative text-gray-theme hover:text-primary-theme transition-colors" title="Shopping Cart">
              <FontAwesomeIcon icon={faShoppingCart} className="w-5 h-5" />

              {hasMounted && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-danger text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold" style={{backgroundColor: '#dc2626'}}>
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Hamburger (mobile only) */}
            <button
              className="md:hidden text-gray-theme hover:text-primary-theme transition-colors"
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
            className="theme-mobile-panel fixed inset-x-0 top-16 bottom-0 box-border md:hidden z-50 flex flex-col overflow-y-auto px-6 py-8 shadow-2xl"
            style={{ height: 'calc(100vh - 4rem)' }}
          >
            {/* Close Button */}
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-4 right-4 text-gray-theme hover:text-primary-theme transition-colors"
              title="Close menu"
            >
              <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
            </button>

            {/* Mobile Search */}
            <div className="mt-12 mb-6 relative">
              <SearchAutocomplete
                className="md:hidden !mx-0 !max-w-none"
                mobile
                onNavigate={() => setMenuOpen(false)}
              />
            </div>

            <div className="space-y-2 flex-1">
              <Link 
                href="/products" 
                onClick={() => setMenuOpen(false)} 
                className={`block w-full py-4 px-4 text-base font-bold rounded-lg transition-all duration-150 ${
                  pathname === '/products' || pathname.startsWith('/products/')
                    ? 'bg-primary-theme text-white-theme'
                    : 'text-gray-900 hover:bg-light-gray-theme hover:text-primary-theme'
                }`}
              >
                Shop
              </Link>
              <Link
                href="/categories"
                onClick={() => setMenuOpen(false)}
                className={`block w-full py-4 px-4 text-base font-bold rounded-lg transition-all duration-150 ${
                  pathname === '/categories' || pathname.startsWith('/categories/')
                    ? 'bg-primary-theme text-white-theme'
                    : 'text-gray-900 hover:bg-light-gray-theme hover:text-primary-theme'
                }`}
              >
                Collections
              </Link>
              <Link 
                href="/landing" 
                onClick={() => setMenuOpen(false)} 
                className={`block w-full py-4 px-4 text-base font-bold rounded-lg transition-all duration-150 ${
                  pathname === '/landing'
                    ? 'bg-primary-theme text-white-theme'
                    : 'text-gray-900 hover:bg-light-gray-theme hover:text-primary-theme'
                }`}
              >
                Landing
              </Link>
              <Link 
                href="/blog" 
                onClick={() => setMenuOpen(false)} 
                className={`block w-full py-4 px-4 text-base font-bold rounded-lg transition-all duration-150 ${
                  pathname === '/blog' || pathname.startsWith('/blog/')
                    ? 'bg-primary-theme text-white-theme'
                    : 'text-gray-900 hover:bg-light-gray-theme hover:text-primary-theme'
                }`}
              >
                Blog
              </Link>
              <Link 
                href="/about" 
                onClick={() => setMenuOpen(false)} 
                className={`block w-full py-4 px-4 text-base font-bold rounded-lg transition-all duration-150 ${
                  pathname === '/about'
                    ? 'bg-primary-theme text-white-theme'
                    : 'text-gray-900 hover:bg-light-gray-theme hover:text-primary-theme'
                }`}
              >
                About Us
              </Link>
              <Link 
                href="/contact" 
                onClick={() => setMenuOpen(false)} 
                className={`block w-full py-4 px-4 text-base font-bold rounded-lg transition-all duration-150 ${
                  pathname === '/contact'
                    ? 'bg-primary-theme text-white-theme'
                    : 'text-gray-900 hover:bg-light-gray-theme hover:text-primary-theme'
                }`}
              >
                Contact Us
              </Link>
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
                    ? 'bg-primary-theme text-white-theme'
                    : 'text-gray-900 hover:bg-light-gray-theme hover:text-primary-theme'
                }`}
              >
                {isLoggedIn ? 'Dashboard' : 'Login / Register'}
              </button>
              {isAdmin && (
                <Link 
                  href="/admin" 
                  onClick={() => setMenuOpen(false)} 
                  className={`block w-full py-4 px-4 text-base font-bold rounded-lg transition-all duration-150 ${
                    pathname === '/admin' || pathname.startsWith('/admin/')
                      ? 'bg-primary-theme text-white-theme'
                      : 'text-dark-theme hover:bg-light-gray-theme hover:text-primary-theme'
                  }`}
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

