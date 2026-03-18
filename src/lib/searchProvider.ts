export type SearchProvider = 'database' | 'elasticsearch' | 'meilisearch';

export function getSearchProvider(): SearchProvider {
  const configured = (process.env.SEARCH_PROVIDER || '').trim().toLowerCase();

  if (configured === 'database' || configured === 'db') {
    return 'database';
  }

  if (configured === 'meilisearch' || configured === 'meili') {
    return 'meilisearch';
  }

  if (configured === 'elasticsearch' || configured === 'es') {
    return 'elasticsearch';
  }

  if (process.env.MEILISEARCH_URL) {
    return 'meilisearch';
  }

  if (process.env.ELASTICSEARCH_URL) {
    return 'elasticsearch';
  }

  return 'database';
}

export function getExternalSearchProvider(): Exclude<SearchProvider, 'database'> | null {
  const provider = getSearchProvider();
  return provider === 'database' ? null : provider;
}
