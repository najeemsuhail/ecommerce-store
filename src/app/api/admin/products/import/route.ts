import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAdmin } from '@/lib/adminAuth';

interface ImportVariant {
  externalId?: string | number;
  name: string;
  sku: string;
  price: number;
  comparePrice?: number;
  available?: boolean;
  stock?: number | null;
  size?: string;
  color?: string;
  material?: string;
  image?: string;
}

interface ImportProduct {
  externalId?: string | number;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku?: string;
  stock?: number | null;
  brand?: string;
  slug?: string;
  tags?: string[];
  category?: string | string[];
  images?: string[];
  videoUrl?: string;
  weight?: number;
  dimensions?: any;
  specifications?: any;
  metaTitle?: string;
  metaDescription?: string;
  isDigital?: boolean;
  trackInventory?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  source?: string;
  variants?: ImportVariant[];
  attributes?: Record<string, string[]>;
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const admin = await isAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid format. Expected array of products.' },
        { status: 400 }
      );
    }

    const results = {
      imported: 0,
      updated: 0,
      failed: 0,
      errors: [] as Array<{ index: number; name: string; error: string }>,
    };

    // Process products in batches of 50 for better performance
    const BATCH_SIZE = 50;
    const totalBatches = Math.ceil(products.length / BATCH_SIZE);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIdx = batchIndex * BATCH_SIZE;
      const endIdx = Math.min(startIdx + BATCH_SIZE, products.length);
      const batch = products.slice(startIdx, endIdx);

      console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (${batch.length} products)`);

      // Process all products in batch in parallel
      await Promise.all(
        batch.map(async (product, batchItemIndex) => {
          const globalIndex = startIdx + batchItemIndex;
          try {
            await importProduct(product as ImportProduct, globalIndex, results);
          } catch (error) {
            results.failed++;
            results.errors.push({
              index: globalIndex + 1,
              name: product?.name || `Product ${globalIndex + 1}`,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        })
      );
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Import completed: ${results.imported} imported, ${results.updated} updated, ${results.failed} failed`,
    });
  } catch (error) {
    console.error('Error importing products:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to import products',
      },
      { status: 500 }
    );
  }
}

