const LOCALE = 'en-IN';

export const DELIVERY_ESTIMATE_DAYS = {
  shipped: { min: 2, max: 5 },
  out_for_delivery: { min: 0, max: 1 },
  default: { min: 3, max: 7 },
} as const;

interface DeliveryEstimateItem {
  product?: {
    isDigital?: boolean;
  };
}

interface DeliveryEstimateOrderLike {
  status?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  items?: DeliveryEstimateItem[];
}

function toDate(value?: string | Date): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' });
}

function formatLongDate(date: Date): string {
  return date.toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getDeliveryEstimateMessage(order: DeliveryEstimateOrderLike | null | undefined): string | null {
  if (!order) return null;

  const hasOnlyDigitalItems =
    Array.isArray(order.items) &&
    order.items.length > 0 &&
    order.items.every((item) => item.product?.isDigital);

  if (hasOnlyDigitalItems) return null;
  if (order.status === 'cancelled' || order.status === 'returned') return null;

  const createdAt = toDate(order.createdAt) ?? new Date();
  const updatedAt = toDate(order.updatedAt) ?? createdAt;

  if (order.status === 'delivered') {
    return `Delivered on ${formatLongDate(updatedAt)}`;
  }

  if (order.status === 'shipped') {
    const etaStart = addDays(updatedAt, DELIVERY_ESTIMATE_DAYS.shipped.min);
    const etaEnd = addDays(updatedAt, DELIVERY_ESTIMATE_DAYS.shipped.max);
    return `Estimated delivery: ${formatShortDate(etaStart)} - ${formatShortDate(etaEnd)}`;
  }

  if (order.status === 'out_for_delivery') {
    const etaStart = addDays(updatedAt, DELIVERY_ESTIMATE_DAYS.out_for_delivery.min);
    const etaEnd = addDays(updatedAt, DELIVERY_ESTIMATE_DAYS.out_for_delivery.max);
    return `Out for delivery. Estimated arrival: ${formatShortDate(etaStart)} - ${formatShortDate(etaEnd)}`;
  }

  const etaStart = addDays(createdAt, DELIVERY_ESTIMATE_DAYS.default.min);
  const etaEnd = addDays(createdAt, DELIVERY_ESTIMATE_DAYS.default.max);
  return `Estimated delivery: ${formatShortDate(etaStart)} - ${formatShortDate(etaEnd)}`;
}
