import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET single coupon
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Error fetching coupon:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In production, verify admin authentication
    const body = await request.json();

    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        code: body.code?.toUpperCase().trim(),
        description: body.description,
        discountType: body.discountType,
        discountValue: body.discountValue,
        maxDiscount: body.maxDiscount,
        minOrderValue: body.minOrderValue,
        maxUses: body.maxUses,
        maxUsesPerCustomer: body.maxUsesPerCustomer,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
        isActive: body.isActive,
        applicableProducts: body.applicableProducts,
        applicableCategories: body.applicableCategories,
      },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// DELETE coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In production, verify admin authentication
    await prisma.coupon.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Coupon deleted' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
