type OrderPaymentLike = {
  status: string;
  paymentStatus: string;
};

const NON_PAYABLE_ORDER_STATUSES = new Set([
  'delivered',
  'cancelled',
  'returned',
  'return_requested',
]);

const NON_PAYABLE_PAYMENT_STATUSES = new Set([
  'paid',
  'refund_requested',
  'refunded',
]);

export function isOrderPayNowEligible(order: OrderPaymentLike): boolean {
  return (
    !NON_PAYABLE_ORDER_STATUSES.has(order.status) &&
    !NON_PAYABLE_PAYMENT_STATUSES.has(order.paymentStatus)
  );
}

export function getOrderPaymentMethodLabel(order: { paymentMethod?: string | null; paymentStatus: string }) {
  if (order.paymentMethod === 'cod' && order.paymentStatus !== 'paid') {
    return 'Cash on Delivery';
  }

  return 'Razorpay (Online)';
}
