import { readDeliveryPins, saveDeliveryPins } from '@/lib/deliveryPinsData';
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminAuth = await isAdmin(request);
    if (!adminAuth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const pins = await readDeliveryPins();

    return NextResponse.json({
      success: true,
      data: pins,
    });
  } catch (error) {
    console.error('Error fetching PIN codes:', error);
    return NextResponse.json(
      { message: 'Failed to fetch PIN codes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminAuth = await isAdmin(request);
    if (!adminAuth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pinCode, type } = body;

    if (!pinCode || !/^\d{6}$/.test(pinCode)) {
      return NextResponse.json(
        { message: 'Invalid PIN code format' },
        { status: 400 }
      );
    }

    if (!type || !['cod', 'prepaid'].includes(type)) {
      return NextResponse.json(
        { message: 'Type must be either "cod" or "prepaid"' },
        { status: 400 }
      );
    }

    // Read existing pins
    const allPins = await readDeliveryPins();

    // Check if pin already exists
    const exists = allPins.some((p) => p.pinCode === pinCode && p.type === type);
    if (exists) {
      return NextResponse.json(
        { message: 'This PIN code with this type already exists' },
        { status: 400 }
      );
    }

    // Add new pin
    allPins.push({ pinCode, type });

    // Save back to file
    await saveDeliveryPins(allPins);

    return NextResponse.json({
      success: true,
      message: 'PIN code added successfully',
      data: { pinCode, type },
    });
  } catch (error: any) {
    console.error('Error creating PIN code:', error);
    return NextResponse.json(
      { message: 'Failed to create PIN code' },
      { status: 500 }
    );
  }
}
