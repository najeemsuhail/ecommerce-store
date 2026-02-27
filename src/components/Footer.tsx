'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CURRENCY_CONFIG } from '@/lib/currency';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subscribeMessage, setSubscribeMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setSubscribeStatus('error');
      setSubscribeMessage('Please enter a valid email');
      return;
    }

    setSubscribeStatus('loading');
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setSubscribeStatus('success');
      setSubscribeMessage('Successfully subscribed! Check your email.');
      setEmail('');
      
      // Reset message after 3 seconds
      setTimeout(() => {
        setSubscribeStatus('idle');
        setSubscribeMessage('');
      }, 3000);
    } catch (error: any) {
      setSubscribeStatus('error');
      setSubscribeMessage(error.message || 'Failed to subscribe. Please try again.');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSubscribeStatus('idle');
        setSubscribeMessage('');
      }, 3000);
    }
  };

  return (
    <footer className="bg-gradient-to-b from-slate-900 via-slate-900 to-black text-white py-16 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image 
                src="/images/logo/brand-logo.png?t=1" 
                alt="Onlyinkani Logo" 
                width={200} 
                height={80}
                className="rounded-lg"
                unoptimized
              />
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your ultimate destination for premium products and amazing shopping experiences. Quality products, great prices, delivered fast.
            </p>
            <div className="flex gap-3 pt-4">
              {[
                { icon: faFacebook, url: '#', label: 'Facebook' },
                { icon: faInstagram, url: '#', label: 'Instagram' }
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 transition-all duration-300 hover:scale-110"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={social.icon} className="w-5 h-5" />
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-2 text-xs text-gray-400 pt-4 border-t border-slate-700">
              <Link href="/unsubscribe" className="hover:text-blue-400 transition">
                📧 Manage Newsletter
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white">Products</h3>
            <ul className="space-y-3">
              <li><Link href="/products" className="text-gray-300 hover:text-blue-400 transition font-medium">All Products</Link></li>
              <li><Link href="/products?isFeatured=true" className="text-gray-300 hover:text-blue-400 transition font-medium">Featured</Link></li>
              <li><Link href="/products?category=sales" className="text-gray-300 hover:text-blue-400 transition font-medium">On Sale</Link></li>
              <li><Link href="/products?sort=new" className="text-gray-300 hover:text-blue-400 transition font-medium">New Arrivals</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white">Support</h3>
            <ul className="space-y-3">
              <li><Link href="/contact" className="text-gray-300 hover:text-blue-400 transition font-medium">Contact Us</Link></li>
              <li><Link href="/faq" className="text-gray-300 hover:text-blue-400 transition font-medium">FAQs</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-gray-300 hover:text-blue-400 transition font-medium">About Us</Link></li>
              <li><Link href="/blog" className="text-gray-300 hover:text-blue-400 transition font-medium">Blog</Link></li>
            </ul>
          </div>


          {/* Newsletter */}
          <div className="min-w-0 md:col-span-2 lg:col-span-1" suppressHydrationWarning>
            <h3 className="font-bold text-lg mb-6 text-white">Subscribe</h3>
            <p className="text-gray-300 text-sm mb-4">Get exclusive deals and updates delivered to your inbox.</p>
            
            {subscribeMessage && (
              <div className={`text-xs mb-3 p-2 rounded break-words ${
                subscribeStatus === 'success' 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {subscribeMessage}
              </div>
            )}
            
            <form onSubmit={handleSubscribe} className="flex flex-col xl:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                disabled={subscribeStatus === 'loading'}
                className="flex-1 min-w-0 w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button 
                type="submit"
                disabled={subscribeStatus === 'loading'}
                className="w-full xl:w-auto px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {subscribeStatus === 'loading' ? '...' : '→'}
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: '🚚', title: 'Free Shipping', desc: `On orders over ${CURRENCY_CONFIG.symbol}1000` },
              { icon: '🛡️', title: 'Secure Payment', desc: '100% encrypted' },
              { icon: '↩️', title: 'Easy Returns', desc: '48 hours guarantee' }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="font-semibold text-white text-sm">{item.title}</p>
                <p className="text-gray-400 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <p className="text-gray-400 text-sm">&copy; 2026 Onlyinka.in All rights reserved.</p>
            <div className="flex gap-6 text-gray-400 text-sm">
              <Link href="/privacy-policy" className="hover:text-blue-400 transition">Privacy Policy</Link>
              <Link href="/terms-of-service" className="hover:text-blue-400 transition">Terms of Service</Link>
              <Link href="/refund-policy" className="hover:text-blue-400 transition">Refund Policy</Link>
              <Link href="/contact" className="hover:text-blue-400 transition">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
