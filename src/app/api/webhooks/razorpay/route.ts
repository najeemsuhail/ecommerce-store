import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

type RazorpayWebhookPayment = {
  id: string;
  notes?: {
    orderId?: string;
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature')!;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);

    // Handle different events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentSuccess(event.payload.payment.entity);
        break;

      case 'payment.failed':
        await handlePaymentFailure(event.payload.payment.entity);
        break;

      default:
        console.log(`Unhandled event: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(payment: RazorpayWebhookPayment) {
  const orderId = payment.notes?.orderId;

  if (!orderId) {
    console.error('No orderId in payment notes');
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      status: true,
      paymentMethod: true,
      notes: true,
    },
  });

  if (!order) {
    console.error(`Order not found for payment success: ${orderId}`);
    return;
  }

  const updatedNotes =
    order.paymentMethod === 'cod'
      ? order.notes
        ? `${order.notes}\n[${new Date().toISOString()}] Payment converted from COD to prepaid via Razorpay webhook.`
        : `[${new Date().toISOString()}] Payment converted from COD to prepaid via Razorpay webhook.`
      : order.notes;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'paid',
      status: order.status === 'pending' ? 'processing' : order.status,
      paymentMethod: 'razorpay',
      paymentId: payment.id,
      notes: updatedNotes,
    },
  });

  console.log(`✅ Payment successful for order: ${orderId}`);
}

async function handlePaymentFailure(payment: RazorpayWebhookPayment) {
  const orderId = payment.notes?.orderId;

  if (!orderId) {
    console.error('No orderId in payment notes');
    return;
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'failed',
      status: 'cancelled',
    },
  });

  console.log(`❌ Payment failed for order: ${orderId}`);
}
