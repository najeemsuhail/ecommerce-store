import { NextRequest, NextResponse } from 'next/server';
import { createCoupon } from '@/lib/coupon-utils';
import { prisma } from '@/lib/prisma';

// GET all coupons (admin)
export async function GET(request: NextRequest) {
  try {
    // In production, verify admin authentication
    const coupons = await prisma.coupon.findMany({
      select: {
        id: true,
        code: true,
        description: true,
        discountType: true,
        discountValue: true,
        maxDiscount: true,
        minOrderValue: true,
        maxUses: true,
        maxUsesPerCustomer: true,
        expiryDate: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { usages: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new coupon (admin)
export async function POST(request: NextRequest) {
  try {
    // In production, verify admin authentication
    const body = await request.json();

    const coupon = await createCoupon({
      code: body.code,
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
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
