import Link from 'next/link';
import Layout from '@/components/Layout';

export default function About() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="gradient-primary-accent text-white-theme py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">About Our Store</h1>
          <p className="text-xl text-indigo-100">
            Your trusted destination for quality products and exceptional customer service
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Our Story */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-slate-800 mb-6">Our Story</h2>
          <p className="text-lg text-slate-700 leading-relaxed mb-4">
            Founded in 2020, our e-commerce store has been dedicated to providing customers with high-quality products 
            at competitive prices. What started as a small online shop has grown into a thriving business serving thousands 
            of customers worldwide.
          </p>
          <p className="text-lg text-slate-700 leading-relaxed">
            We believe in building long-lasting relationships with our customers by offering exceptional products, 
            reliable service, and genuine support. Every product in our store is carefully selected to meet our 
            high standards of quality and value.
          </p>
        </section>

        {/* Our Mission */}
        <section className="mb-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Our Mission</h2>
          <p className="text-lg text-slate-700 leading-relaxed">
            To make quality shopping accessible to everyone by offering a curated selection of products, 
            fast shipping, and customer support that goes above and beyond expectations. We're committed to 
            sustainability, ethical sourcing, and continuous innovation in the e-commerce space.
          </p>
        </section>

        {/* Why Choose Us */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-800 mb-8">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-indigo-600 mb-3">Quality Products</h3>
              <p className="text-slate-600">
                Every item is carefully selected and tested to ensure it meets our strict quality standards.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-indigo-600 mb-3">Fast Shipping</h3>
              <p className="text-slate-600">
                We offer quick delivery options to get your orders to you as fast as possible.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-indigo-600 mb-3">24/7 Support</h3>
              <p className="text-slate-600">
                Our dedicated customer service team is always ready to help with any questions or concerns.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">Our Team</h2>
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            We're a passionate team of e-commerce professionals, designers, and developers working together 
            to create the best shopping experience possible. Our diverse backgrounds and expertise allow us to 
            understand and serve our customers better.
          </p>
          <p className="text-lg text-slate-700 leading-relaxed">
            From product curation to customer support, every team member is committed to excellence and 
            helping you find exactly what you're looking for.
          </p>
        </section>

        {/* CTA Section */}
        <section className="gradient-primary-accent rounded-lg text-white-theme p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Shop?</h2>
          <p className="text-lg text-indigo-100 mb-6">
            Explore our wide selection of quality products today.
          </p>
          <Link
            href="/products"
            className="inline-block bg-light-theme text-primary-theme px-8 py-3 rounded-lg font-bold hover:bg-light-gray-theme transition"
          >
            Browse Products
          </Link>
        </section>
      </div>
      </div>
    </Layout>
  );
}
