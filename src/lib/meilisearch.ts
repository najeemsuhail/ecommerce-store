import { getSearchProvider } from './searchProvider';

const MEILISEARCH_URL = process.env.MEILISEARCH_URL;
const MEILISEARCH_INDEX = process.env.MEILISEARCH_INDEX || 'products';
const MEILISEARCH_MASTER_KEY =
  process.env.MEILISEARCH_MASTER_KEY || process.env.MEILISEARCH_API_KEY;
const MEILISEARCH_SEARCH_KEY = process.env.MEILISEARCH_SEARCH_KEY || MEILISEARCH_MASTER_KEY;

type MeilisearchResponse = {
  hits?: Array<{ id?: string; productId?: string }>;
  estimatedTotalHits?: number;
  totalHits?: number;
  facetDistribution?: Record<string, Record<string, number>>;
  facetStats?: {
    price?: {
      min?: number;
      max?: number;
    };
  };
};

function buildHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (MEILISEARCH_SEARCH_KEY) {
    headers.Authorization = `Bearer ${MEILISEARCH_SEARCH_KEY}`;
  }

  return headers;
}

function quote(value: string) {
  return JSON.stringify(value);
}

function inFilter(field: string, values: string[]) {
  if (values.length === 0) {
    return null;
  }

  return `${field} IN [${values.map((value) => quote(value)).join(', ')}]`;
}

export function isMeilisearchEnabled() {
  return getSearchProvider() === 'meilisearch' && Boolean(MEILISEARCH_URL);
}

export async function searchProductIdsFromMeilisearch(options: {
  query?: string;
  from?: number;
  size?: number;
  sort?: 'newest' | 'price-low' | 'price-high' | 'popular' | 'rating' | 'featured-newest';
  includeFacets?: boolean;
  filters?: {
    brands?: string[];
    categories?: string[];
    categoryIds?: string[];
    categorySlugs?: string[];
    isDigital?: boolean;
    isFeatured?: boolean;
    minPrice?: number;
    maxPrice?: number;
    tag?: string;
    tags?: string[];
  };
}) {
  if (!MEILISEARCH_URL || !isMeilisearchEnabled()) {
    return null;
  }

  const filters = options.filters || {};
  const filterClauses: string[] = ['isActive = true'];
  const categoryClauses = [
    inFilter('categoryNames', filters.categories || []),
    inFilter('categoryIds', filters.categoryIds || []),
    inFilter('categorySlugs', filters.categorySlugs || []),
  ].filter((value): value is string => Boolean(value));

  if (filters.brands?.length) {
    filterClauses.push(inFilter('brand', filters.brands) as string);
  }

  if (categoryClauses.length > 0) {
    filterClauses.push(`(${categoryClauses.join(' OR ')})`);
  }

  if (typeof filters.isDigital === 'boolean') {
    filterClauses.push(`isDigital = ${filters.isDigital}`);
  }

  if (typeof filters.isFeatured === 'boolean') {
    filterClauses.push(`isFeatured = ${filters.isFeatured}`);
  }

  if (typeof filters.minPrice === 'number') {
    filterClauses.push(`price >= ${filters.minPrice}`);
  }

  if (typeof filters.maxPrice === 'number') {
    filterClauses.push(`price <= ${filters.maxPrice}`);
  }

  if (filters.tag) {
    filterClauses.push(`tags = ${quote(filters.tag)}`);
  }

  if (filters.tags?.length) {
    filterClauses.push(inFilter('tags', filters.tags) as string);
  }

  const sort =
    options.sort === 'price-low'
      ? ['price:asc']
      : options.sort === 'price-high'
      ? ['price:desc']
      : options.sort === 'featured-newest'
      ? ['isFeatured:desc', 'createdAt:desc']
      : options.sort === 'newest' || options.sort === 'popular' || options.sort === 'rating'
      ? ['createdAt:desc']
      : undefined;

  const response = await fetch(
    `${MEILISEARCH_URL.replace(/\/$/, '')}/indexes/${MEILISEARCH_INDEX}/search`,
    {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({
        q: options.query?.trim() || '',
        offset: options.from || 0,
        limit: options.size || 12,
        filter: filterClauses,
        sort,
        facets: options.includeFacets === false ? [] : ['brand', 'categoryIds', 'price'],
      }),
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Meilisearch search failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as MeilisearchResponse;
  const productIds = (data.hits || [])
    .map((hit) => hit.id || hit.productId)
    .filter((id): id is string => Boolean(id));

  const facets = {
    brands: Object.entries(data.facetDistribution?.brand || {}).map(([name, count]) => ({
      name,
      count,
    })),
    categories: Object.entries(data.facetDistribution?.categoryIds || {}).map(([id, count]) => ({
      id,
      count,
    })),
    priceRange: {
      min: data.facetStats?.price?.min ?? 0,
      max: data.facetStats?.price?.max ?? 0,
    },
  };

  return {
    productIds,
    total: data.estimatedTotalHits ?? data.totalHits ?? productIds.length,
    facets,
  };
}
