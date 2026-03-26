import { formatPrice } from '@/lib/currency';

export type WhatsAppOrderItem = {
  name: string;
  quantity: number;
  price: number;
  variantName?: string;
};

export type WhatsAppAddress = {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
};

type ProductMessageInput = {
  storeName: string;
  productName: string;
  quantity: number;
  price: number;
  variantName?: string;
  productUrl?: string;
};

type CartMessageInput = {
  storeName: string;
  items: WhatsAppOrderItem[];
  total: number;
  shippingCost?: number;
  discount?: number;
  paymentMethodLabel?: string;
  shippingAddress?: WhatsAppAddress;
};

export function normalizeWhatsAppNumber(phone: string | null | undefined): string | null {
  if (!phone) {
    return null;
  }

  const digits = phone.replace(/\D/g, '');

  if (!digits) {
    return null;
  }

  return digits.startsWith('00') ? digits.slice(2) : digits;
}

export function buildWhatsAppUrl(phone: string | null | undefined, message: string): string | null {
  const normalizedPhone = normalizeWhatsAppNumber(phone);

  if (!normalizedPhone) {
    return null;
  }

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

export function buildProductWhatsAppMessage({
  storeName,
  productName,
  quantity,
  price,
  variantName,
  productUrl,
}: ProductMessageInput): string {
  const lines = [
    `Hello ${storeName}, I want to buy this product on WhatsApp.`,
    '',
    `Product: ${productName}`,
    variantName ? `Variant: ${variantName}` : null,
    `Quantity: ${quantity}`,
    `Estimated total: ${formatPrice(price * quantity)}`,
    productUrl ? `Product link: ${productUrl}` : null,
  ];

  return lines.filter(Boolean).join('\n');
}

export function buildCartWhatsAppMessage({
  storeName,
  items,
  total,
  shippingCost,
  discount,
  paymentMethodLabel,
  shippingAddress,
}: CartMessageInput): string {
  const itemLines = items.map((item) => {
    const variantSegment = item.variantName ? ` (${item.variantName})` : '';
    return `- ${item.quantity} x ${item.name}${variantSegment} = ${formatPrice(item.price * item.quantity)}`;
  });

  const addressLines = shippingAddress
    ? [
        shippingAddress.name ? `Name: ${shippingAddress.name}` : null,
        shippingAddress.phone ? `Phone: ${shippingAddress.phone}` : null,
        shippingAddress.address ? `Address: ${shippingAddress.address}` : null,
        shippingAddress.city || shippingAddress.postalCode
          ? `City/PIN: ${[shippingAddress.city, shippingAddress.postalCode].filter(Boolean).join(' - ')}`
          : null,
        shippingAddress.country ? `Country: ${shippingAddress.country}` : null,
      ].filter(Boolean)
    : [];

  const lines = [
    `Hello ${storeName}, I want to place this order on WhatsApp.`,
    '',
    'Items:',
    ...itemLines,
    '',
    shippingCost !== undefined ? `Shipping: ${shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}` : null,
    discount && discount > 0 ? `Discount: -${formatPrice(discount)}` : null,
    `Order total: ${formatPrice(total)}`,
    paymentMethodLabel ? `Payment preference: ${paymentMethodLabel}` : null,
    addressLines.length > 0 ? '' : null,
    addressLines.length > 0 ? 'Shipping details:' : null,
    ...addressLines,
  ];

  return lines.filter(Boolean).join('\n');
}
