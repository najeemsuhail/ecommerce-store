import prisma from '@/lib/prisma';
import { getSearchProvider } from './searchProvider';

const MEILISEARCH_URL = process.env.MEILISEARCH_URL;
const MEILISEARCH_INDEX = process.env.MEILISEARCH_INDEX || 'products';
const MEILISEARCH_MASTER_KEY =
  process.env.MEILISEARCH_MASTER_KEY || process.env.MEILISEARCH_API_KEY;

type TaskResponse = {
  taskUid?: number;
};

type MeilisearchProductSource = {
  id: string;
  productId: string;
  name: string;
  description: string;
  brand: string | null;
  tags: string[];
  categoryIds: string[];
  categorySlugs: string[];
  categoryNames: string[];
  isActive: boolean;
  isDigital: boolean;
  isFeatured: boolean;
  price: number;
  createdAt: string;
};

function isSyncEnabled() {
  return getSearchProvider() === 'meilisearch' && Boolean(MEILISEARCH_URL);
}

function buildHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (MEILISEARCH_MASTER_KEY) {
    headers.Authorization = `Bearer ${MEILISEARCH_MASTER_KEY}`;
  }

  return headers;
}

function getBaseUrl() {
  return MEILISEARCH_URL?.replace(/\/$/, '') || '';
}

async function ensureIndex() {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return;
  }

  const indexUrl = `${baseUrl}/indexes/${MEILISEARCH_INDEX}`;
  const existsResponse = await fetch(indexUrl, {
    method: 'GET',
    headers: buildHeaders(),
    cache: 'no-store',
  });

  if (existsResponse.status === 404) {
    await fetch(`${baseUrl}/indexes`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({
        uid: MEILISEARCH_INDEX,
        primaryKey: 'id',
      }),
      cache: 'no-store',
    });
  }

  await fetch(`${indexUrl}/settings`, {
    method: 'PATCH',
    headers: buildHeaders(),
    body: JSON.stringify({
      searchableAttributes: ['name', 'description', 'brand', 'tags', 'categoryNames'],
      filterableAttributes: [
        'brand',
        'categoryIds',
        'categorySlugs',
        'categoryNames',
        'isActive',
        'isDigital',
        'isFeatured',
        'price',
        'tags',
      ],
      sortableAttributes: ['createdAt', 'price', 'isFeatured'],
      rankingRules: [
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
      ],
    }),
    cache: 'no-store',
  });
}

async function getIndexableProducts(productIds: string[]) {
  const uniqueIds = Array.from(new Set(productIds.filter(Boolean)));
  if (uniqueIds.length === 0) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: uniqueIds,
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      brand: true,
      tags: true,
      isActive: true,
      isDigital: true,
      isFeatured: true,
      price: true,
      createdAt: true,
      categories: {
        select: {
          categoryId: true,
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  return products.map<MeilisearchProductSource>((product) => ({
    id: product.id,
    productId: product.id,
    name: product.name,
    description: product.description,
    brand: product.brand,
    tags: product.tags,
    categoryIds: product.categories.map((entry) => entry.categoryId),
    categorySlugs: product.categories.map((entry) => entry.category.slug),
    categoryNames: product.categories.map((entry) => entry.category.name),
    isActive: product.isActive,
    isDigital: product.isDigital,
    isFeatured: product.isFeatured,
    price: product.price,
    createdAt: product.createdAt.toISOString(),
  }));
}

async function enqueueDocuments(documents: MeilisearchProductSource[]) {
  const response = await fetch(
    `${getBaseUrl()}/indexes/${MEILISEARCH_INDEX}/documents?primaryKey=id`,
    {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(documents),
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Meilisearch document sync failed: ${response.status} ${errorText}`);
  }

  return (await response.json()) as TaskResponse;
}

export async function syncProductToMeilisearch(productId: string) {
  if (!isSyncEnabled()) {
    return;
  }

  try {
    await ensureIndex();
    const products = await getIndexableProducts([productId]);
    if (products.length === 0) {
      return;
    }

    await enqueueDocuments(products);
  } catch (error) {
    console.error('[Meilisearch sync] Failed to sync product', { productId, error });
  }
}

export async function syncProductsToMeilisearch(productIds: string[]) {
  if (!isSyncEnabled()) {
    return;
  }

  try {
    await ensureIndex();
    const products = await getIndexableProducts(productIds);
    if (products.length === 0) {
      return;
    }

    await enqueueDocuments(products);
  } catch (error) {
    console.error('[Meilisearch sync] Failed to sync products in bulk', {
      count: productIds.length,
      error,
    });
  }
}

export async function deleteProductFromMeilisearch(productId: string) {
  if (!isSyncEnabled()) {
    return;
  }

  try {
    const response = await fetch(
      `${getBaseUrl()}/indexes/${MEILISEARCH_INDEX}/documents/${productId}`,
      {
        method: 'DELETE',
        headers: buildHeaders(),
        cache: 'no-store',
      }
    );

    if (!response.ok && response.status !== 404) {
      const errorText = await response.text();
      throw new Error(`Meilisearch delete sync failed: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error('[Meilisearch sync] Failed to delete product', { productId, error });
  }
}

export async function deleteProductsFromMeilisearch(productIds: string[]) {
  if (!isSyncEnabled()) {
    return;
  }

  try {
    const uniqueIds = Array.from(new Set(productIds.filter(Boolean)));
    if (uniqueIds.length === 0) {
      return;
    }

    const response = await fetch(`${getBaseUrl()}/indexes/${MEILISEARCH_INDEX}/documents/delete-batch`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(uniqueIds),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Meilisearch bulk delete failed: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error('[Meilisearch sync] Failed to bulk delete products', {
      count: productIds.length,
      error,
    });
  }
}
