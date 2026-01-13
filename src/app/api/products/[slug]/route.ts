import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET single product by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        variants: {
          orderBy: { createdAt: 'asc' },
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Calculate average rating
    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length
        : 0;

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
      },
    });
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
        category: body.category,
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
      },
    });

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