// Helper function to import a single product
async function importProduct(
  product: ImportProduct,
  index: number,
  results: any
): Promise<void> {
  // Validation
  if (!product.name || !product.description || product.price === undefined) {
    throw new Error('Missing required fields: name, description, price');
  }

  if (product.price < 0) {
    throw new Error('Price cannot be negative');
  }

  // Generate slug from name if not provided
  const baseSlug = (product.slug || product.name || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, '');

  // Check if product already exists - priority: SKU > externalId > slug
  let existingProduct = null;

  // 1. Check by SKU first (most reliable unique identifier)
  if (product.sku) {
    existingProduct = await prisma.product.findUnique({
      where: { sku: product.sku },
    });
  }

  // 2. If not found by SKU, check by externalId
  if (!existingProduct && product.externalId) {
    existingProduct = await prisma.product.findUnique({
      where: { externalId: String(product.externalId) },
    });
  }

  // 3. If still not found, search by slug
  if (!existingProduct) {
    existingProduct = await prisma.product.findUnique({
      where: { slug: baseSlug },
    });
  }

  let finalProduct;

  if (existingProduct) {
    // Update existing product
    finalProduct = await prisma.product.update({
      where: { id: existingProduct.id },
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        comparePrice: product.comparePrice,
        sku: product.sku || existingProduct.sku,
        stock: product.stock ?? existingProduct.stock,
        brand: product.brand || existingProduct.brand,
        externalId: String(product.externalId) || existingProduct.externalId,
        source: product.source || existingProduct.source,
        tags: product.tags || existingProduct.tags,
        images: product.images || existingProduct.images,
        videoUrl: product.videoUrl || existingProduct.videoUrl,
        weight: product.weight || existingProduct.weight,
        dimensions: product.dimensions || existingProduct.dimensions,
        specifications: product.specifications || existingProduct.specifications,
        metaTitle: product.metaTitle || existingProduct.metaTitle,
        metaDescription: product.metaDescription || existingProduct.metaDescription,
        isDigital: product.isDigital ?? existingProduct.isDigital,
        trackInventory: product.trackInventory ?? existingProduct.trackInventory,
        isFeatured: product.isFeatured ?? existingProduct.isFeatured,
        isActive: product.isActive ?? existingProduct.isActive,
      },
    });
    results.updated++;
  } else {
    // Check for unique slug if creating new product
    let finalSlug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await prisma.product.findUnique({
        where: { slug: finalSlug },
      });
      if (!existing) break;
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create new product
    finalProduct = await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        comparePrice: product.comparePrice,
        sku: product.sku,
        stock: product.stock ?? 0,
        brand: product.brand,
        externalId: product.externalId ? String(product.externalId) : null,
        source: product.source || 'deodap',
        tags: product.tags || [],
        images: product.images || [],
        videoUrl: product.videoUrl,
        weight: product.weight,
        dimensions: product.dimensions,
        specifications: product.specifications,
        slug: finalSlug,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
        isDigital: product.isDigital ?? false,
        trackInventory: product.trackInventory ?? true,
        isFeatured: product.isFeatured ?? false,
        isActive: product.isActive ?? true,
      },
    });
    results.imported++;
  }

  // Handle categories in parallel
  const categories = Array.isArray(product.category)
    ? product.category
    : product.category
      ? [product.category]
      : [];

  if (categories.length > 0) {
    await prisma.productCategory.deleteMany({
      where: { productId: finalProduct.id },
    });

    // Process all categories in parallel
    await Promise.all(
      categories.map(async (categoryName) => {
        const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');

        let category = await prisma.category.findUnique({
          where: { slug: categorySlug },
        });

        if (!category) {
          category = await prisma.category.create({
            data: {
              name: categoryName,
              slug: categorySlug,
            },
          });
        }

        // Avoid duplicate links
        const existingLink = await prisma.productCategory.findUnique({
          where: {
            productId_categoryId: {
              productId: finalProduct.id,
              categoryId: category.id,
            },
          },
        });

        if (!existingLink) {
          await prisma.productCategory.create({
            data: {
              productId: finalProduct.id,
              categoryId: category.id,
            },
          });
        }
      })
    );
  }

  // Handle variants if provided
  if (product.variants && product.variants.length > 0) {
    await Promise.all(
      product.variants.map(async (variant) => {
        let existingVariant = null;
        if (variant.sku) {
          existingVariant = await prisma.productVariant.findFirst({
            where: {
              sku: variant.sku,
              productId: finalProduct.id,
            },
          });
        }

        if (existingVariant) {
          await prisma.productVariant.update({
            where: { id: existingVariant.id },
            data: {
              name: variant.name,
              price: variant.price,
              stock: variant.stock ?? (variant.available ? 1 : 0),
              size: variant.size || existingVariant.size,
              color: variant.color || existingVariant.color,
              material: variant.material || existingVariant.material,
              image: variant.image || existingVariant.image,
            },
          });
        } else {
          if (variant.sku) {
            const skuConflict = await prisma.productVariant.findUnique({
              where: { sku: variant.sku },
            });
            if (skuConflict) {
              throw new Error(
                `Variant SKU '${variant.sku}' already exists for another product`
              );
            }
          }

          await prisma.productVariant.create({
            data: {
              productId: finalProduct.id,
              name: variant.name,
              sku: variant.sku,
              price: variant.price,
              stock: variant.stock ?? (variant.available ? 1 : 0),
              size: variant.size,
              color: variant.color,
              material: variant.material,
              image: variant.image,
            },
          });
        }
      })
    );
  }

  // Handle attributes if provided
  if (product.attributes && Object.keys(product.attributes).length > 0) {
    let categoryId: string | null = null;

    if (categories.length > 0) {
      const categorySlug = categories[0].toLowerCase().replace(/\s+/g, '-');
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      if (category) {
        categoryId = category.id;
      }
    }

    await prisma.productAttributeValue.deleteMany({
      where: { productId: finalProduct.id },
    });

    // Process attributes in parallel
    await Promise.all(
      Object.entries(product.attributes).map(async ([attributeName, attributeValues]) => {
        if (!Array.isArray(attributeValues) || attributeValues.length === 0) return;

        let attribute = null;

        if (categoryId) {
          attribute = await prisma.attribute.findFirst({
            where: {
              categoryId: categoryId,
              slug: attributeName.toLowerCase().replace(/\s+/g, '-'),
            },
          });

          if (!attribute) {
            attribute = await prisma.attribute.create({
              data: {
                categoryId: categoryId,
                name: attributeName,
                slug: attributeName.toLowerCase().replace(/\s+/g, '-'),
                type: 'multiselect',
                filterable: true,
                options: attributeValues,
              },
            });
          }
        } else {
          attribute = await prisma.attribute.findFirst({
            where: {
              slug: attributeName.toLowerCase().replace(/\s+/g, '-'),
            },
          });
        }

        if (attribute) {
          await prisma.productAttributeValue.create({
            data: {
              productId: finalProduct.id,
              attributeId: attribute.id,
              value: attributeValues.map(String).join(', '),
            },
          });
        }
      })
    );
  }
}
