import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0', 10);
    const take = parseInt(searchParams.get('take') || '10', 10);

    // Validate pagination params
    if (skip < 0 || take < 1 || take > 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Get product to verify it exists
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Fetch reviews with pagination
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: { productId: product.id },
        skip,
        take,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({
        where: { productId: product.id },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        reviews,
        totalCount,
        hasMore: skip + take < totalCount,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
