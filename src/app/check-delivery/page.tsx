import { Metadata } from 'next';
import DeliveryPinChecker from '@/components/DeliveryPinChecker';

export const metadata: Metadata = {
  title: 'Check Delivery Availability | eCommerce Store',
  description: 'Check if we deliver to your area using your PIN code. Get delivery timelines and available payment methods.',
};

export default function CheckDeliveryPage() {
  return (
    <main className="min-h-screen bg-slate-900">
      {/* Header Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-700">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Check Delivery Availability
          </h1>
          <p className="text-lg text-gray-300">
            Find out if we deliver to your location and explore available payment options.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Delivery Checker Component */}
          <DeliveryPinChecker />

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: About PIN Codes */}
            <div className="p-6 bg-slate-800 border border-slate-700 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">📍 What is a PIN Code?</h3>
              <p className="text-gray-300 text-sm">
                A PIN code (Postal Index Number) is a 6-digit code used by postal services to identify delivery areas in India. You can find your PIN code on your address or by searching online with your locality name.
              </p>
            </div>

            {/* Card 2: Delivery Methods */}
            <div className="p-6 bg-slate-800 border border-slate-700 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">🚚 Delivery Methods</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>✓ <strong>Standard Delivery:</strong> 2-5 business days</li>
                <li>✓ <strong>Express Delivery:</strong> 1-2 business days (selected areas)</li>
              </ul>
            </div>

            {/* Card 3: Payment Methods */}
            <div className="p-6 bg-slate-800 border border-slate-700 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">💳 Payment Options</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>💳 <strong>Prepaid:</strong> Credit/Debit Card, UPI, Net Banking</li>
                <li>📦 <strong>COD:</strong> Cash on Delivery (where available)</li>
              </ul>
            </div>

            {/* Card 4: Support */}
            <div className="p-6 bg-slate-800 border border-slate-700 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">📞 Need Help?</h3>
              <p className="text-gray-300 text-sm mb-3">
                Can't find your PIN code or have delivery questions?
              </p>
              <a
                href="/contact"
                className="inline-block text-blue-400 hover:text-blue-300 underline text-sm font-semibold"
              >
                Contact our support team →
              </a>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg space-y-4">
            <h3 className="text-xl font-semibold text-white">❓ Frequently Asked Questions</h3>
            
            <div>
              <h4 className="font-semibold text-gray-200 mb-2">How long does delivery take?</h4>
              <p className="text-gray-300 text-sm">
                Delivery time depends on your location. Check your PIN code to see the estimated delivery time for your area. Most orders are delivered within 2-5 business days.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-200 mb-2">Why isn't my PIN code showing delivery availability?</h4>
              <p className="text-gray-300 text-sm">
                We're constantly expanding our delivery network. If your area isn't available yet, please contact our support team. You can still place an order, and we'll update you on delivery feasibility.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-200 mb-2">Can I use Cash on Delivery everywhere?</h4>
              <p className="text-gray-300 text-sm">
                COD is available in most areas, but some locations may only offer prepaid options. Check your PIN code to see which payment methods are available in your area.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-200 mb-2">What if my PIN code is not in the system?</h4>
              <p className="text-gray-300 text-sm">
                If your PIN code doesn't appear in our system, please reach out to our customer support team. We can check if delivery is possible to your area on a case-by-case basis.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg text-center">
            <h3 className="text-xl font-semibold text-white mb-3">Ready to Shop?</h3>
            <p className="text-gray-300 mb-4">
              Once you've confirmed delivery to your area, explore our amazing products
            </p>
            <a
              href="/products"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Browse Products →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
