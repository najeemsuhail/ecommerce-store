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

type CachedCategory = { id: string; slug: string; name: string };
type CachedAttribute = { id: string; slug: string; categoryId: string | null };
type SlugAllocator = { allocate: (baseSlug: string) => string };
type ExistingProduct = {
  id: string;
  sku: string | null;
  externalId: string | null;
  slug: string;
  stock: number | null;
  brand: string | null;
  source: string | null;
  tags: string[];
  images: string[];
  videoUrl: string | null;
  weight: number | null;
  dimensions: any;
  specifications: any;
  metaTitle: string | null;
  metaDescription: string | null;
  isDigital: boolean;
  trackInventory: boolean;
  isFeatured: boolean;
  isActive: boolean;
};
type ExistingProductMaps = {
  bySku: Map<string, ExistingProduct>;
  byExternalId: Map<string, ExistingProduct>;
  bySlug: Map<string, ExistingProduct>;
};

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
    const { products, categoryCache: cachedCategories } = body;

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

    const categoryCache = new Map<string, CachedCategory>();
    const attributeCache = new Map<string, CachedAttribute>();

    // Restore category cache from client if provided
    if (cachedCategories && Array.isArray(cachedCategories)) {
      for (const cat of cachedCategories) {
        categoryCache.set(cat.slug, cat);
      }
    }

    // Pre-fetch categories for this chunk
    const categoryNameBySlug = new Map<string, string>();
    const categorySlugs = new Set<string>();

    for (const product of products as ImportProduct[]) {
      const categories = Array.isArray(product.category)
        ? product.category
        : product.category
          ? [product.category]
          : [];

      for (const categoryName of categories) {
        const slug = toSlug(categoryName);
        categorySlugs.add(slug);
        if (!categoryNameBySlug.has(slug)) {
          categoryNameBySlug.set(slug, categoryName);
        }
      }
    }

    if (categorySlugs.size > 0) {
      const existingCategories = await prisma.category.findMany({
        where: { slug: { in: Array.from(categorySlugs) } },
        select: { id: true, slug: true, name: true },
      });

      for (const category of existingCategories) {
        categoryCache.set(category.slug, category);
      }

      const missingCategories = Array.from(categorySlugs)
        .filter((slug) => !categoryCache.has(slug))
        .map((slug) => ({
          slug,
          name: categoryNameBySlug.get(slug) || slug,
        }));

      if (missingCategories.length > 0) {
        await prisma.category.createMany({
          data: missingCategories,
          skipDuplicates: true,
        });

        const createdCategories = await prisma.category.findMany({
          where: { slug: { in: missingCategories.map((item) => item.slug) } },
          select: { id: true, slug: true, name: true },
        });

        for (const category of createdCategories) {
          categoryCache.set(category.slug, category);
        }
      }
    }

    // Prefetch slugs and existing products
    const batchBaseSlugs = products
      .map((product) => toSlug((product as ImportProduct).slug || (product as ImportProduct).name || ''))
      .filter((slug) => slug.length > 0);
    const existingSlugs = await getExistingSlugs(batchBaseSlugs);
    const slugAllocator = createSlugAllocator(existingSlugs);
    const existingProducts = await getExistingProducts(products as ImportProduct[]);

    // Process products sequentially (CONCURRENCY = 1)
    for (let i = 0; i < products.length; i++) {
      const product = products[i] as ImportProduct;
      try {
        await importProduct(
          product,
          i,
          results,
          categoryCache,
          attributeCache,
          slugAllocator,
          existingProducts
        );
      } catch (error) {
        results.failed++;
        results.errors.push({
          index: i + 1,
          name: product?.name || `Product ${i + 1}`,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      categoryCache: Array.from(categoryCache.values()),
    });
  } catch (error) {
    console.error('Error importing product chunk:', error);
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
  results: any,
  categoryCache: Map<string, CachedCategory>,
  attributeCache: Map<string, CachedAttribute>,
  slugAllocator: SlugAllocator,
  existingProducts: ExistingProductMaps
): Promise<void> {
  // Validation
  if (!product.name || !product.description || product.price === undefined) {
    throw new Error('Missing required fields: name, description, price');
  }

  if (product.price < 0) {
    throw new Error('Price cannot be negative');
  }

  // Generate slug from name if not provided
  const baseSlug = toSlug(product.slug || product.name || '');

  // Check if product already exists - priority: SKU > externalId > slug
  const existingProduct = resolveExistingProduct(product, baseSlug, existingProducts);

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
        sku: product.sku || existingProduct.sku || undefined,
        stock: product.stock ?? existingProduct.stock,
        brand: product.brand || existingProduct.brand || undefined,
        externalId: String(product.externalId) || existingProduct.externalId || undefined,
        source: product.source || existingProduct.source || undefined,
        tags: product.tags || existingProduct.tags,
        images: product.images || existingProduct.images,
        videoUrl: product.videoUrl || existingProduct.videoUrl || undefined,
        weight: product.weight || existingProduct.weight || undefined,
        dimensions: product.dimensions || existingProduct.dimensions || undefined,
        specifications: product.specifications || existingProduct.specifications || undefined,
        metaTitle: product.metaTitle || existingProduct.metaTitle || undefined,
        metaDescription: product.metaDescription || existingProduct.metaDescription || undefined,
        isDigital: product.isDigital ?? existingProduct.isDigital,
        trackInventory: product.trackInventory ?? existingProduct.trackInventory,
        isFeatured: product.isFeatured ?? existingProduct.isFeatured,
        isActive: product.isActive ?? existingProduct.isActive,
      },
    });
    results.updated++;
  } else {
    const finalSlug = slugAllocator.allocate(baseSlug);

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

  // Handle categories
  const categories = Array.isArray(product.category)
    ? product.category
    : product.category
      ? [product.category]
      : [];

  let primaryCategoryId: string | null = null;
  const categoryIds = new Set<string>();

  if (categories.length > 0) {
    const firstCategory = await getOrCreateCategory(categories[0], categoryCache);
    primaryCategoryId = firstCategory.id;
    categoryIds.add(firstCategory.id);

    for (const categoryName of categories.slice(1)) {
      const category = await getOrCreateCategory(categoryName, categoryCache);
      categoryIds.add(category.id);
    }
  }

  if (categoryIds.size > 0) {
    await prisma.productCategory.deleteMany({
      where: { productId: finalProduct.id },
    });

    await prisma.productCategory.createMany({
      data: Array.from(categoryIds).map((categoryId) => ({
        productId: finalProduct.id,
        categoryId,
      })),
      skipDuplicates: true,
    });
  }

  // Handle variants if provided
  if (product.variants && product.variants.length > 0) {
    for (const variant of product.variants) {
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
    }
  }

  // Handle attributes if provided
  if (product.attributes && Object.keys(product.attributes).length > 0) {
    await prisma.productAttributeValue.deleteMany({
      where: { productId: finalProduct.id },
    });

    const attributeValueData: Array<{ productId: string; attributeId: string; value: string }> = [];

    for (const [attributeName, attributeValues] of Object.entries(product.attributes)) {
      if (!Array.isArray(attributeValues) || attributeValues.length === 0) continue;

      const attribute = await getOrCreateAttribute(
        attributeName,
        attributeValues,
        primaryCategoryId,
        attributeCache
      );

      if (attribute) {
        attributeValueData.push({
          productId: finalProduct.id,
          attributeId: attribute.id,
          value: attributeValues.map(String).join(', '),
        });
      }
    }

    if (attributeValueData.length > 0) {
      await prisma.productAttributeValue.createMany({
        data: attributeValueData,
        skipDuplicates: true,
      });
    }
  }
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, '');
}

