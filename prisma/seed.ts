import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding products with variants...');

  const products = [
    {
      name: 'Wireless Bluetooth Headphones',
      description:
        'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
      price: 79.99,
      comparePrice: 99.99,
      isDigital: false,
      stock: 50,
      sku: 'WBH-001',
      images: ['/images/products/wireless-headphones.jpg'],
      category: 'Electronics',
      tags: ['audio', 'wireless', 'sale'],
      brand: 'TechSound',
      weight: 0.25,
      dimensions: { length: 20, width: 18, height: 8, unit: 'cm' },
      specifications: {
        batteryLife: '30 hours',
        bluetooth: 'v5.0',
        noiseCancellation: 'Active',
      },
      slug: 'wireless-bluetooth-headphones',
      metaTitle: 'Wireless Bluetooth Headphones',
      metaDescription: 'Premium wireless headphones',
      isFeatured: true,
      variants: [
        {
          name: 'Black',
          sku: 'WBH-001-BLK',
          price: 79.99,
          stock: 25,
          color: 'Black',
        },
        {
          name: 'Blue',
          sku: 'WBH-001-BLU',
          price: 79.99,
          stock: 25,
          color: 'Blue',
        },
      ],
    },

    {
      name: 'Cotton T-Shirt',
      description: '100% organic cotton t-shirt for daily wear.',
      price: 19.99,
      isDigital: false,
      stock: 100,
      sku: 'TS-001',
      images: ['/images/products/cotton-tshirt.jpg'],
      category: 'Clothing',
      tags: ['cotton', 'casual'],
      brand: 'EcoWear',
      weight: 0.15,
      specifications: {
        material: 'Organic Cotton',
      },
      slug: 'cotton-tshirt',
      metaTitle: 'Organic Cotton T-Shirt',
      metaDescription: 'Comfortable organic cotton t-shirt',
      variants: [
        {
          name: 'Small - White',
          sku: 'TS-001-S-WHT',
          price: 19.99,
          stock: 30,
          size: 'S',
          color: 'White',
        },
        {
          name: 'Medium - Black',
          sku: 'TS-001-M-BLK',
          price: 19.99,
          stock: 40,
          size: 'M',
          color: 'Black',
        },
        {
          name: 'Large - Blue',
          sku: 'TS-001-L-BLU',
          price: 19.99,
          stock: 30,
          size: 'L',
          color: 'Blue',
        },
      ],
    },

    {
      name: 'Yoga Mat Premium',
      description: 'Non-slip eco-friendly yoga mat.',
      price: 34.99,
      isDigital: false,
      stock: 60,
      sku: 'YM-PR-001',
      images: ['/images/products/yoga-mat.jpg'],
      category: 'Sports & Fitness',
      tags: ['yoga', 'fitness'],
      brand: 'ZenFit',
      weight: 1.2,
      dimensions: { length: 183, width: 61, height: 0.6, unit: 'cm' },
      specifications: {
        thickness: '6mm',
      },
      slug: 'yoga-mat-premium',
      metaTitle: 'Premium Yoga Mat',
      metaDescription: 'Non-slip yoga mat',
      variants: [
        {
          name: 'Purple',
          sku: 'YM-PR-001-PUR',
          price: 34.99,
          stock: 20,
          color: 'Purple',
        },
        {
          name: 'Blue',
          sku: 'YM-PR-001-BLU',
          price: 34.99,
          stock: 20,
          color: 'Blue',
        },
        {
          name: 'Green',
          sku: 'YM-PR-001-GRN',
          price: 34.99,
          stock: 20,
          color: 'Green',
        },
      ],
    },

    {
      name: 'Laptop Backpack',
      description: 'Water-resistant backpack for laptops up to 15.6".',
      price: 39.99,
      isDigital: false,
      stock: 40,
      sku: 'LB-001',
      images: ['/images/products/laptop-backpack.jpg'],
      category: 'Accessories',
      tags: ['bag', 'travel'],
      brand: 'UrbanPack',
      weight: 0.9,
      specifications: {
        laptopSize: '15.6 inch',
      },
      slug: 'laptop-backpack',
      metaTitle: 'Laptop Backpack',
      metaDescription: 'Durable laptop backpack',
      variants: [
        {
          name: 'Grey',
          sku: 'LB-001-GRY',
          price: 39.99,
          stock: 20,
          color: 'Grey',
        },
        {
          name: 'Black',
          sku: 'LB-001-BLK',
          price: 39.99,
          stock: 20,
          color: 'Black',
        },
      ],
    },

    {
      name: 'Mechanical Gaming Keyboard',
      description: 'RGB mechanical keyboard with customizable switches for gaming.',
      price: 129.99,
      comparePrice: 159.99,
      isDigital: false,
      stock: 35,
      sku: 'MKB-001',
      images: ['/images/products/gaming-keyboard.jpg'],
      category: 'Electronics',
      tags: ['gaming', 'keyboard', 'rgb'],
      brand: 'CyberTech',
      weight: 1.5,
      specifications: {
        switches: 'Cherry MX',
        layout: 'Full Size',
        backlight: 'RGB LED',
      },
      slug: 'mechanical-gaming-keyboard',
      metaTitle: 'Mechanical Gaming Keyboard',
      metaDescription: 'Professional mechanical gaming keyboard',
      isFeatured: true,
      variants: [
        {
          name: 'Red Switches',
          sku: 'MKB-001-RED',
          price: 129.99,
          stock: 15,
          color: 'Black',
          material: 'Red Switches',
        },
        {
          name: 'Blue Switches',
          sku: 'MKB-001-BLU',
          price: 139.99,
          stock: 12,
          color: 'Black',
          material: 'Blue Switches',
        },
        {
          name: 'Brown Switches',
          sku: 'MKB-001-BRN',
          price: 134.99,
          stock: 8,
          color: 'Black',
          material: 'Brown Switches',
        },
      ],
    },

    {
      name: '4K Webcam HD',
      description: 'Crystal clear 4K webcam perfect for streaming and video calls.',
      price: 89.99,
      isDigital: false,
      stock: 28,
      sku: 'WC-4K-001',
      images: ['/images/products/4k-webcam.jpg'],
      category: 'Electronics',
      tags: ['webcam', 'streaming', '4k'],
      brand: 'VisionPro',
      weight: 0.35,
      specifications: {
        resolution: '4K UHD',
        fps: '60fps',
        fieldOfView: '90°',
      },
      slug: '4k-webcam-hd',
      metaTitle: '4K Webcam HD',
      metaDescription: 'Professional 4K streaming webcam',
      variants: [
        {
          name: 'Standard Edition',
          sku: 'WC-4K-001-STD',
          price: 89.99,
          stock: 15,
        },
        {
          name: 'Premium Edition',
          sku: 'WC-4K-001-PRM',
          price: 109.99,
          stock: 13,
        },
      ],
    },

    {
      name: 'Portable USB-C Power Bank',
      description: '30000mAh fast charging power bank with multiple ports.',
      price: 44.99,
      comparePrice: 59.99,
      isDigital: false,
      stock: 75,
      sku: 'PB-30K-001',
      images: ['/images/products/power-bank.jpg'],
      category: 'Electronics',
      tags: ['powerbank', 'charging', 'portable'],
      brand: 'PowerMax',
      weight: 0.65,
      specifications: {
        capacity: '30000mAh',
        ports: '3x USB-C, 1x USB-A',
        chargingTime: '2.5 hours',
      },
      slug: 'portable-usb-c-power-bank',
      metaTitle: 'Portable USB-C Power Bank',
      metaDescription: 'Fast charging portable power bank',
      variants: [
        {
          name: 'Black',
          sku: 'PB-30K-001-BLK',
          price: 44.99,
          stock: 30,
          color: 'Black',
        },
        {
          name: 'White',
          sku: 'PB-30K-001-WHT',
          price: 44.99,
          stock: 25,
          color: 'White',
        },
        {
          name: 'Blue',
          sku: 'PB-30K-001-BLU',
          price: 49.99,
          stock: 20,
          color: 'Blue',
        },
      ],
    },

    {
      name: 'Ergonomic Mouse Pad',
      description: 'Premium ergonomic mouse pad with wrist support and non-slip base.',
      price: 24.99,
      isDigital: false,
      stock: 55,
      sku: 'MP-ERG-001',
      images: ['/images/products/mouse-pad.jpg'],
      category: 'Accessories',
      tags: ['mousepad', 'ergonomic', 'office'],
      brand: 'ComfortZone',
      weight: 0.35,
      specifications: {
        material: 'Premium Memory Foam',
        size: '320 x 240 mm',
        wristSupport: 'Yes',
      },
      slug: 'ergonomic-mouse-pad',
      metaTitle: 'Ergonomic Mouse Pad',
      metaDescription: 'Comfortable ergonomic mouse pad with wrist support',
      variants: [
        {
          name: 'Black',
          sku: 'MP-ERG-001-BLK',
          price: 24.99,
          stock: 20,
          color: 'Black',
        },
        {
          name: 'Grey',
          sku: 'MP-ERG-001-GRY',
          price: 24.99,
          stock: 18,
          color: 'Grey',
        },
        {
          name: 'Blue',
          sku: 'MP-ERG-001-BLU',
          price: 27.99,
          stock: 17,
          color: 'Blue',
        },
      ],
    },
  ];

  for (const product of products) {
    const createdProduct = await prisma.product.create({
      data: {
        ...product,
        variants: {
          create: product.variants,
        },
      },
    });

    console.log(`✔ Created ${createdProduct.name}`);
  }

  console.log('✅ Products & variants seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
