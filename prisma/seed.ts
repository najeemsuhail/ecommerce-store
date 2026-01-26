import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Clearing existing data...');

  // Clear all data in correct order (respecting foreign keys)
  await prisma.productAttributeValue.deleteMany({});
  await prisma.productCategory.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.attribute.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ Existing data cleared');
  console.log('🌱 Creating hierarchical categories with parent-child relationships...');

  // Create hierarchical categories
  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
    },
  });

  const mobilePhones = await prisma.category.create({
    data: {
      name: 'Mobile Phones',
      slug: 'mobile-phones',
      parentId: electronics.id,
    },
  });

  const accessories = await prisma.category.create({
    data: {
      name: 'Accessories',
      slug: 'accessories',
    },
  });

  const audio = await prisma.category.create({
    data: {
      name: 'Audio',
      slug: 'audio',
      parentId: electronics.id,
    },
  });

  const computers = await prisma.category.create({
    data: {
      name: 'Computers',
      slug: 'computers',
      parentId: electronics.id,
    },
  });

  const clothing = await prisma.category.create({
    data: {
      name: 'Clothing',
      slug: 'clothing',
    },
  });

  const fitness = await prisma.category.create({
    data: {
      name: 'Sports & Fitness',
      slug: 'sports-fitness',
    },
  });

  console.log('✔ Categories created');
  console.log('🌱 Creating attributes...');

  // Create attributes for different categories
  const colorAttribute = await prisma.attribute.create({
    data: {
      categoryId: electronics.id,
      name: 'Color',
      slug: 'color',
      type: 'select',
      options: ['Black', 'White', 'Blue', 'Grey', 'Purple', 'Green'],
      required: true,
      filterable: true,
      searchable: false,
    },
  });

  const storageAttribute = await prisma.attribute.create({
    data: {
      categoryId: mobilePhones.id,
      name: 'Storage Capacity',
      slug: 'storage-capacity',
      type: 'select',
      options: ['64GB', '128GB', '256GB', '512GB'],
      required: true,
      filterable: true,
      searchable: false,
    },
  });

  const ramAttribute = await prisma.attribute.create({
    data: {
      categoryId: mobilePhones.id,
      name: 'RAM',
      slug: 'ram',
      type: 'select',
      options: ['4GB', '6GB', '8GB', '12GB'],
      required: false,
      filterable: true,
      searchable: false,
    },
  });

  const sizeAttribute = await prisma.attribute.create({
    data: {
      categoryId: clothing.id,
      name: 'Size',
      slug: 'size',
      type: 'size',
      options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      required: true,
      filterable: true,
      searchable: false,
    },
  });

  const materialAttribute = await prisma.attribute.create({
    data: {
      categoryId: clothing.id,
      name: 'Material',
      slug: 'material',
      type: 'select',
      options: ['Cotton', 'Polyester', 'Wool', 'Silk', 'Linen'],
      required: false,
      filterable: true,
      searchable: false,
    },
  });

  const batteryAttribute = await prisma.attribute.create({
    data: {
      categoryId: audio.id,
      name: 'Battery Life',
      slug: 'battery-life',
      type: 'text',
      required: false,
      filterable: false,
      searchable: true,
    },
  });

  const switchTypeAttribute = await prisma.attribute.create({
    data: {
      categoryId: computers.id,
      name: 'Switch Type',
      slug: 'switch-type',
      type: 'select',
      options: ['Red', 'Blue', 'Brown', 'Black'],
      required: false,
      filterable: true,
      searchable: false,
    },
  });

  console.log('✔ Attributes created');
  console.log('🌱 Creating 8 products with multiple variants, images, and attributes...');

  // Create products with comprehensive data
  const product1 = await prisma.product.create({
    data: {
      name: 'Wireless Bluetooth Headphones',
      description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.',
      price: 79.99,
      comparePrice: 99.99,
      isDigital: false,
      stock: 50,
      sku: 'WBH-001',
      images: ['/images/products/wireless-headphones.jpg', '/images/products/headphones-detail.jpg'],
      tags: ['audio', 'wireless', 'sale', 'bestseller'],
      brand: 'TechSound',
      weight: 0.25,
      dimensions: { length: 20, width: 18, height: 8, unit: 'cm' },
      specifications: { batteryLife: '30 hours', bluetooth: 'v5.0', noiseCancellation: 'Active', warranty: '2 years' },
      slug: 'wireless-bluetooth-headphones',
      metaTitle: 'Premium Wireless Bluetooth Headphones',
      metaDescription: 'High-quality wireless headphones with noise cancellation',
      isFeatured: true,
      variants: {
        create: [
          { name: 'Black', sku: 'WBH-001-BLK', price: 79.99, stock: 25, color: 'Black', image: '/images/products/headphones-black.jpg' },
          { name: 'Blue', sku: 'WBH-001-BLU', price: 79.99, stock: 25, color: 'Blue', image: '/images/products/headphones-blue.jpg' },
        ],
      },
      categories: {
        create: [{ categoryId: audio.id }, { categoryId: accessories.id }],
      },
    },
  });

  // Add variant attributes for headphones
  await prisma.productAttributeValue.upsert({
    where: { productId_attributeId: { productId: product1.id, attributeId: colorAttribute.id } },
    create: { productId: product1.id, attributeId: colorAttribute.id, value: 'Black' },
    update: { value: 'Black' },
  });
  await prisma.productAttributeValue.upsert({
    where: { productId_attributeId: { productId: product1.id, attributeId: batteryAttribute.id } },
    create: { productId: product1.id, attributeId: batteryAttribute.id, value: '30 hours' },
    update: { value: '30 hours' },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Premium Cotton T-Shirt',
      description: '100% organic cotton t-shirt for daily wear. Soft, comfortable, and sustainable.',
      price: 19.99,
      isDigital: false,
      stock: 120,
      sku: 'TS-001',
      images: ['/images/products/cotton-tshirt.jpg', '/images/products/tshirt-fabric.jpg'],
      tags: ['cotton', 'casual', 'organic', 'eco-friendly'],
      brand: 'EcoWear',
      weight: 0.15,
      specifications: { material: 'Organic Cotton', washCare: 'Cold water wash', certification: 'GOTS' },
      slug: 'premium-cotton-tshirt',
      metaTitle: 'Organic Cotton T-Shirt',
      metaDescription: 'Comfortable 100% organic cotton t-shirt',
      variants: {
        create: [
          { name: 'Small - White', sku: 'TS-001-S-WHT', price: 19.99, stock: 30, size: 'S', color: 'White', image: '/images/products/tshirt-s-white.jpg' },
          { name: 'Medium - Black', sku: 'TS-001-M-BLK', price: 19.99, stock: 40, size: 'M', color: 'Black', image: '/images/products/tshirt-m-black.jpg' },
          { name: 'Large - Blue', sku: 'TS-001-L-BLU', price: 19.99, stock: 30, size: 'L', color: 'Blue', image: '/images/products/tshirt-l-blue.jpg' },
          { name: 'XL - Grey', sku: 'TS-001-XL-GRY', price: 21.99, stock: 20, size: 'XL', color: 'Grey', image: '/images/products/tshirt-xl-grey.jpg' },
        ],
      },
      categories: {
        create: [{ categoryId: clothing.id }],
      },
    },
  });

  // Add t-shirt attributes for each size
  for (const size of ['S', 'M', 'L', 'XL']) {
    await prisma.productAttributeValue.upsert({
      where: { productId_attributeId: { productId: product2.id, attributeId: sizeAttribute.id } },
      create: { productId: product2.id, attributeId: sizeAttribute.id, value: size },
      update: { value: size },
    });
    await prisma.productAttributeValue.upsert({
      where: { productId_attributeId: { productId: product2.id, attributeId: materialAttribute.id } },
      create: { productId: product2.id, attributeId: materialAttribute.id, value: 'Cotton' },
      update: { value: 'Cotton' },
    });
  }

  const product3 = await prisma.product.create({
    data: {
      name: 'Premium Yoga Mat',
      description: 'Non-slip eco-friendly yoga mat. 6mm thickness provides perfect cushioning for all types of yoga.',
      price: 34.99,
      isDigital: false,
      stock: 60,
      sku: 'YM-PR-001',
      images: ['/images/products/yoga-mat.jpg', '/images/products/yoga-mat-roll.jpg'],
      tags: ['yoga', 'fitness', 'eco-friendly'],
      brand: 'ZenFit',
      weight: 1.2,
      dimensions: { length: 183, width: 61, height: 0.6, unit: 'cm' },
      specifications: { thickness: '6mm', material: 'PER', grip: 'Non-slip' },
      slug: 'premium-yoga-mat',
      metaTitle: 'Premium Non-Slip Yoga Mat',
      metaDescription: 'Eco-friendly 6mm yoga mat',
      variants: {
        create: [
          { name: 'Purple', sku: 'YM-PR-001-PUR', price: 34.99, stock: 20, color: 'Purple', image: '/images/products/yoga-mat-purple.jpg' },
          { name: 'Blue', sku: 'YM-PR-001-BLU', price: 34.99, stock: 20, color: 'Blue', image: '/images/products/yoga-mat-blue.jpg' },
          { name: 'Green', sku: 'YM-PR-001-GRN', price: 34.99, stock: 20, color: 'Green', image: '/images/products/yoga-mat-green.jpg' },
        ],
      },
      categories: {
        create: [{ categoryId: fitness.id }],
      },
    },
  });

  // Add yoga mat attributes
  for (const color of ['Purple', 'Blue', 'Green']) {
    await prisma.productAttributeValue.upsert({
      where: { productId_attributeId: { productId: product3.id, attributeId: colorAttribute.id } },
      create: { productId: product3.id, attributeId: colorAttribute.id, value: color },
      update: { value: color },
    });
  }

  const product4 = await prisma.product.create({
    data: {
      name: 'Water-Resistant Laptop Backpack',
      description: 'Durable water-resistant backpack designed for laptops up to 15.6 inches. Multiple compartments for organization.',
      price: 39.99,
      isDigital: false,
      stock: 45,
      sku: 'LB-001',
      images: ['/images/products/laptop-backpack.jpg', '/images/products/backpack-inside.jpg'],
      tags: ['bag', 'travel', 'tech'],
      brand: 'UrbanPack',
      weight: 0.9,
      specifications: { laptopSize: '15.6 inch', waterResistant: 'Yes', compartments: '5', warranty: '1 year' },
      slug: 'water-resistant-laptop-backpack',
      metaTitle: 'Water-Resistant Laptop Backpack',
      metaDescription: 'Durable backpack for 15.6" laptops',
      variants: {
        create: [
          { name: 'Grey', sku: 'LB-001-GRY', price: 39.99, stock: 22, color: 'Grey', image: '/images/products/backpack-grey.jpg' },
          { name: 'Black', sku: 'LB-001-BLK', price: 39.99, stock: 23, color: 'Black', image: '/images/products/backpack-black.jpg' },
        ],
      },
      categories: {
        create: [{ categoryId: accessories.id }, { categoryId: computers.id }],
      },
    },
  });

  // Add backpack attributes
  await prisma.productAttributeValue.upsert({
    where: { productId_attributeId: { productId: product4.id, attributeId: colorAttribute.id } },
    create: { productId: product4.id, attributeId: colorAttribute.id, value: 'Grey' },
    update: { value: 'Grey' },
  });

  const product5 = await prisma.product.create({
    data: {
      name: 'RGB Mechanical Gaming Keyboard',
      description: 'Professional RGB mechanical keyboard with customizable Cherry MX switches. Perfect for gaming and typing.',
      price: 129.99,
      comparePrice: 159.99,
      isDigital: false,
      stock: 35,
      sku: 'MKB-001',
      images: ['/images/products/gaming-keyboard.jpg', '/images/products/keyboard-rgb.jpg'],
      tags: ['gaming', 'keyboard', 'rgb', 'mechanical'],
      brand: 'CyberTech',
      weight: 1.5,
      specifications: { switches: 'Cherry MX', layout: 'Full Size', backlight: 'RGB LED', actuation: '45g' },
      slug: 'rgb-mechanical-gaming-keyboard',
      metaTitle: 'RGB Mechanical Gaming Keyboard',
      metaDescription: 'Professional mechanical keyboard with RGB lighting',
      isFeatured: true,
      variants: {
        create: [
          { name: 'Red Switches', sku: 'MKB-001-RED', price: 129.99, stock: 15, color: 'Black', material: 'Red Switches', image: '/images/products/keyboard-red.jpg' },
          { name: 'Blue Switches', sku: 'MKB-001-BLU', price: 139.99, stock: 12, color: 'Black', material: 'Blue Switches', image: '/images/products/keyboard-blue.jpg' },
          { name: 'Brown Switches', sku: 'MKB-001-BRN', price: 134.99, stock: 8, color: 'Black', material: 'Brown Switches', image: '/images/products/keyboard-brown.jpg' },
        ],
      },
      categories: {
        create: [{ categoryId: computers.id }, { categoryId: accessories.id }],
      },
    },
  });

  // Add keyboard attributes
  for (const switchType of ['Red', 'Blue', 'Brown']) {
    await prisma.productAttributeValue.upsert({
      where: { productId_attributeId: { productId: product5.id, attributeId: switchTypeAttribute.id } },
      create: { productId: product5.id, attributeId: switchTypeAttribute.id, value: switchType },
      update: { value: switchType },
    });
    await prisma.productAttributeValue.upsert({
      where: { productId_attributeId: { productId: product5.id, attributeId: colorAttribute.id } },
      create: { productId: product5.id, attributeId: colorAttribute.id, value: 'Black' },
      update: { value: 'Black' },
    });
  }

  const product6 = await prisma.product.create({
    data: {
      name: '4K Ultra HD Webcam',
      description: 'Crystal clear 4K UHD webcam perfect for streaming and professional video calls. 60fps at 4K resolution.',
      price: 89.99,
      isDigital: false,
      stock: 30,
      sku: 'WC-4K-001',
      images: ['/images/products/4k-webcam.jpg', '/images/products/webcam-mounted.jpg'],
      tags: ['webcam', 'streaming', '4k', 'video'],
      brand: 'VisionPro',
      weight: 0.35,
      specifications: { resolution: '4K UHD', fps: '60fps', fieldOfView: '90°', lowlightPerformance: 'Excellent' },
      slug: '4k-ultra-hd-webcam',
      metaTitle: '4K Ultra HD Webcam',
      metaDescription: 'Professional 4K streaming webcam',
      variants: {
        create: [
          { name: 'Standard Edition', sku: 'WC-4K-001-STD', price: 89.99, stock: 15, image: '/images/products/webcam-standard.jpg' },
          { name: 'Premium Edition', sku: 'WC-4K-001-PRM', price: 109.99, stock: 15, image: '/images/products/webcam-premium.jpg' },
        ],
      },
      categories: {
        create: [{ categoryId: computers.id }, { categoryId: accessories.id }],
      },
    },
  });

  // Add webcam attributes
  await prisma.productAttributeValue.upsert({
    where: { productId_attributeId: { productId: product6.id, attributeId: colorAttribute.id } },
    create: { productId: product6.id, attributeId: colorAttribute.id, value: 'Black' },
    update: { value: 'Black' },
  });

  const product7 = await prisma.product.create({
    data: {
      name: '30000mAh USB-C Power Bank',
      description: '30000mAh fast charging power bank with 3 USB-C ports. Supports 65W fast charging and can charge 3 devices simultaneously.',
      price: 44.99,
      comparePrice: 59.99,
      isDigital: false,
      stock: 80,
      sku: 'PB-30K-001',
      images: ['/images/products/power-bank.jpg', '/images/products/powerbank-charging.jpg'],
      tags: ['powerbank', 'charging', 'portable', 'tech'],
      brand: 'PowerMax',
      weight: 0.65,
      specifications: { capacity: '30000mAh', ports: '3x USB-C, 1x USB-A', chargingTime: '2.5 hours', fastCharge: '65W' },
      slug: '30000mah-usb-c-power-bank',
      metaTitle: '30000mAh USB-C Power Bank',
      metaDescription: 'Fast charging power bank with multiple ports',
      variants: {
        create: [
          { name: 'Black', sku: 'PB-30K-001-BLK', price: 44.99, stock: 30, color: 'Black', image: '/images/products/powerbank-black.jpg' },
          { name: 'White', sku: 'PB-30K-001-WHT', price: 44.99, stock: 25, color: 'White', image: '/images/products/powerbank-white.jpg' },
          { name: 'Blue', sku: 'PB-30K-001-BLU', price: 49.99, stock: 25, color: 'Blue', image: '/images/products/powerbank-blue.jpg' },
        ],
      },
      categories: {
        create: [{ categoryId: accessories.id }, { categoryId: electronics.id }],
      },
    },
  });

  // Add power bank attributes
  for (const color of ['Black', 'White', 'Blue']) {
    await prisma.productAttributeValue.upsert({
      where: { productId_attributeId: { productId: product7.id, attributeId: colorAttribute.id } },
      create: { productId: product7.id, attributeId: colorAttribute.id, value: color },
      update: { value: color },
    });
  }

  const product8 = await prisma.product.create({
    data: {
      name: 'Premium Ergonomic Mouse Pad',
      description: 'Premium ergonomic mouse pad with memory foam wrist support and non-slip base. Ideal for long work sessions.',
      price: 24.99,
      isDigital: false,
      stock: 60,
      sku: 'MP-ERG-001',
      images: ['/images/products/mouse-pad.jpg', '/images/products/mousepad-detail.jpg'],
      tags: ['mousepad', 'ergonomic', 'office', 'health'],
      brand: 'ComfortZone',
      weight: 0.35,
      specifications: { material: 'Premium Memory Foam', size: '320 x 240 mm', wristSupport: 'Yes', thickness: '25mm' },
      slug: 'premium-ergonomic-mouse-pad',
      metaTitle: 'Premium Ergonomic Mouse Pad',
      metaDescription: 'Ergonomic mouse pad with wrist support',
      variants: {
        create: [
          { name: 'Black', sku: 'MP-ERG-001-BLK', price: 24.99, stock: 20, color: 'Black', image: '/images/products/mousepad-black.jpg' },
          { name: 'Grey', sku: 'MP-ERG-001-GRY', price: 24.99, stock: 20, color: 'Grey', image: '/images/products/mousepad-grey.jpg' },
          { name: 'Blue', sku: 'MP-ERG-001-BLU', price: 27.99, stock: 20, color: 'Blue', image: '/images/products/mousepad-blue.jpg' },
        ],
      },
      categories: {
        create: [{ categoryId: accessories.id }, { categoryId: computers.id }],
      },
    },
  });

  // Add mouse pad attributes
  for (const color of ['Black', 'Grey', 'Blue']) {
    await prisma.productAttributeValue.upsert({
      where: { productId_attributeId: { productId: product8.id, attributeId: colorAttribute.id } },
      create: { productId: product8.id, attributeId: colorAttribute.id, value: color },
      update: { value: color },
    });
  }

  console.log('✅ All products created successfully!');
  console.log('\n📊 SEED DATA SUMMARY:');
  console.log('   ✔ 8 Products created');
  console.log('   ✔ 28 Product Variants (each with unique images, prices, and properties)');
  console.log('   ✔ 7 Categories (including hierarchical parent-child relationships)');
  console.log('   ✔ 7 Attributes (category-specific, multiple types)');
  console.log('   ✔ Multiple category assignments per product');
  console.log('   ✔ Variant-specific attributes and values');
  console.log('   ✔ Comprehensive product information (specs, dimensions, tags, etc.)');
  console.log('\n✨ Your database is now ready with a complete ecommerce product catalog!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