async function getExistingSlugs(baseSlugs: string[]): Promise<Set<string>> {
  const uniqueBaseSlugs = Array.from(new Set(baseSlugs.filter((slug) => slug.length > 0)));
  if (uniqueBaseSlugs.length === 0) return new Set();

  const existing = await prisma.product.findMany({
    where: {
      OR: uniqueBaseSlugs.map((slug) => ({ slug: { startsWith: slug } })),
    },
    select: { slug: true },
  });

  return new Set(existing.map((item) => item.slug));
}

function createSlugAllocator(existingSlugs: Set<string>): SlugAllocator {
  const reserved = new Set(existingSlugs);
  const counters = new Map<string, number>();

  return {
    allocate: (baseSlug: string) => {
      if (!baseSlug) return baseSlug;

      let counter = counters.get(baseSlug) ?? 0;
      let candidate = counter === 0 ? baseSlug : `${baseSlug}-${counter}`;

      while (reserved.has(candidate)) {
        counter += 1;
        candidate = `${baseSlug}-${counter}`;
      }

      counters.set(baseSlug, counter);
      reserved.add(candidate);
      return candidate;
    },
  };
}

async function getExistingProducts(products: ImportProduct[]): Promise<ExistingProductMaps> {
  const skus = products
    .map((product) => product.sku)
    .filter((sku): sku is string => Boolean(sku));
  const externalIds = products
    .map((product) => product.externalId)
    .filter((externalId): externalId is string | number => externalId !== undefined && externalId !== null)
    .map((externalId) => String(externalId));
  const slugs = products
    .map((product) => toSlug(product.slug || product.name || ''))
    .filter((slug) => slug.length > 0);

  const orFilters: Array<{ sku?: { in: string[] }; externalId?: { in: string[] }; slug?: { in: string[] } }> = [];
  if (skus.length > 0) orFilters.push({ sku: { in: skus } });
  if (externalIds.length > 0) orFilters.push({ externalId: { in: externalIds } });
  if (slugs.length > 0) orFilters.push({ slug: { in: slugs } });

  const existing = orFilters.length > 0
    ? await prisma.product.findMany({
        where: {
          OR: orFilters,
        },
        select: {
          id: true,
          sku: true,
          externalId: true,
          slug: true,
          stock: true,
          brand: true,
          source: true,
          tags: true,
          images: true,
          videoUrl: true,
          weight: true,
          dimensions: true,
          specifications: true,
          metaTitle: true,
          metaDescription: true,
          isDigital: true,
          trackInventory: true,
          isFeatured: true,
          isActive: true,
        },
      })
    : [];

  const bySku = new Map<string, ExistingProduct>();
  const byExternalId = new Map<string, ExistingProduct>();
  const bySlug = new Map<string, ExistingProduct>();

  for (const product of existing) {
    if (product.sku) {
      bySku.set(product.sku, product);
    }
    if (product.externalId) {
      byExternalId.set(product.externalId, product);
    }
    bySlug.set(product.slug, product);
  }

  return { bySku, byExternalId, bySlug };
}

