import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  deleteProductFromElasticsearch,
  syncProductToElasticsearch,
} from '@/lib/elasticsearchSync';
import { getProductDetailBySlug } from '@/lib/productDetail';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET single product by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const startTime = Date.now();
  try {
    const { slug } = await params;

    const product = await getProductDetailBySlug(slug);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        product,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
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
