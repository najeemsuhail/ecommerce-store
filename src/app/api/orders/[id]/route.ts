import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { extractToken, verifyToken } from '@/lib/auth';

const RETURN_WINDOW_HOURS = 48;

function getReturnEligibility(order: {
  status: string;
  paymentStatus: string;
  updatedAt: Date;
}) {
  if (order.status === 'return_requested' || order.status === 'returned') {
    return {
      eligible: false,
      reason: 'Return already requested for this order.',
      expiresAt: null as string | null,
    };
  }

  if (order.status !== 'delivered') {
    return {
      eligible: false,
      reason: 'Only delivered orders are eligible for return.',
      expiresAt: null as string | null,
    };
  }

  const expiresAt = new Date(order.updatedAt.getTime() + RETURN_WINDOW_HOURS * 60 * 60 * 1000);
  if (new Date() > expiresAt) {
    return {
      eligible: false,
      reason: `Return window expired (${RETURN_WINDOW_HOURS} hours).`,
      expiresAt: expiresAt.toISOString(),
    };
  }

  if (order.paymentStatus === 'refund_requested' || order.paymentStatus === 'refunded') {
    return {
      eligible: false,
      reason: 'Refund already requested for this order.',
      expiresAt: expiresAt.toISOString(),
    };
  }

  return {
    eligible: true,
    reason: null as string | null,
    expiresAt: expiresAt.toISOString(),
  };
}

// GET single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get token (optional)
    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);
    const decoded = token ? verifyToken(token) : null;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check authorization (user can only view their own orders, unless guest with matching email)
    if (decoded) {
      if (order.userId !== decoded.userId) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 403 }
        );
      }
    } else {
      // For guest orders, require email verification via query param
      const guestEmail = request.nextUrl.searchParams.get('guestEmail');
      if (order.guestEmail !== guestEmail) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      order,
      returnEligibility: getReturnEligibility(order),
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// POST - Customer return/refund request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const requestType = body?.requestType === 'refund' ? 'refund' : 'return';
    const reason =
      typeof body?.reason === 'string' ? body.reason.trim().slice(0, 500) : '';

    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);
    const decoded = token ? verifyToken(token) : null;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (decoded) {
      if (order.userId !== decoded.userId) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 403 }
        );
      }
    } else {
      const guestEmail = request.nextUrl.searchParams.get('guestEmail');
      if (order.guestEmail !== guestEmail) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }

    const eligibility = getReturnEligibility(order);
    if (!eligibility.eligible) {
      return NextResponse.json(
        { success: false, error: eligibility.reason || 'Order is not eligible for return.' },
        { status: 400 }
      );
    }

    if (requestType === 'refund' && order.paymentStatus !== 'paid') {
      return NextResponse.json(
        { success: false, error: 'Refund is only available for paid orders.' },
        { status: 400 }
      );
    }

    const noteLine = `[${new Date().toISOString()}] Customer requested ${requestType}${reason ? `: ${reason}` : ''}`;
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'return_requested',
        paymentStatus:
          requestType === 'refund' && order.paymentStatus === 'paid'
            ? 'refund_requested'
            : order.paymentStatus,
        notes: order.notes ? `${order.notes}\n${noteLine}` : noteLine,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        requestType === 'refund'
          ? 'Refund request submitted successfully.'
          : 'Return request submitted successfully.',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error requesting return/refund:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit request' },
      { status: 500 }
    );
  }
}

// PATCH - Update order status (for admin or payment webhook)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus, paymentId, trackingNumber } = body;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: status || order.status,
        paymentStatus: paymentStatus || order.paymentStatus,
        paymentId: paymentId || order.paymentId,
        trackingNumber: trackingNumber || order.trackingNumber,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
