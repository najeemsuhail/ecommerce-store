'use client';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
};

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function isAnalyticsEnabled() {
  return typeof window !== 'undefined' && typeof window.gtag === 'function' && Boolean(measurementId);
}

export function trackPageView(url: string) {
  if (!isAnalyticsEnabled()) {
    return;
  }

  window.gtag!('event', 'page_view', {
    page_path: url,
    page_location: window.location.href,
  });
}

export function trackEvent(eventName: string, params: Record<string, unknown>) {
  if (!isAnalyticsEnabled()) {
    return;
  }

  window.gtag!('event', eventName, params);
}

export function trackViewItem(item: AnalyticsItem, currency = 'INR') {
  trackEvent('view_item', {
    currency,
    value: item.price ?? 0,
    items: [item],
  });
}

export function trackAddToCart(item: AnalyticsItem, currency = 'INR') {
  trackEvent('add_to_cart', {
    currency,
    value: (item.price ?? 0) * (item.quantity ?? 1),
    items: [item],
  });
}

export function trackBeginCheckout(items: AnalyticsItem[], value: number, currency = 'INR') {
  trackEvent('begin_checkout', {
    currency,
    value,
    items,
  });
}

export function trackPurchase(
  transactionId: string,
  items: AnalyticsItem[],
  value: number,
  currency = 'INR'
) {
  trackEvent('purchase', {
    transaction_id: transactionId,
    currency,
    value,
    items,
  });
}
