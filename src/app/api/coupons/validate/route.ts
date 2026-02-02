import { NextRequest, NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/coupon-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { code, orderTotal, userId, guestEmail, productIds, categoryIds } =
      body;

    if (!code || orderTotal === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await validateCoupon({
      code,
      orderTotal,
      userId,
      guestEmail,
      productIds,
      categoryIds,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
