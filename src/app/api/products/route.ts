import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all products (with search and filter)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const isDigital = searchParams.get('isDigital');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const tag = searchParams.get('tag');
    const isFeatured = searchParams.get('isFeatured');

    // Build filter object
    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (brand) {
      where.brand = brand;
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

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

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

    return NextResponse.json({
      success: true,
      products: productsWithRating,
      count: productsWithRating.length,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
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
      category,
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
        category,
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
      },
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