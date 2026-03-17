const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL;
const ELASTICSEARCH_INDEX = process.env.ELASTICSEARCH_INDEX || 'products';
const ELASTICSEARCH_API_KEY = process.env.ELASTICSEARCH_API_KEY;
const ELASTICSEARCH_USERNAME = process.env.ELASTICSEARCH_USERNAME;
const ELASTICSEARCH_PASSWORD = process.env.ELASTICSEARCH_PASSWORD;
const SEARCH_PROVIDER = (process.env.SEARCH_PROVIDER || '').trim().toLowerCase();

function buildHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
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

export function isElasticsearchEnabled() {
  if (SEARCH_PROVIDER === 'database' || SEARCH_PROVIDER === 'db') {
    return false;
  }
  if (SEARCH_PROVIDER === 'elasticsearch' || SEARCH_PROVIDER === 'es') {
    return Boolean(ELASTICSEARCH_URL);
  }
  return Boolean(ELASTICSEARCH_URL);
}

type ElasticsearchProductHitSource = {
  id?: string;
  productId?: string;
};

type ElasticsearchResponse = {
  hits: {
    total: {
      value: number;
    };
    hits: Array<{
      _id: string;
      _source?: ElasticsearchProductHitSource;
    }>;
  };
  aggregations?: {
    brands?: {
      buckets: Array<{ key: string; doc_count: number }>;
    };
    categories?: {
      buckets: Array<{ key: string; doc_count: number }>;
    };
    price_stats?: {
      min: number | null;
      max: number | null;
    };
  };
};

export async function searchProductIdsFromElasticsearch(options: {
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
  if (!ELASTICSEARCH_URL) {
    return null;
  }

  const from = options.from || 0;
  const size = options.size || 12;
  const query = options.query?.trim() || '';
  const filters = options.filters || {};
  const includeFacets = options.includeFacets !== false;
  const boolFilters: Array<Record<string, unknown>> = [
    {
      term: {
        isActive: true,
      },
    },
  ];

  if (filters.brands && filters.brands.length > 0) {
    boolFilters.push({
      terms: {
        'brand.keyword': filters.brands,
      },
    });
  }

  const categoryNames = filters.categories || [];
  const categoryIds = filters.categoryIds || [];
  const categorySlugs = filters.categorySlugs || [];
  if (categoryNames.length > 0 || categoryIds.length > 0 || categorySlugs.length > 0) {
    const categoryShouldClauses: Array<Record<string, unknown>> = [];
    if (categoryNames.length > 0) {
      categoryShouldClauses.push({
        terms: {
          'categoryNames.keyword': categoryNames,
        },
      });
    }
    if (categoryIds.length > 0) {
      categoryShouldClauses.push({
        terms: {
          categoryIds,
        },
      });
    }
    if (categorySlugs.length > 0) {
      categoryShouldClauses.push({
        terms: {
          'categorySlugs.keyword': categorySlugs,
        },
      });
    }

    boolFilters.push({
      bool: {
        should: categoryShouldClauses,
        minimum_should_match: 1,
      },
    });
  }

  if (typeof filters.isDigital === 'boolean') {
    boolFilters.push({
      term: {
        isDigital: filters.isDigital,
      },
    });
  }

  if (typeof filters.isFeatured === 'boolean') {
    boolFilters.push({
      term: {
        isFeatured: filters.isFeatured,
      },
    });
  }

  if (typeof filters.minPrice === 'number' || typeof filters.maxPrice === 'number') {
    const range: { gte?: number; lte?: number } = {};
    if (typeof filters.minPrice === 'number') {
      range.gte = filters.minPrice;
    }
    if (typeof filters.maxPrice === 'number') {
      range.lte = filters.maxPrice;
    }
    boolFilters.push({
      range: {
        price: range,
      },
    });
  }

  if (filters.tag) {
    boolFilters.push({
      term: {
        'tags.keyword': filters.tag,
      },
    });
  }
  if (filters.tags && filters.tags.length > 0) {
    boolFilters.push({
      terms: {
        'tags.keyword': filters.tags,
      },
    });
  }

  const sort =
    options.sort === 'price-low'
      ? [{ price: { order: 'asc' } }]
      : options.sort === 'price-high'
      ? [{ price: { order: 'desc' } }]
      : options.sort === 'featured-newest'
      ? [{ isFeatured: { order: 'desc' } }, { createdAt: { order: 'desc' } }]
      : options.sort === 'newest' || options.sort === 'popular' || options.sort === 'rating'
      ? [{ createdAt: { order: 'desc' } }]
      : query
      ? [{ _score: { order: 'desc' } }]
      : [{ createdAt: { order: 'desc' } }];

  const body: Record<string, unknown> = {
    from,
    size,
    query: {
      bool: {
        ...(query
          ? {
              must: [
                {
                  multi_match: {
                    query,
                    fields: [
                      'name^5',
                      'description^2',
                      'brand^2',
                      'tags^3',
                      'categoryNames^2',
                    ],
                    fuzziness: 'AUTO',
                    operator: 'and',
                  },
                },
              ],
            }
          : {
              must: [
                {
                  match_all: {},
                },
              ],
            }),
        filter: boolFilters,
      },
    },
    sort,
  };

  if (includeFacets) {
    body.aggs = {
      brands: {
        terms: {
          field: 'brand.keyword',
          size: 50,
        },
      },
      categories: {
        terms: {
          field: 'categoryIds',
          size: 50,
        },
      },
      price_stats: {
        stats: {
          field: 'price',
        },
      },
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);

  const response = await fetch(`${ELASTICSEARCH_URL.replace(/\/$/, '')}/${ELASTICSEARCH_INDEX}/_search`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body),
    cache: 'no-store',
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(timeout);
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Elasticsearch search failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as ElasticsearchResponse;
  const productIds = data.hits.hits
    .map((hit) => hit._source?.id || hit._source?.productId || hit._id)
    .filter((id): id is string => Boolean(id));
  const facets = {
    brands: (data.aggregations?.brands?.buckets || []).map((bucket) => ({
      name: bucket.key,
      count: bucket.doc_count,
    })),
    categories: (data.aggregations?.categories?.buckets || []).map((bucket) => ({
      id: bucket.key,
      count: bucket.doc_count,
    })),
    priceRange: {
      min: data.aggregations?.price_stats?.min ?? 0,
      max: data.aggregations?.price_stats?.max ?? 0,
    },
  };

  return {
    productIds,
    total: data.hits.total.value,
    facets,
  };
}
