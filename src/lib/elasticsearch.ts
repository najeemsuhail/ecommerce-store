const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL;
const ELASTICSEARCH_INDEX = process.env.ELASTICSEARCH_INDEX || 'products';
const ELASTICSEARCH_API_KEY = process.env.ELASTICSEARCH_API_KEY;
const ELASTICSEARCH_USERNAME = process.env.ELASTICSEARCH_USERNAME;
const ELASTICSEARCH_PASSWORD = process.env.ELASTICSEARCH_PASSWORD;

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
};

export async function searchProductIdsFromElasticsearch(options: {
  query: string;
  from?: number;
  size?: number;
}) {
  if (!ELASTICSEARCH_URL) {
    return null;
  }

  const from = options.from || 0;
  const size = options.size || 12;

  const body = {
    from,
    size,
    query: {
      bool: {
        must: [
          {
            multi_match: {
              query: options.query,
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
        filter: [
          {
            term: {
              isActive: true,
            },
          },
        ],
      },
    },
  };

  const response = await fetch(
    `${ELASTICSEARCH_URL.replace(/\/$/, '')}/${ELASTICSEARCH_INDEX}/_search`,
    {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(body),
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Elasticsearch search failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as ElasticsearchResponse;
  const productIds = data.hits.hits
    .map((hit) => hit._source?.id || hit._source?.productId || hit._id)
    .filter((id): id is string => Boolean(id));

  return {
    productIds,
    total: data.hits.total.value,
  };
}
