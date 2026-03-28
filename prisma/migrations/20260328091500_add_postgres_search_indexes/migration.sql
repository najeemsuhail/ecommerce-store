CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION public.product_search_document(
  product_name text,
  product_brand text,
  product_tags text[],
  product_description text
)
RETURNS tsvector
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    setweight(to_tsvector('simple'::regconfig, COALESCE(product_name, '')), 'A') ||
    setweight(to_tsvector('simple'::regconfig, COALESCE(product_brand, '')), 'B') ||
    setweight(to_tsvector('simple'::regconfig, COALESCE(array_to_string(product_tags, ' '), '')), 'B') ||
    setweight(to_tsvector('simple'::regconfig, COALESCE(product_description, '')), 'C')
$$;

CREATE INDEX IF NOT EXISTS "Product_search_document_idx"
ON "Product"
USING GIN (
  public.product_search_document(name, brand, tags, description)
);

CREATE INDEX IF NOT EXISTS "Product_name_trgm_idx"
ON "Product"
USING GIN (LOWER(name) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Product_brand_trgm_idx"
ON "Product"
USING GIN (LOWER(COALESCE(brand, '')) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Product_tags_gin_idx"
ON "Product"
USING GIN (tags);

CREATE INDEX IF NOT EXISTS "Product_active_createdAt_idx"
ON "Product" ("isActive", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "Product_active_price_idx"
ON "Product" ("isActive", price);

CREATE INDEX IF NOT EXISTS "Product_active_brand_idx"
ON "Product" ("isActive", brand);