function resolveExistingProduct(
  product: ImportProduct,
  baseSlug: string,
  existingProducts: ExistingProductMaps
): ExistingProduct | null {
  if (product.sku) {
    return existingProducts.bySku.get(product.sku) || null;
  }

  if (product.externalId) {
    return existingProducts.byExternalId.get(String(product.externalId)) || null;
  }

  if (baseSlug) {
    return existingProducts.bySlug.get(baseSlug) || null;
  }

  return null;
}

async function getOrCreateCategory(
  categoryName: string,
  categoryCache: Map<string, CachedCategory>
): Promise<CachedCategory> {
  const categorySlug = toSlug(categoryName);
  const cached = categoryCache.get(categorySlug);
  if (cached) return cached;

  let category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    select: { id: true, slug: true, name: true },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: categoryName,
        slug: categorySlug,
      },
      select: { id: true, slug: true, name: true },
    });
  }

  categoryCache.set(category.slug, category);
  return category;
}

async function getOrCreateAttribute(
  attributeName: string,
  attributeValues: string[],
  categoryId: string | null,
  attributeCache: Map<string, CachedAttribute>
): Promise<CachedAttribute | null> {
  const slug = toSlug(attributeName);
  const cacheKey = `${categoryId || 'global'}:${slug}`;
  const cached = attributeCache.get(cacheKey);
  if (cached) return cached;

  let attribute = null;

  if (categoryId) {
    attribute = await prisma.attribute.findFirst({
      where: {
        categoryId,
        slug,
      },
      select: { id: true, slug: true, categoryId: true },
    });

    if (!attribute) {
      attribute = await prisma.attribute.create({
        data: {
          categoryId,
          name: attributeName,
          slug,
          type: 'multiselect',
          filterable: true,
          options: attributeValues,
        },
        select: { id: true, slug: true, categoryId: true },
      });
    }
  } else {
    attribute = await prisma.attribute.findFirst({
      where: { slug },
      select: { id: true, slug: true, categoryId: true },
    });
  }

  if (!attribute) return null;

  const cachedAttribute = {
    id: attribute.id,
    slug: attribute.slug,
    categoryId: attribute.categoryId,
  };
  attributeCache.set(cacheKey, cachedAttribute);
  return cachedAttribute;
}
