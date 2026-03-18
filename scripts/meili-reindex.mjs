import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MEILISEARCH_URL = process.env.MEILISEARCH_URL;
const MEILISEARCH_INDEX = process.env.MEILISEARCH_INDEX || 'products';
const MEILISEARCH_MASTER_KEY =
  process.env.MEILISEARCH_MASTER_KEY || process.env.MEILISEARCH_API_KEY;
const BATCH_SIZE = 200;

function buildHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (MEILISEARCH_MASTER_KEY) {
    headers.Authorization = `Bearer ${MEILISEARCH_MASTER_KEY}`;
  }

  return headers;
}

function getBaseUrl() {
  if (!MEILISEARCH_URL) {
    throw new Error('MEILISEARCH_URL is required');
  }

  return MEILISEARCH_URL.replace(/\/$/, '');
}

async function request(path, init = {}) {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...buildHeaders(),
      ...(init.headers || {}),
    },
  });

  return response;
}

async function ensureIndex() {
  const indexResponse = await request(`/indexes/${MEILISEARCH_INDEX}`, {
    method: 'GET',
  });

  if (indexResponse.status === 404) {
    const createResponse = await request('/indexes', {
      method: 'POST',
      body: JSON.stringify({
        uid: MEILISEARCH_INDEX,
        primaryKey: 'id',
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Failed creating Meilisearch index: ${createResponse.status} ${errorText}`);
    }
  } else if (!indexResponse.ok) {
    const errorText = await indexResponse.text();
    throw new Error(`Failed checking Meilisearch index: ${indexResponse.status} ${errorText}`);
  }

  const settingsResponse = await request(`/indexes/${MEILISEARCH_INDEX}/settings`, {
    method: 'PATCH',
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
      rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
    }),
  });

  if (!settingsResponse.ok) {
    const errorText = await settingsResponse.text();
    throw new Error(`Failed updating Meilisearch settings: ${settingsResponse.status} ${errorText}`);
  }
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
          categoryId: true,
          category: {
            select: { name: true, slug: true },
          },
        },
      },
    },
  });

  if (products.length === 0) {
    return 0;
  }

  const documents = products.map((product) => ({
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

  const response = await request(`/indexes/${MEILISEARCH_INDEX}/documents?primaryKey=id`, {
    method: 'POST',
    body: JSON.stringify(documents),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Meilisearch bulk indexing failed: ${response.status} ${errorText}`);
  }

  return products.length;
}

async function run() {
  console.log(`Starting Meilisearch reindex for "${MEILISEARCH_INDEX}"...`);

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

  console.log(`Reindex complete. Indexed ${indexed} products.`);
}

run()
  .catch((error) => {
    console.error('Meilisearch reindex failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
