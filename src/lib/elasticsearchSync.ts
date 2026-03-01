import prisma from '@/lib/prisma';

const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL;
const ELASTICSEARCH_INDEX = process.env.ELASTICSEARCH_INDEX || 'products';
const ELASTICSEARCH_API_KEY = process.env.ELASTICSEARCH_API_KEY;
const ELASTICSEARCH_USERNAME = process.env.ELASTICSEARCH_USERNAME;
const ELASTICSEARCH_PASSWORD = process.env.ELASTICSEARCH_PASSWORD;

type ElasticsearchProductSource = {
  id: string;
  productId: string;
  name: string;
  description: string;
  brand: string | null;
  tags: string[];
  categoryNames: string[];
  isActive: boolean;
  price: number;
};

function isSyncEnabled() {
  return Boolean(ELASTICSEARCH_URL);
}

function buildHeaders(contentType: string) {
  const headers: Record<string, string> = {
    'Content-Type': contentType,
  };

  if (ELASTICSEARCH_API_KEY) {
    headers.Authorization = `ApiKey ${ELASTICSEARCH_API_KEY}`;
  } else if (ELASTICSEARCH_USERNAME && ELASTICSEARCH_PASSWORD) {
    const credentials = Buffer.from(
      `${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}`
    ).toString('base64');
    headers.Authorization = `Basic ${credentials}`;
  }

  return headers;
}

function getBaseUrl() {
  return ELASTICSEARCH_URL?.replace(/\/$/, '') || '';
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
      price: true,
      categories: {
        select: {
          category: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return products.map<ElasticsearchProductSource>((product) => ({
    id: product.id,
    productId: product.id,
    name: product.name,
    description: product.description,
    brand: product.brand,
    tags: product.tags,
    categoryNames: product.categories.map((entry) => entry.category.name),
    isActive: product.isActive,
    price: product.price,
  }));
}

async function sendBulk(lines: string[]) {
  if (lines.length === 0) {
    return;
  }

  const response = await fetch(`${getBaseUrl()}/${ELASTICSEARCH_INDEX}/_bulk`, {
    method: 'POST',
    headers: buildHeaders('application/x-ndjson'),
    body: `${lines.join('\n')}\n`,
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Elasticsearch bulk sync failed: ${response.status} ${errorText}`
    );
  }

  const data = (await response.json()) as {
    errors?: boolean;
    items?: Array<{
      index?: { status?: number; error?: unknown };
      delete?: { status?: number; error?: unknown };
    }>;
  };

  if (data.errors) {
    const firstError = data.items?.find(
      (item) =>
        (item.index?.status && item.index.status >= 300) ||
        (item.delete?.status && item.delete.status >= 300)
    );
    throw new Error(`Elasticsearch bulk sync item error: ${JSON.stringify(firstError)}`);
  }
}

export async function syncProductToElasticsearch(productId: string) {
  if (!isSyncEnabled()) {
    return;
  }

  try {
    const products = await getIndexableProducts([productId]);
    if (products.length === 0) {
      return;
    }

    const product = products[0];
    const response = await fetch(
      `${getBaseUrl()}/${ELASTICSEARCH_INDEX}/_doc/${product.id}`,
      {
        method: 'PUT',
        headers: buildHeaders('application/json'),
        body: JSON.stringify(product),
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Elasticsearch index sync failed: ${response.status} ${errorText}`
      );
    }
  } catch (error) {
    console.error('[Elasticsearch sync] Failed to sync product', { productId, error });
  }
}

export async function syncProductsToElasticsearch(productIds: string[]) {
  if (!isSyncEnabled()) {
    return;
  }

  try {
    const products = await getIndexableProducts(productIds);
    if (products.length === 0) {
      return;
    }

    const lines: string[] = [];
    for (const product of products) {
      lines.push(JSON.stringify({ index: { _id: product.id } }));
      lines.push(JSON.stringify(product));
    }

    await sendBulk(lines);
  } catch (error) {
    console.error('[Elasticsearch sync] Failed to sync products in bulk', {
      count: productIds.length,
      error,
    });
  }
}

export async function deleteProductFromElasticsearch(productId: string) {
  if (!isSyncEnabled()) {
    return;
  }

  try {
    const response = await fetch(
      `${getBaseUrl()}/${ELASTICSEARCH_INDEX}/_doc/${productId}`,
      {
        method: 'DELETE',
        headers: buildHeaders('application/json'),
        cache: 'no-store',
      }
    );

    if (!response.ok && response.status !== 404) {
      const errorText = await response.text();
      throw new Error(
        `Elasticsearch delete sync failed: ${response.status} ${errorText}`
      );
    }
  } catch (error) {
    console.error('[Elasticsearch sync] Failed to delete product', { productId, error });
  }
}

export async function deleteProductsFromElasticsearch(productIds: string[]) {
  if (!isSyncEnabled()) {
    return;
  }

  try {
    const uniqueIds = Array.from(new Set(productIds.filter(Boolean)));
    if (uniqueIds.length === 0) {
      return;
    }

    const lines: string[] = [];
    for (const productId of uniqueIds) {
      lines.push(JSON.stringify({ delete: { _id: productId } }));
    }
    await sendBulk(lines);
  } catch (error) {
    console.error('[Elasticsearch sync] Failed to bulk delete products', {
      count: productIds.length,
      error,
    });
  }
}
