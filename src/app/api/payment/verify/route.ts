import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = body;

    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'paid',
        status: 'processing',
        paymentId: razorpay_payment_id,
      },
    });

    // Fetch full order details with items
const fullOrder = await prisma.order.findUnique({
  where: { id: orderId },
  include: {
    user: true,
    items: {
      include: {
        product: true,
      },
    },
  },
});

    // Await email sends so the request lifecycle does not end before Resend finishes.
    if (fullOrder) {
      const [customerEmailResult, adminEmailResult] = await Promise.allSettled([
        sendOrderConfirmationEmail(fullOrder),
        sendAdminNewOrderEmail(fullOrder),
      ]);

      if (customerEmailResult.status === 'rejected') {
        console.error('Failed to send confirmation email:', customerEmailResult.reason);
      }

      if (adminEmailResult.status === 'rejected') {
        console.error('Failed to send admin new order email:', adminEmailResult.reason);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
