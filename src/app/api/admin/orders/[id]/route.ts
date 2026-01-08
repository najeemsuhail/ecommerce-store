import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAdmin } from '@/lib/adminAuth';
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from '@/lib/emailService';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authorization
    const admin = await isAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus, trackingNumber, notes } = body;

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        paymentStatus,
        trackingNumber,
        notes,
      },
    });

    // Send email notifications based on status change
    if (status === 'shipped' || status === 'delivered') {
    const fullOrder = await prisma.order.findUnique({
        where: { id },
        include: {
        user: true,
        items: {
            include: {
            product: true,
            },
        },
        },
    });

    if (fullOrder) {
        if (status === 'shipped') {
        sendOrderShippedEmail(fullOrder).catch((err) =>
            console.error('Failed to send shipped email:', err)
        );
        } else if (status === 'delivered') {
        sendOrderDeliveredEmail(fullOrder).catch((err) =>
            console.error('Failed to send delivered email:', err)
        );
        }
     }
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}