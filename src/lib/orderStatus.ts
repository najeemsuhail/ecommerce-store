export const ORDER_STATUS_PROGRESS = [
  'pending',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
] as const;

export const ORDER_STATUS_FILTERS = ['all', ...ORDER_STATUS_PROGRESS] as const;

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  return_requested: 'Return Requested',
  returned: 'Returned',
  cancelled: 'Cancelled',
};

const POST_DELIVERY_STATUSES = new Set(['return_requested', 'returned']);

export function formatOrderStatus(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getOrderStatusBadgeClass(status: string): string {
  if (status === 'pending') return 'badge-pending';
  if (status === 'processing') return 'badge-processing';
  if (status === 'shipped' || status === 'out_for_delivery') return 'badge-shipped';
  if (status === 'delivered') return 'badge-delivered';
  if (status === 'return_requested') return 'badge-processing';
  return 'badge-cancelled';
}

export function getOrderStatusTimeline(status: string) {
  const currentStatus = POST_DELIVERY_STATUSES.has(status) ? 'delivered' : status;
  const currentIndex = ORDER_STATUS_PROGRESS.indexOf(
    currentStatus as (typeof ORDER_STATUS_PROGRESS)[number]
  );

  return ORDER_STATUS_PROGRESS.map((step, index) => ({
    name: step,
    completed: currentIndex >= 0 && index <= currentIndex,
    current: index === currentIndex,
  }));
}
