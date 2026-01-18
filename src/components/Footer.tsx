import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-900 via-slate-900 to-black text-white py-16 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image 
                src="/images/logo/logo.png" 
                alt="Onlyinkani Logo" 
                width={200} 
                height={80}
                className="rounded-lg"
              />
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your ultimate destination for premium products and amazing shopping experiences. Quality products, great prices, delivered fast.
            </p>
            <div className="flex gap-3 pt-4">
              {[
                { icon: 'facebook', url: '#' },
                { icon: 'twitter', url: '#' },
                { icon: 'instagram', url: '#' },
                { icon: 'linkedin', url: '#' }
              ].map((social) => (
                <a
                  key={social.icon}
                  href={social.url}
                  className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 transition-all duration-300 hover:scale-110"
                  aria-label={social.icon}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12z" />
                  </svg>
                </a>
              ))}
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
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition font-medium">Contact Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition font-medium">FAQs</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition font-medium">Shipping Info</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition font-medium">Returns</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-gray-300 hover:text-blue-400 transition font-medium">About Us</Link></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition font-medium">Blog</a></li>
              <li><a href="#" className="text-gray-300 hover:text-blue-400 transition font-medium">Press</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div suppressHydrationWarning>
            <h3 className="font-bold text-lg mb-6 text-white">Subscribe</h3>
            <p className="text-gray-300 text-sm mb-4">Get exclusive deals and updates delivered to your inbox.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
              />
              <button className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105">
                →
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: '🚚', title: 'Free Shipping', desc: 'On orders over ₹500' },
              { icon: '🛡️', title: 'Secure Payment', desc: '100% encrypted' },
              { icon: '↩️', title: 'Easy Returns', desc: '30-day guarantee' }
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
              <a href="#" className="hover:text-blue-400 transition">Privacy Policy</a>
              <a href="#" className="hover:text-blue-400 transition">Terms of Service</a>
              <a href="#" className="hover:text-blue-400 transition">Cookie Settings</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
