import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-dark-theme text-white-theme py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div>
            <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/images/logo.png"
                  alt="E-Store Logo"
                  width={200}
                  height={80}
                  className="rounded-lg"
                />
            </div>
            <p className="text-dark-theme">
              Your one-stop shop for amazing products at great prices.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-dark-theme">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-dark-theme hover:text-dark-theme transition font-medium">Products</Link></li>
              <li><Link href="/products?isFeatured=true" className="text-dark-theme hover:text-dark-theme transition font-medium">Featured</Link></li>
              <li><Link href="/auth" className="text-dark-theme hover:text-dark-theme transition font-medium">Account</Link></li>
              <li><Link href="/cart" className="text-dark-theme hover:text-dark-theme transition font-medium">Cart</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-dark-theme">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-dark-theme hover:text-dark-theme transition font-medium">Contact Us</a></li>
              <li><a href="#" className="text-dark-theme hover:text-dark-theme transition font-medium">FAQs</a></li>
              <li><a href="#" className="text-dark-theme hover:text-dark-theme transition font-medium">Shipping</a></li>
              <li><a href="#" className="text-dark-theme hover:text-dark-theme transition font-medium">Returns</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-dark-theme">Follow Us</h3>
            <div className="flex gap-4">
              {['facebook', 'twitter', 'instagram'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-primary-theme transition-all duration-300 hover:scale-110"
                >
                  <span className="sr-only">{social}</span>
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12z" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-dark-theme">
          <p>&copy; 2025 E-Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
