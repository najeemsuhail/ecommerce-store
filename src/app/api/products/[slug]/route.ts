import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  deleteProductFromElasticsearch,
  syncProductToElasticsearch,
} from '@/lib/elasticsearchSync';

export const revalidate = 60; // ISR: Revalidate every 60 seconds

// GET single product by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const startTime = Date.now();
  try {
    const { slug } = await params;

    const [product, reviewStats] = await Promise.all([
      prisma.product.findUnique({
        where: { slug },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          images: true,
          videoUrl: true,
          isDigital: true,
          isActive: true,
          stock: true,
          weight: true,
          brand: true,
          specifications: true,
          tags: true,
          variants: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              name: true,
              price: true,
              stock: true,
              isActive: true,
            },
          },
          categories: {
            select: {
              categoryId: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          reviews: {
            take: 10, // Limit to first 10 reviews for UI list
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              rating: true,
              comment: true,
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.review.aggregate({
        _avg: {
          rating: true,
        },
        _count: {
          id: true,
        },
        where: {
          product: {
            slug,
          },
        },
      }),
    ]);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const avgRating = reviewStats._avg.rating ?? 0;
    const reviewCount = reviewStats._count.id ?? 0;

    return NextResponse.json(
      {
        success: true,
        product: {
          ...product,
          averageRating: Math.round(avgRating * 10) / 10,
          reviewCount,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=120',
          'X-Product-Source': 'database',
          'X-Response-Time-ms': String(Date.now() - startTime),
        },
      }
    );
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // If slug is being changed, check if new slug already exists
    if (body.slug && body.slug !== slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug: body.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'New slug already exists' },
          { status: 400 }
        );
      }
    }

    const product = await prisma.product.update({
      where: { slug },
      data: {
        name: body.name,
        description: body.description,
        price: body.price ? parseFloat(body.price) : undefined,
        comparePrice: body.comparePrice ? parseFloat(body.comparePrice) : null,
        isDigital: body.isDigital,
        stock: body.stock ? parseInt(body.stock) : null,
        sku: body.sku,
        trackInventory: body.trackInventory,
        images: body.images,
        videoUrl: body.videoUrl,
        tags: body.tags,
        brand: body.brand,
        weight: body.weight ? parseFloat(body.weight) : null,
        dimensions: body.dimensions,
        specifications: body.specifications,
        slug: body.slug,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        isFeatured: body.isFeatured,
        isActive: body.isActive,
        categories: body.categoryIds ? {
          deleteMany: {},
          create: body.categoryIds.map((categoryId: string) => ({
            categoryId
          }))
        } : undefined
      },
      include: {
        categories: true
      }
    });

    await syncProductToElasticsearch(product.id);

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    await prisma.product.delete({
      where: { slug },
    });
    await deleteProductFromElasticsearch(existingProduct.id);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
