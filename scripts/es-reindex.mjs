import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL;
const ELASTICSEARCH_INDEX = process.env.ELASTICSEARCH_INDEX || 'products';
const ELASTICSEARCH_API_KEY = process.env.ELASTICSEARCH_API_KEY;
const ELASTICSEARCH_USERNAME = process.env.ELASTICSEARCH_USERNAME;
const ELASTICSEARCH_PASSWORD = process.env.ELASTICSEARCH_PASSWORD;
const BATCH_SIZE = 200;

const PRODUCT_INDEX_MAPPING = {
  properties: {
    id: { type: 'keyword' },
    productId: { type: 'keyword' },
    name: { type: 'text' },
    description: { type: 'text' },
    brand: {
      type: 'text',
      fields: {
        keyword: { type: 'keyword' },
      },
    },
    tags: { type: 'keyword' },
    categoryNames: {
      type: 'text',
      fields: {
        keyword: { type: 'keyword' },
      },
    },
    isActive: { type: 'boolean' },
    isDigital: { type: 'boolean' },
    isFeatured: { type: 'boolean' },
    price: { type: 'float' },
    createdAt: { type: 'date' },
  },
};

function buildHeaders(contentType) {
  const headers = {
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
  if (!ELASTICSEARCH_URL) {
    throw new Error('ELASTICSEARCH_URL is required');
  }
  return ELASTICSEARCH_URL.replace(/\/$/, '');
}

async function ensureIndex() {
  const baseUrl = getBaseUrl();
  const indexUrl = `${baseUrl}/${ELASTICSEARCH_INDEX}`;

  async function createIndex() {
    const createResponse = await fetch(indexUrl, {
      method: 'PUT',
      headers: buildHeaders('application/json'),
      body: JSON.stringify({
        mappings: PRODUCT_INDEX_MAPPING,
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(
        `Failed creating index "${ELASTICSEARCH_INDEX}": ${createResponse.status} ${errorText}`
      );
    }
  }

  const existsResponse = await fetch(indexUrl, {
    method: 'HEAD',
    headers: buildHeaders('application/json'),
  });

  if (existsResponse.ok) {
    const mappingResponse = await fetch(`${indexUrl}/_mapping`, {
      method: 'PUT',
      headers: buildHeaders('application/json'),
      body: JSON.stringify(PRODUCT_INDEX_MAPPING),
    });

    if (!mappingResponse.ok) {
      const errorText = await mappingResponse.text();
      const isImmutableTypeConflict =
        mappingResponse.status === 400 &&
        errorText.includes('cannot be changed from type');

      if (!isImmutableTypeConflict) {
        throw new Error(
          `Failed updating index mapping for "${ELASTICSEARCH_INDEX}": ${mappingResponse.status} ${errorText}`
        );
      }

      // Elasticsearch field types are immutable; recreate index with the correct mapping.
      console.log(
        `Mapping conflict detected for "${ELASTICSEARCH_INDEX}". Recreating index with latest mapping...`
      );

      const deleteResponse = await fetch(indexUrl, {
        method: 'DELETE',
        headers: buildHeaders('application/json'),
      });

      if (!deleteResponse.ok) {
        const deleteErrorText = await deleteResponse.text();
        throw new Error(
          `Failed deleting conflicted index "${ELASTICSEARCH_INDEX}": ${deleteResponse.status} ${deleteErrorText}`
        );
      }

      await createIndex();
    }
    return;
  }

  if (existsResponse.status !== 404) {
    const errorText = await existsResponse.text();
    throw new Error(
      `Failed checking index existence: ${existsResponse.status} ${errorText}`
    );
  }

  await createIndex();
}

async function indexBatch(skip) {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' },
    skip,
    take: BATCH_SIZE,
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
          category: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (products.length === 0) {
    return 0;
  }

  const baseUrl = getBaseUrl();
  const bulkUrl = `${baseUrl}/${ELASTICSEARCH_INDEX}/_bulk`;
  const lines = [];

  for (const product of products) {
    lines.push(
      JSON.stringify({
        index: {
          _id: product.id,
        },
      })
    );

    lines.push(
      JSON.stringify({
        id: product.id,
        productId: product.id,
        name: product.name,
        description: product.description,
        brand: product.brand,
        tags: product.tags,
        categoryNames: product.categories.map((entry) => entry.category.name),
        isActive: product.isActive,
        isDigital: product.isDigital,
        isFeatured: product.isFeatured,
        price: product.price,
        createdAt: product.createdAt.toISOString(),
      })
    );
  }

  const bulkResponse = await fetch(bulkUrl, {
    method: 'POST',
    headers: buildHeaders('application/x-ndjson'),
    body: `${lines.join('\n')}\n`,
  });

  if (!bulkResponse.ok) {
    const errorText = await bulkResponse.text();
    throw new Error(
      `Bulk indexing failed: ${bulkResponse.status} ${errorText}`
    );
  }

  const bulkResult = await bulkResponse.json();

  if (bulkResult.errors) {
    const firstError = bulkResult.items?.find(
      (item) => item.index?.status && item.index.status >= 300
    );
    throw new Error(
      `Bulk indexing reported item errors: ${JSON.stringify(firstError)}`
    );
  }

  return products.length;
}

async function refreshIndex() {
  const baseUrl = getBaseUrl();
  const refreshResponse = await fetch(
    `${baseUrl}/${ELASTICSEARCH_INDEX}/_refresh`,
    {
      method: 'POST',
      headers: buildHeaders('application/json'),
    }
  );

  if (!refreshResponse.ok) {
    const errorText = await refreshResponse.text();
    throw new Error(`Index refresh failed: ${refreshResponse.status} ${errorText}`);
  }
}

async function run() {
  console.log(`Starting Elasticsearch reindex for "${ELASTICSEARCH_INDEX}"...`);

  await ensureIndex();

  let indexed = 0;
  let skip = 0;

  while (true) {
    const count = await indexBatch(skip);
    if (count === 0) {
      break;
    }
    indexed += count;
    skip += count;
    console.log(`Indexed ${indexed} products...`);
  }

  await refreshIndex();

  console.log(`Reindex complete. Indexed ${indexed} products.`);
}

run()
  .catch((error) => {
    console.error('Elasticsearch reindex failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
