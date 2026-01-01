import { PrismaClient } from '@prisma/client';
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample products
  const products = [
    {
      name: 'Wireless Bluetooth Headphones',
      description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.',
      price: 79.99,
      comparePrice: 99.99,
      isDigital: false,
      stock: 50,
      sku: 'WBH-001',
      images: ['https://via.placeholder.com/400x400?text=Headphones'],
      category: 'Electronics',
      tags: ['audio', 'wireless', 'sale'],
      brand: 'TechSound',
      weight: 0.25,
      dimensions: { length: 20, width: 18, height: 8, unit: 'cm' },
      specifications: {
        'Battery Life': '30 hours',
        'Bluetooth': 'v5.0',
        'Noise Cancellation': 'Active',
        'Color': 'Black',
      },
      slug: 'wireless-bluetooth-headphones',
      metaTitle: 'Wireless Bluetooth Headphones - Premium Sound',
      metaDescription: 'Shop premium wireless headphones with noise cancellation',
      isFeatured: true,
    },
    {
      name: 'Cotton T-Shirt',
      description: '100% organic cotton t-shirt. Soft, breathable, and comfortable for everyday wear.',
      price: 19.99,
      isDigital: false,
      stock: 100,
      sku: 'TS-001',
      images: ['https://via.placeholder.com/400x400?text=T-Shirt'],
      category: 'Clothing',
      tags: ['cotton', 'casual', 'eco-friendly'],
      brand: 'EcoWear',
      weight: 0.15,
      specifications: {
        'Material': '100% Organic Cotton',
        'Fit': 'Regular',
        'Care': 'Machine wash cold',
        'Sizes': 'S, M, L, XL',
      },
      slug: 'cotton-tshirt',
      metaTitle: 'Organic Cotton T-Shirt',
      metaDescription: 'Comfortable organic cotton t-shirt for everyday wear',
      isFeatured: false,
    },
    {
      name: 'E-Book: Web Development Masterclass',
      description: 'Complete guide to modern web development. Learn HTML, CSS, JavaScript, React, and Node.js. Includes 50+ projects and exercises.',
      price: 29.99,
      comparePrice: 49.99,
      isDigital: true,
      sku: 'EB-WDM-001',
      images: ['https://via.placeholder.com/400x400?text=E-Book'],
      category: 'Digital Products',
      tags: ['ebook', 'programming', 'education', 'sale'],
      brand: 'LearnCode',
      specifications: {
        'Format': 'PDF',
        'Pages': '450',
        'Language': 'English',
        'Level': 'Beginner to Advanced',
      },
      slug: 'ebook-web-development-masterclass',
      metaTitle: 'Web Development E-Book - Complete Guide',
      metaDescription: 'Master web development with this comprehensive e-book',
      isFeatured: true,
    },
    {
      name: 'Stainless Steel Water Bottle',
      description: 'Insulated stainless steel water bottle keeps drinks cold for 24 hours or hot for 12 hours. BPA-free and leak-proof.',
      price: 24.99,
      isDigital: false,
      stock: 75,
      sku: 'WB-SS-001',
      images: ['https://via.placeholder.com/400x400?text=Water+Bottle'],
      category: 'Home & Kitchen',
      tags: ['bottle', 'insulated', 'eco-friendly'],
      brand: 'HydroLife',
      weight: 0.35,
      dimensions: { length: 26, width: 7, height: 7, unit: 'cm' },
      specifications: {
        'Capacity': '750ml',
        'Material': 'Stainless Steel',
        'Insulation': 'Double-wall vacuum',
        'Colors': 'Black, Blue, Silver',
      },
      slug: 'stainless-steel-water-bottle',
      metaTitle: 'Insulated Stainless Steel Water Bottle',
      metaDescription: 'Keep your drinks cold or hot with our premium water bottle',
      isFeatured: false,
    },
    {
      name: 'Yoga Mat Premium',
      description: 'Non-slip yoga mat with extra cushioning. Perfect for yoga, pilates, and fitness exercises. Eco-friendly material.',
      price: 34.99,
      isDigital: false,
      stock: 60,
      sku: 'YM-PR-001',
      images: ['https://via.placeholder.com/400x400?text=Yoga+Mat'],
      category: 'Sports & Fitness',
      tags: ['yoga', 'fitness', 'eco-friendly'],
      brand: 'ZenFit',
      weight: 1.2,
      dimensions: { length: 183, width: 61, height: 0.6, unit: 'cm' },
      specifications: {
        'Thickness': '6mm',
        'Material': 'TPE (Eco-friendly)',
        'Non-slip': 'Yes',
        'Colors': 'Purple, Blue, Green',
      },
      slug: 'yoga-mat-premium',
      metaTitle: 'Premium Yoga Mat - Non-Slip & Eco-Friendly',
      metaDescription: 'High-quality yoga mat for comfortable practice',
      isFeatured: true,
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`Created ${products.length} products`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });