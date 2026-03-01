import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAdmin } from '@/lib/adminAuth';
import { deleteProductsFromElasticsearch } from '@/lib/elasticsearchSync';

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
    const { productIds } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No products selected' },
        { status: 400 }
      );
    }

    // Delete products and their related data (cascade handled by Prisma)
    const result = await prisma.product.deleteMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    await deleteProductsFromElasticsearch(productIds);

    return NextResponse.json({
      success: true,
      deleted: result.count,
      message: `Successfully deleted ${result.count} product(s)`,
    });
  } catch (error) {
    console.error('Error deleting products:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete products',
      },
      { status: 500 }
    );
  }
}
