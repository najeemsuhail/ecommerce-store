import { readDeliveryPins, saveDeliveryPins } from '@/lib/deliveryPinsData';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/adminAuth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin authentication
    const adminAuth = await verifyAdminAuth(request);
    if (!adminAuth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type } = body;

    if (!type || !['cod', 'prepaid'].includes(type)) {
      return NextResponse.json(
        { message: 'Type must be either "cod" or "prepaid"' },
        { status: 400 }
      );
    }

    // Read existing pins
    const allPins = await readDeliveryPins();

    // Find and update the pin by index (id is the index)
    const index = parseInt(params.id);
    if (index < 0 || index >= allPins.length) {
      return NextResponse.json(
        { message: 'PIN code not found' },
        { status: 404 }
      );
    }

    allPins[index].type = type;
    await saveDeliveryPins(allPins);

    return NextResponse.json({
      success: true,
      message: 'PIN code updated successfully',
      data: allPins[index],
    });
  } catch (error: any) {
    console.error('Error updating PIN code:', error);
    return NextResponse.json(
      { message: 'Failed to update PIN code' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin authentication
    const adminAuth = await verifyAdminAuth(request);
    if (!adminAuth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Read existing pins
    const allPins = await readDeliveryPins();

    // Find and delete the pin by index (id is the index)
    const index = parseInt(params.id);
    if (index < 0 || index >= allPins.length) {
      return NextResponse.json(
        { message: 'PIN code not found' },
        { status: 404 }
      );
    }

    allPins.splice(index, 1);
    await saveDeliveryPins(allPins);

    return NextResponse.json({
      success: true,
      message: 'PIN code deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting PIN code:', error);
    return NextResponse.json(
      { message: 'Failed to delete PIN code' },
      { status: 500 }
    );
  }
}
