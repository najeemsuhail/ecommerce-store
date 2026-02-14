import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const revalidate = 300; // ISR: Revalidate every 5 minutes (industry standard)

// GET all products (with search and filter)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const categories = searchParams.getAll('category'); // Get all category values
    const brands = searchParams.getAll('brand'); // Get all brand values
    const isDigital = searchParams.get('isDigital');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const tag = searchParams.get('tag');
    const isFeatured = searchParams.get('isFeatured');
    const sort = searchParams.get('sort') || 'newest';
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    // Get attribute filters - they come as pairs: attribute=attrId&value=val&attribute=attrId&value=val
    const attributeFilters = new Map<string, string[]>();
    const attributeParams = searchParams.getAll('attribute');
    const valueParams = searchParams.getAll('value');
    
    // Pair them up
    for (let i = 0; i < attributeParams.length; i++) {
      const attrId = attributeParams[i];
      const value = valueParams[i];
      if (!attributeFilters.has(attrId)) {
        attributeFilters.set(attrId, []);
      }
      attributeFilters.get(attrId)!.push(value);
    }

    // Build filter object
    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
        // Also search in category names
        {
          categories: {
            some: {
              category: {
                name: { contains: search, mode: 'insensitive' }
              }
            }
          }
        },
      ];
    }

    // Handle multiple categories (by name or slug)
    if (categories.length > 0) {
      where.categories = {
        some: {
          category: {
            OR: [
              { name: { in: categories } },
              { slug: { in: categories } },
            ],
          }
        }
      };
    }

    // Handle attribute filters
    if (attributeFilters.size > 0) {
      const attributeConditions = Array.from(attributeFilters.entries()).map(
        ([attrId, values]) => ({
          attributes: {
            some: {
              attributeId: attrId,
              value: {
                in: values,
              },
            },
          },
        })
      );
      
      where.AND = attributeConditions;
    }

    // Handle multiple brands
    if (brands.length > 0) {
      where.brand = {
        in: brands,
      };
    }

    if (isDigital === 'true') {
      where.isDigital = true;
    } else if (isDigital === 'false') {
      where.isDigital = false;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (tag) {
      where.tags = { has: tag };
    }

    if (isFeatured === 'true') {
      where.isFeatured = true;
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' };
    switch (sort) {
      case 'price-low':
        orderBy = { price: 'asc' };
        break;
      case 'price-high':
        orderBy = { price: 'desc' };
        break;
      case 'popular':
        orderBy = { createdAt: 'desc' }; // Could be enhanced with view count
        break;
      case 'rating':
        orderBy = { createdAt: 'desc' }; // Will be sorted after calculating ratings
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        attributes: {
          include: {
            attribute: true,
          },
        },
        variants: true,
      },
    });

    // Get total count for pagination
    const totalCount = await prisma.product.count({ where });

    // If no products found, return empty array
    if (products.length === 0) {
      return NextResponse.json(
        {
          success: true,
          products: [],
          count: 0,
          total: 0,
        },
        {
          headers: {
            'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=120',
          },
        }
      );
    }

    // Calculate average rating for each product
    const productsWithRating = products.map((product: any) => {
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length
          : 0;
      
      const { reviews, ...productData } = product;
      
      return {
        ...productData,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
      };
    });

    // Sort by rating if requested
    if (sort === 'rating') {
      productsWithRating.sort((a, b) => b.averageRating - a.averageRating);
    }

    return NextResponse.json(
      {
        success: true,
        products: productsWithRating,
        count: productsWithRating.length,
        total: totalCount,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[API /products] Error:', errorMessage, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products', details: errorMessage },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      comparePrice,
      isDigital,
      stock,
      sku,
      trackInventory,
      images,
      videoUrl,
      categoryIds,
      tags,
      brand,
      weight,
      dimensions,
      specifications,
      slug,
      metaTitle,
      metaDescription,
      isFeatured,
    } = body;

    // Validation
    if (!name || !description || !price || !slug) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product with this slug already exists' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        isDigital: isDigital || false,
        stock: stock ? parseInt(stock) : null,
        sku,
        trackInventory: trackInventory !== false,
        images: images || [],
        videoUrl: videoUrl || null,
        tags: tags || [],
        brand,
        weight: weight ? parseFloat(weight) : null,
        dimensions,
        specifications,
        slug,
        metaTitle,
        metaDescription,
        isFeatured: isFeatured || false,
        isActive: true,
        categories: {
          create: (categoryIds || []).map((categoryId: string) => ({
            categoryId
          }))
        }
      },
      include: {
        categories: true
      }
    });

    return NextResponse.json({
      success: true,
      product,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}