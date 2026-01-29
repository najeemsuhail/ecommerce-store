'use client';

import Link from 'next/link';
import Layout from '@/components/Layout';

export default function TermsOfService() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="gradient-primary-accent text-white-theme py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4 text-white">Terms of Service</h1>
            <p className="text-xl text-white-theme">
              Please read these terms carefully before using our platform.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Last Updated */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600">
              <strong>Last Updated:</strong> January 29, 2026
            </p>
          </div>

          {/* Acceptance of Terms */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">1. Acceptance of Terms</h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              By accessing and using this website and making purchases from our e-commerce store, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          {/* Use License */}
          <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">2. Use License</h2>
            <p className="text-slate-700 mb-4 text-lg leading-relaxed">
              Permission is granted to temporarily download one copy of the materials (information or software) on our website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 text-lg">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              <li>Use the website for any unlawful purpose or to solicit others for unlawful purposes</li>
            </ul>
          </section>

          {/* Product Information */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">3. Product Information and Availability</h2>
            <p className="text-slate-700 mb-4 text-lg leading-relaxed">
              We strive to provide accurate descriptions and pricing for all products on our website. However, we do not warrant that product descriptions, prices, or other content of any materials on our website are accurate, complete, reliable, current, or error-free. If a product offered by us is not as described, your sole remedy is to return it in unused condition.
            </p>
            <p className="text-slate-700 text-lg leading-relaxed">
              All products are subject to availability. We reserve the right to limit quantities and to discontinue any products at any time. Prices are subject to change without notice.
            </p>
          </section>

          {/* Ordering and Payment */}
          <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">4. Ordering and Payment</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Order Acceptance</h3>
                <p className="text-slate-700 text-lg leading-relaxed">
                  We reserve the right to refuse or cancel any order. An order confirmation email does not constitute acceptance of an order. We will confirm acceptance of your order by sending you an order confirmation with tracking information.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Payment Methods</h3>
                <p className="text-slate-700 text-lg leading-relaxed">
                  We accept various payment methods including credit cards, debit cards, digital wallets, and other methods as displayed on our website. All payments are processed securely through authorized payment gateways.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Billing Information</h3>
                <p className="text-slate-700 text-lg leading-relaxed">
                  You agree to provide accurate and complete billing information. You are responsible for all charges incurred under your account, including any unauthorized use of your payment methods.
                </p>
              </div>
            </div>
          </section>

          {/* Shipping and Delivery */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">5. Shipping and Delivery</h2>
            <p className="text-slate-700 mb-4 text-lg leading-relaxed">
              We will ship orders to the address provided at checkout. Estimated delivery times are provided as a courtesy and are not guaranteed. We are not responsible for delays caused by shipping carriers, customs, or other factors beyond our control.
            </p>
            <p className="text-slate-700 text-lg leading-relaxed">
              Risk of loss passes to you upon delivery to the carrier or upon your receipt of the goods, whichever is earlier.
            </p>
          </section>

          {/* Returns and Refunds */}
          <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">6. Returns and Refunds</h2>
            <p className="text-slate-700 mb-4 text-lg leading-relaxed">
              Our Return Policy is as follows:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 text-lg mb-4">
              <li>Products may be returned within 30 days of purchase in original, unused condition</li>
              <li>Items must be in original packaging with all tags and materials intact</li>
              <li>Refunds will be processed within 7-10 business days of receiving returned items</li>
              <li>Shipping costs for returns are the customer's responsibility unless the item is defective</li>
              <li>Digital products are non-returnable unless there is a defect</li>
            </ul>
            <p className="text-slate-700 text-lg leading-relaxed">
              To initiate a return, please contact our customer service team for a return authorization.
            </p>
          </section>

          {/* Warranties */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">7. Disclaimers and Warranties</h2>
            <p className="text-slate-700 mb-4 text-lg leading-relaxed">
              EXCEPT AS EXPRESSLY PROVIDED, ALL MATERIALS ON THIS WEBSITE ARE PROVIDED "AS IS" AND "AS AVAILABLE." WE MAKE NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="text-slate-700 text-lg leading-relaxed">
              We do not warrant that our website will be uninterrupted or error-free, that defects will be corrected, or that our site or the server that makes it available are free of viruses or other harmful components.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">8. Limitation of Liability</h2>
            <p className="text-slate-700 text-lg leading-relaxed">
              IN NO EVENT SHALL OUR COMPANY, ITS DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO YOUR USE OF THIS WEBSITE OR PRODUCTS PURCHASED THROUGH IT, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
          </section>

          {/* User Conduct */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">9. User Conduct</h2>
            <p className="text-slate-700 mb-4 text-lg leading-relaxed">
              You agree not to use this website:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 text-lg">
              <li>For any unlawful purpose or to solicit others to participate in unlawful conduct</li>
              <li>To violate any applicable laws or regulations</li>
              <li>To infringe on intellectual property rights of others</li>
              <li>To harass, abuse, or threaten other users</li>
              <li>To send spam or unsolicited communications</li>
              <li>To attempt to gain unauthorized access to our systems</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">10. Intellectual Property Rights</h2>
            <p className="text-slate-700 text-lg leading-relaxed">
              All content on this website, including text, graphics, logos, images, and software, is the property of our Company or its content suppliers and is protected by international copyright laws. You may not reproduce, distribute, or transmit this content without our prior written permission.
            </p>
          </section>

          {/* Third Party Links */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">11. Third Party Links</h2>
            <p className="text-slate-700 text-lg leading-relaxed">
              Our website may contain links to third-party websites. We are not responsible for the content, accuracy, or practices of these external sites. Your use of third-party websites is at your own risk and subject to their terms and conditions.
            </p>
          </section>

          {/* Indemnification */}
          <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">12. Indemnification</h2>
            <p className="text-slate-700 text-lg leading-relaxed">
              You agree to indemnify and hold harmless our Company, its owners, employees, and agents from any claims, damages, losses, or expenses arising from your use of this website or violation of these Terms of Service.
            </p>
          </section>

          {/* Modifications */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">13. Modifications to Terms</h2>
            <p className="text-slate-700 text-lg leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to the website. Your continued use of this website following the posting of revised terms means you accept and agree to the changes.
            </p>
          </section>

          {/* Severability */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">14. Severability</h2>
            <p className="text-slate-700 text-lg leading-relaxed">
              If any provision of these Terms of Service is found to be invalid or unenforceable, that provision shall be severed, and the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">15. Governing Law</h2>
            <p className="text-slate-700 text-lg leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Any legal action or proceeding shall be brought exclusively in the courts located in [Your Jurisdiction].
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12 gradient-primary-accent rounded-lg text-white-theme p-8">
            <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
            <p className="text-lg text-white-theme leading-relaxed mb-4">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2 text-white-theme">
              <p><strong>Email:</strong> support@example.com</p>
              <p><strong>Address:</strong> 123 Business Street, City, State 12345</p>
              <p><strong>Phone:</strong> (555) 123-4567</p>
            </div>
          </section>

          {/* Footer Links */}
          <div className="flex gap-4 justify-center mt-12">
            <Link href="/" className="text-primary-theme hover:underline font-semibold">
              Back to Home
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/privacy-policy" className="text-primary-theme hover:underline font-semibold">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
