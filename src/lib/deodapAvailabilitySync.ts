import prisma from './prisma';
import { DEODAP_COLLECTION_FEED_URLS } from './deodapFeedUrls';

type DeodapVariant = {
  available?: boolean;
};

type DeodapProduct = {
  id: string | number;
  status?: string;
  available?: boolean;
  published_at?: string | null;
  variants?: DeodapVariant[];
};

type DeodapProductsResponse = {
  products?: DeodapProduct[];
};

type SyncOptions = {
  deactivateMissing?: boolean;
  source?: string;
  urls?: string[];
};

export type DeodapAvailabilitySyncResult = {
  source: string;
  feedsProcessed: number;
  productsSeenInFeeds: number;
  uniqueExternalIdsInFeeds: number;
  dbProductsChecked: number;
  matchedProducts: number;
  activated: number;
  deactivated: number;
  unchanged: number;
  missingInFeeds: number;
};

const FEED_PAGE_LIMIT = 250;
const FEED_MAX_PAGES = 40;

function appendPaging(url: string, page: number, limit: number): string {
  const parsed = new URL(url);
  parsed.searchParams.set('limit', String(limit));
  parsed.searchParams.set('page', String(page));
  return parsed.toString();
}

function isProductAvailable(product: DeodapProduct): boolean {
  if (typeof product.available === 'boolean') {
    return product.available;
  }

  if (product.status && product.status !== 'active') {
    return false;
  }

  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants.some((variant) => variant.available === true);
  }

  if (product.published_at === null) {
    return false;
  }

  return true;
}

async function fetchProductsFromFeed(feedUrl: string): Promise<DeodapProduct[]> {
  const allProducts: DeodapProduct[] = [];

  for (let page = 1; page <= FEED_MAX_PAGES; page++) {
    const url = appendPaging(feedUrl, page, FEED_PAGE_LIMIT);
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Feed request failed (${response.status}) for ${url}`);
    }

    const payload = (await response.json()) as DeodapProductsResponse;
    const products = Array.isArray(payload.products) ? payload.products : [];

    if (products.length === 0) {
      break;
    }

    allProducts.push(...products);

    if (products.length < FEED_PAGE_LIMIT) {
      break;
    }
  }

  return allProducts;
}

export async function syncDeodapAvailability(
  options: SyncOptions = {}
): Promise<DeodapAvailabilitySyncResult> {
  const source = options.source || 'deodap';
  const urls = options.urls && options.urls.length > 0 ? options.urls : DEODAP_COLLECTION_FEED_URLS;
  const deactivateMissing = options.deactivateMissing === true;

  const availabilityByExternalId = new Map<string, boolean>();
  let productsSeenInFeeds = 0;

  for (const feedUrl of urls) {
    const products = await fetchProductsFromFeed(feedUrl);

    for (const product of products) {
      if (product.id === undefined || product.id === null) {
        continue;
      }

      const externalId = String(product.id);
      const available = isProductAvailable(product);
      const existing = availabilityByExternalId.get(externalId);

      // If the same product appears in multiple feeds, keep it active if any feed says available.
      availabilityByExternalId.set(externalId, Boolean(existing) || available);
      productsSeenInFeeds++;
    }
  }

  const dbProducts = await prisma.product.findMany({
    where: {
      source,
      externalId: { not: null },
    },
    select: {
      id: true,
      externalId: true,
      isActive: true,
    },
  });

  const idsToActivate: string[] = [];
  const idsToDeactivate: string[] = [];
  let matchedProducts = 0;
  let unchanged = 0;
  let missingInFeeds = 0;

  for (const product of dbProducts) {
    const externalId = product.externalId;
    if (!externalId) continue;

    if (!availabilityByExternalId.has(externalId)) {
      missingInFeeds++;
      if (deactivateMissing && product.isActive) {
        idsToDeactivate.push(product.id);
      } else {
        unchanged++;
      }
      continue;
    }

    matchedProducts++;
    const shouldBeActive = availabilityByExternalId.get(externalId) === true;

    if (shouldBeActive === product.isActive) {
      unchanged++;
      continue;
    }

    if (shouldBeActive) {
      idsToActivate.push(product.id);
    } else {
      idsToDeactivate.push(product.id);
    }
  }

  if (idsToActivate.length > 0) {
    await prisma.product.updateMany({
      where: { id: { in: idsToActivate } },
      data: { isActive: true },
    });
  }

  if (idsToDeactivate.length > 0) {
    await prisma.product.updateMany({
      where: { id: { in: idsToDeactivate } },
      data: { isActive: false },
    });
  }

  return {
    source,
    feedsProcessed: urls.length,
    productsSeenInFeeds,
    uniqueExternalIdsInFeeds: availabilityByExternalId.size,
    dbProductsChecked: dbProducts.length,
    matchedProducts,
    activated: idsToActivate.length,
    deactivated: idsToDeactivate.length,
    unchanged,
    missingInFeeds,
  };
}
