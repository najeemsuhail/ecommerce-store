import { findDeliveryPin } from '@/lib/deliveryPinsData';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pinCode } = body;

    // Validate PIN code format
    if (!pinCode || !/^\d{6}$/.test(pinCode)) {
      return NextResponse.json(
        { message: 'Invalid PIN code format. Please enter a 6-digit PIN code.' },
        { status: 400 }
      );
    }

    // Check if PIN code exists in delivery data
    const deliveryPin = await findDeliveryPin(pinCode);

    if (!deliveryPin) {
      return NextResponse.json(
        {
          available: false,
          pinCode,
          message: 'We currently do not deliver to this area. Please check back later!',
        },
        { status: 200 }
      );
    }

    // Return delivery information
    return NextResponse.json(
      {
        available: true,
        pinCode,
        type: deliveryPin.type,
        message: 'Great! We deliver to your area.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PIN code check error:', error);
    return NextResponse.json(
      { message: 'Failed to check delivery availability' },
      { status: 500 }
    );
  }
}
