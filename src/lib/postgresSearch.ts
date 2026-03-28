import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

type ProductSearchSort =
  | 'newest'
  | 'price-low'
  | 'price-high'
  | 'popular'
  | 'rating'
  | 'featured-newest';

type ProductSearchRow = {
  id: string;
  total_count: bigint | number;
};

type AutocompleteRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  brand: string | null;
};

function normalizeQuery(query: string) {
  return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

function buildSortOrder(sort?: ProductSearchSort) {
  switch (sort) {
    case 'price-low':
      return Prisma.sql`p.price ASC, scored.score DESC, p."createdAt" DESC`;
    case 'price-high':
      return Prisma.sql`p.price DESC, scored.score DESC, p."createdAt" DESC`;
    case 'featured-newest':
      return Prisma.sql`p."isFeatured" DESC, p."createdAt" DESC, scored.score DESC`;
    case 'popular':
    case 'rating':
    case 'newest':
    default:
      return Prisma.sql`scored.score DESC, p."createdAt" DESC`;
  }
}

const productSearchVectorSql = Prisma.sql`
  (
    setweight(to_tsvector('simple', coalesce(p.name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(p.brand, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(p.tags, ' '), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(p.description, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(category_data.category_text, '')), 'C')
  )
`;

export async function searchProductIdsFromDatabase(options: {
  query: string;
  from?: number;
  size?: number;
  sort?: ProductSearchSort;
}) {
  const normalizedQuery = normalizeQuery(options.query);
  if (!normalizedQuery) {
    return null;
  }

  const from = Math.max(options.from || 0, 0);
  const size = Math.max(options.size || 12, 0);
  const sortOrder = buildSortOrder(options.sort);
  const trigramThreshold = 0.12;

  const rows = await prisma.$queryRaw<ProductSearchRow[]>(Prisma.sql`
    WITH category_data AS (
      SELECT
        pc."productId",
        string_agg(lower(c.name), ' ' ORDER BY c.name) AS category_text
      FROM "ProductCategory" pc
      INNER JOIN "Category" c ON c.id = pc."categoryId"
      GROUP BY pc."productId"
    ),
    scored AS (
      SELECT
        p.id,
        (
          (ts_rank_cd(${productSearchVectorSql}, websearch_to_tsquery('simple', ${normalizedQuery})) * 10) +
          CASE WHEN lower(p.name) = ${normalizedQuery} THEN 8 ELSE 0 END +
          CASE WHEN lower(p.name) LIKE ${`${normalizedQuery}%`} THEN 5 ELSE 0 END +
          GREATEST(similarity(lower(p.name), ${normalizedQuery}), similarity(lower(coalesce(p.brand, '')), ${normalizedQuery})) * 3
        ) AS score
      FROM "Product" p
      LEFT JOIN category_data ON category_data."productId" = p.id
      WHERE p."isActive" = true
        AND (
          ${productSearchVectorSql} @@ websearch_to_tsquery('simple', ${normalizedQuery})
          OR lower(p.name) % ${normalizedQuery}
          OR lower(coalesce(p.brand, '')) % ${normalizedQuery}
          OR lower(coalesce(category_data.category_text, '')) % ${normalizedQuery}
          OR EXISTS (
            SELECT 1
            FROM unnest(p.tags) AS tag
            WHERE lower(tag) % ${normalizedQuery}
               OR lower(tag) LIKE ${`${normalizedQuery}%`}
          )
          OR similarity(lower(p.name), ${normalizedQuery}) >= ${trigramThreshold}
        )
    ),
    ranked AS (
      SELECT
        scored.id,
        count(*) OVER () AS total_count
      FROM scored
      INNER JOIN "Product" p ON p.id = scored.id
      ORDER BY ${sortOrder}
      OFFSET ${from}
      LIMIT ${size}
    )
    SELECT id, total_count
    FROM ranked
  `);

  return {
    productIds: rows.map((row) => row.id),
    total: rows.length > 0 ? Number(rows[0].total_count) : 0,
  };
}

export async function searchProductsForAutocomplete(query: string, limit: number) {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    return [];
  }

  const safeLimit = Math.max(Math.min(limit, 8), 1);
  const trigramThreshold = 0.08;

  return prisma.$queryRaw<AutocompleteRow[]>(Prisma.sql`
    WITH ranked AS (
      SELECT
        p.id,
        p.name,
        p.slug,
        p.price,
        p.images,
        p.brand,
        (
          CASE WHEN lower(p.name) = ${normalizedQuery} THEN 100 ELSE 0 END +
          CASE WHEN lower(p.name) LIKE ${`${normalizedQuery}%`} THEN 40 ELSE 0 END +
          CASE WHEN lower(coalesce(p.brand, '')) LIKE ${`${normalizedQuery}%`} THEN 15 ELSE 0 END +
          (similarity(lower(p.name), ${normalizedQuery}) * 20) +
          (similarity(lower(coalesce(p.brand, '')), ${normalizedQuery}) * 8) +
          (
            ts_rank_cd(
              setweight(to_tsvector('simple', coalesce(p.name, '')), 'A') ||
              setweight(to_tsvector('simple', coalesce(p.brand, '')), 'B') ||
              setweight(to_tsvector('simple', coalesce(array_to_string(p.tags, ' '), '')), 'B') ||
              setweight(to_tsvector('simple', coalesce(p.description, '')), 'C'),
              plainto_tsquery('simple', ${normalizedQuery})
            ) * 10
          )
        ) AS score
      FROM "Product" p
      WHERE p."isActive" = true
        AND (
          lower(p.name) LIKE ${`${normalizedQuery}%`}
          OR lower(coalesce(p.brand, '')) LIKE ${`${normalizedQuery}%`}
          OR similarity(lower(p.name), ${normalizedQuery}) >= ${trigramThreshold}
          OR similarity(lower(coalesce(p.brand, '')), ${normalizedQuery}) >= ${trigramThreshold}
          OR (
            setweight(to_tsvector('simple', coalesce(p.name, '')), 'A') ||
            setweight(to_tsvector('simple', coalesce(p.brand, '')), 'B') ||
            setweight(to_tsvector('simple', coalesce(array_to_string(p.tags, ' '), '')), 'B') ||
            setweight(to_tsvector('simple', coalesce(p.description, '')), 'C')
          ) @@ plainto_tsquery('simple', ${normalizedQuery})
        )
    )
    SELECT id, name, slug, price, images, brand
    FROM ranked
    ORDER BY score DESC, name ASC
    LIMIT ${safeLimit}
  `);
}
