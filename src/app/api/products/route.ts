import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { isExternalSearchEnabled, searchProductIdsFromElasticsearch } from '@/lib/elasticsearch';
import { syncProductToElasticsearch } from '@/lib/elasticsearchSync';
import { getExternalSearchProvider } from '@/lib/searchProvider';

export const revalidate = 300; // ISR: Revalidate every 5 minutes (industry standard)

const productListSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  comparePrice: true,
  isDigital: true,
  stock: true,
  images: true,
  slug: true,
  isActive: true,
  isFeatured: true,
  brand: true,
  tags: true,
  weight: true,
  createdAt: true,
  categories: {
    select: {
      categoryId: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
} as const;

type ProductListRow = Prisma.ProductGetPayload<{
  select: typeof productListSelect;
}>;

type ApiFacets = {
  brands: Array<{ name: string; count: number }>;
  categories: Array<{ name: string; id: string; count: number }>;
  priceRange: { min: number; max: number };
};

type ElasticsearchFacets = {
  brands: Array<{ name: string; count: number }>;
  categories: Array<{ id: string; count: number }>;
  priceRange: { min: number; max: number };
};

function buildSearchOrConditions(search: string): Prisma.ProductWhereInput[] {
  return [
    { name: { contains: search, mode: 'insensitive' as const } },
    { description: { contains: search, mode: 'insensitive' as const } },
    { brand: { contains: search, mode: 'insensitive' as const } },
    { tags: { has: search } },
    {
      categories: {
        some: {
          category: {
            name: { contains: search, mode: 'insensitive' as const },
          },
        },
      },
    },
  ];
}

async function normalizeElasticsearchFacets(
  facets: ElasticsearchFacets | null | undefined
): Promise<ApiFacets | null> {
  if (!facets) {
    return null;
  }

  const categoryIds = facets.categories.map((category) => category.id);
  const categoriesById = new Map<string, { id: string; name: string }>();
  if (categoryIds.length > 0) {
    const categoryRows = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
      },
      select: {
        id: true,
        name: true,
      },
    });
    for (const category of categoryRows) {
      categoriesById.set(category.id, { id: category.id, name: category.name });
    }
  }

  return {
    brands: facets.brands,
    categories: facets.categories.map((category) => ({
      name: categoriesById.get(category.id)?.name || category.id,
      id: category.id,
      count: category.count,
    })),
    priceRange: {
      min: facets.priceRange.min ?? 0,
      max: facets.priceRange.max ?? 0,
    },
  };
}

function buildFacetsFromProducts(products: ProductListRow[]): ApiFacets {
  const brands = new Map<string, number>();
  const categories = new Map<string, { id: string; count: number }>();
  let minPrice = Number.MAX_VALUE;
  let maxPrice = 0;

  for (const product of products) {
    if (product.brand) {
      brands.set(product.brand, (brands.get(product.brand) || 0) + 1);
    }

    for (const productCategory of product.categories || []) {
      const categoryName = productCategory.category?.name || productCategory.categoryId;
      const categoryId = productCategory.category?.id || productCategory.categoryId;
      const existing = categories.get(categoryName);
      if (existing) {
        existing.count += 1;
      } else {
        categories.set(categoryName, { id: categoryId, count: 1 });
      }
    }

    if (typeof product.price === 'number') {
      minPrice = Math.min(minPrice, product.price);
      maxPrice = Math.max(maxPrice, product.price);
    }
  }

  return {
    brands: Array.from(brands.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    categories: Array.from(categories.entries())
      .map(([name, value]) => ({ name, id: value.id, count: value.count }))
      .sort((a, b) => b.count - a.count),
    priceRange: {
      min: minPrice === Number.MAX_VALUE ? 0 : minPrice,
      max: maxPrice,
    },
  };
}

async function buildDatabaseFacets(where: Prisma.ProductWhereInput): Promise<ApiFacets> {
  const [brandGroups, priceAggregate, categoryGroups] = await Promise.all([
    prisma.product.groupBy({
      by: ['brand'],
      where: {
        ...where,
        brand: { not: null },
      },
      _count: { brand: true },
    }),
    prisma.product.aggregate({
      where,
      _min: { price: true },
      _max: { price: true },
    }),
    prisma.productCategory.groupBy({
      by: ['categoryId'],
      where: {
        product: where,
      },
      _count: { categoryId: true },
    }),
  ]);

  const categoryIds = categoryGroups.map((group) => group.categoryId);
  const categoryRows =
    categoryIds.length > 0
      ? await prisma.category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true },
        })
      : [];
  const categoryMap = new Map(categoryRows.map((category) => [category.id, category.name]));

  return {
    brands: brandGroups
      .filter((group) => Boolean(group.brand))
      .map((group) => ({ name: group.brand as string, count: group._count.brand }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    categories: categoryGroups
      .map((group) => ({
        id: group.categoryId,
        name: categoryMap.get(group.categoryId) || group.categoryId,
        count: group._count.categoryId,
      }))
      .sort((a, b) => b.count - a.count),
    priceRange: {
      min: priceAggregate._min.price ?? 0,
      max: priceAggregate._max.price ?? 0,
    },
  };
}

// GET all products (with search and filter)
export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  let searchSource: 'elasticsearch' | 'meilisearch' | 'database' = 'database';

  const buildResponseHeaders = () => ({
    'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=120',
    'X-Search-Source': searchSource,
    'X-Response-Time-ms': String(Date.now() - startedAt),
  });

  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const categories = searchParams.getAll('category'); // Get all category values
    const brands = searchParams.getAll('brand'); // Get all brand values
    const isDigital = searchParams.get('isDigital');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const tag = searchParams.get('tag');
    const isFeatured = searchParams.get('isFeatured');
    const includeFacetsRequested = searchParams.get('includeFacets') === 'true';
    const facetsOnlyRequested = searchParams.get('facetsOnly') === 'true';
    const sort = searchParams.get('sort') || 'newest';
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    // Get attribute filters - they come as pairs: attribute=attrId&value=val&attribute=attrId&value=val
    const attributeFilters = new Map<string, string[]>();
    const attributeParams = searchParams.getAll('attribute');
    const valueParams = searchParams.getAll('value');
    
    // Pair them up
    for (let i = 0; i < attributeParams.length; i++) {
      const attrId = attributeParams[i];
      const value = valueParams[i];
      if (!attributeFilters.has(attrId)) {
        attributeFilters.set(attrId, []);
      }
      attributeFilters.get(attrId)!.push(value);
    }

    const parsedMinPrice = minPrice ? parseFloat(minPrice) : undefined;
    const parsedMaxPrice = maxPrice ? parseFloat(maxPrice) : undefined;
    const parsedIsDigital =
      isDigital === 'true' ? true : isDigital === 'false' ? false : undefined;
    const parsedIsFeatured = isFeatured === 'true' ? true : undefined;

    const hasNonSearchFilters =
      categories.length > 0 ||
      brands.length > 0 ||
      Boolean(isDigital) ||
      Boolean(minPrice) ||
      Boolean(maxPrice) ||
      Boolean(tag) ||
      Boolean(isFeatured) ||
      attributeFilters.size > 0;

    const hasSearch = Boolean(search);
    const shouldIncludeFacets = includeFacetsRequested || facetsOnlyRequested;
    const shouldTryElasticsearch = isExternalSearchEnabled() && attributeFilters.size === 0;

    let elasticsearchResult: {
      productIds: string[];
      total: number;
      facets?: ElasticsearchFacets;
    } | null = null;
    let responseFacets: ApiFacets | null = null;

    if (shouldTryElasticsearch) {
      // Keep wide windows only for heavy search+filter use-cases.
      const elasticFrom = hasNonSearchFilters && hasSearch ? 0 : skip;
      const elasticSize = facetsOnlyRequested ? 0 : hasNonSearchFilters && hasSearch ? 10000 : limit;
      try {
        elasticsearchResult = await searchProductIdsFromElasticsearch({
          query: search || undefined,
          from: elasticFrom,
          size: elasticSize,
          sort: sort as 'newest' | 'price-low' | 'price-high' | 'popular' | 'rating',
          includeFacets: shouldIncludeFacets,
          filters: {
            brands: brands.length > 0 ? brands : undefined,
            categories: categories.length > 0 ? categories : undefined,
            categoryIds: categories.length > 0 ? categories : undefined,
            categorySlugs: categories.length > 0 ? categories : undefined,
            isDigital: parsedIsDigital,
            isFeatured: parsedIsFeatured,
            minPrice: parsedMinPrice,
            maxPrice: parsedMaxPrice,
            tag: tag || undefined,
          },
        });
        if (elasticsearchResult) {
          searchSource = getExternalSearchProvider() || 'database';
          if (shouldIncludeFacets) {
            responseFacets = await normalizeElasticsearchFacets(elasticsearchResult.facets);
          }
        }
      } catch (error) {
        console.error('Elasticsearch product search failed, falling back to database search:', error);
      }
    }

    // Build facet-only filter object (used independently from text search).
    const facetWhere: Prisma.ProductWhereInput = { isActive: true };

    if (categories.length > 0) {
      facetWhere.categories = {
        some: {
          category: {
            OR: [
              { id: { in: categories } },
              { name: { in: categories } },
              { slug: { in: categories } },
            ],
          },
        },
      };
    }

    if (attributeFilters.size > 0) {
      const attributeConditions: Prisma.ProductWhereInput[] = Array.from(attributeFilters.entries()).map(
        ([attrId, values]) => ({
          attributes: {
            some: {
              attributeId: attrId,
              value: {
                in: values,
              },
            },
          },
        })
      );
      facetWhere.AND = attributeConditions;
    }

    if (brands.length > 0) {
      facetWhere.brand = {
        in: brands,
      };
    }

    if (isDigital === 'true') {
      facetWhere.isDigital = true;
    } else if (isDigital === 'false') {
      facetWhere.isDigital = false;
    }

    if (minPrice || maxPrice) {
      facetWhere.price = {};
      if (typeof parsedMinPrice === 'number') facetWhere.price.gte = parsedMinPrice;
      if (typeof parsedMaxPrice === 'number') facetWhere.price.lte = parsedMaxPrice;
    }

    if (tag) {
      facetWhere.tags = { has: tag };
    }

    if (isFeatured === 'true') {
      facetWhere.isFeatured = true;
    }

    // Determine sort order
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    switch (sort) {
      case 'price-low':
        orderBy = { price: 'asc' };
        break;
      case 'price-high':
        orderBy = { price: 'desc' };
        break;
      case 'popular':
        orderBy = { createdAt: 'desc' }; // Could be enhanced with view count
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
    }

    if (facetsOnlyRequested) {
      const combinedWhere: Prisma.ProductWhereInput = { ...facetWhere };
      if (elasticsearchResult) {
        if (elasticsearchResult.productIds.length > 0) {
          combinedWhere.id = { in: elasticsearchResult.productIds };
        } else {
          return NextResponse.json(
            {
              success: true,
              products: [],
              count: 0,
              total: 0,
              facets: responseFacets,
            },
            {
              headers: buildResponseHeaders(),
            }
          );
        }
      } else if (search) {
        combinedWhere.OR = buildSearchOrConditions(search);
      }

      if (elasticsearchResult) {
        responseFacets = responseFacets ?? null;
      } else {
        const [totalCountFromDb, builtFacets] = await Promise.all([
          prisma.product.count({ where: combinedWhere }),
          shouldIncludeFacets && !responseFacets ? buildDatabaseFacets(combinedWhere) : Promise.resolve(null),
        ]);
        if (shouldIncludeFacets && !responseFacets && builtFacets) {
          responseFacets = builtFacets;
        }

        return NextResponse.json(
          {
            success: true,
            products: [],
            count: 0,
            total: totalCountFromDb,
            facets: responseFacets,
          },
          {
            headers: buildResponseHeaders(),
          }
        );
      }

      return NextResponse.json(
        {
          success: true,
          products: [],
          count: 0,
          total: elasticsearchResult.total,
          facets: responseFacets,
        },
        {
          headers: buildResponseHeaders(),
        }
      );
    }

    const shouldUnionSearchAndFacets = hasSearch && hasNonSearchFilters;

    let products: ProductListRow[] = [];
    let totalCount = 0;

    if (shouldUnionSearchAndFacets && search) {
      let searchProducts: ProductListRow[] = [];

      if (elasticsearchResult) {
        if (elasticsearchResult.productIds.length > 0) {
          searchProducts = await prisma.product.findMany({
            where: {
              isActive: true,
              id: {
                in: elasticsearchResult.productIds,
              },
            },
            select: productListSelect,
          });
        }
      } else {
        searchProducts = await prisma.product.findMany({
          where: {
            isActive: true,
            OR: buildSearchOrConditions(search),
          },
          orderBy,
          select: productListSelect,
        });
      }

      const facetProducts = await prisma.product.findMany({
        where: facetWhere,
        orderBy,
        select: productListSelect,
      });

      const mergedById = new Map<string, ProductListRow>();
      for (const product of searchProducts) {
        mergedById.set(product.id, product);
      }
      for (const product of facetProducts) {
        if (!mergedById.has(product.id)) {
          mergedById.set(product.id, product);
        }
      }
      products = Array.from(mergedById.values());
      totalCount = products.length;

      if (shouldIncludeFacets && !responseFacets) {
        responseFacets = buildFacetsFromProducts(products);
      }
    } else {
      const combinedWhere: Prisma.ProductWhereInput = { ...facetWhere };

      if (elasticsearchResult) {
        if (elasticsearchResult.productIds.length === 0) {
          return NextResponse.json(
            {
              success: true,
              products: [],
              count: 0,
              total: 0,
              facets: responseFacets,
            },
            {
              headers: buildResponseHeaders(),
            }
          );
        }

        combinedWhere.id = {
          in: elasticsearchResult.productIds,
        };
      } else if (search) {
        combinedWhere.OR = buildSearchOrConditions(search);
      }

      if (elasticsearchResult) {
        products = await prisma.product.findMany({
          where: combinedWhere,
          orderBy: undefined,
          skip: 0,
          take: undefined,
          select: productListSelect,
        });
        totalCount = elasticsearchResult.total;
      } else {
        const [dbProducts, dbTotalCount, builtFacets] = await Promise.all([
          prisma.product.findMany({
            where: combinedWhere,
            orderBy,
            skip,
            take: limit,
            select: productListSelect,
          }),
          prisma.product.count({ where: combinedWhere }),
          shouldIncludeFacets && !responseFacets ? buildDatabaseFacets(combinedWhere) : Promise.resolve(null),
        ]);

        products = dbProducts;
        totalCount = dbTotalCount;
        if (shouldIncludeFacets && !responseFacets && builtFacets) {
          responseFacets = builtFacets;
        }
      }
    }

    // If no products found, return empty array
    if (products.length === 0) {
      return NextResponse.json(
        {
          success: true,
          products: [],
          count: 0,
          total: 0,
          facets: responseFacets,
        },
        {
          headers: buildResponseHeaders(),
        }
      );
    }

    // Preserve Elasticsearch ranking order when applicable
    if (elasticsearchResult) {
      const rankMap = new Map(elasticsearchResult.productIds.map((id, index) => [id, index]));
      products.sort(
        (a, b) => (rankMap.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (rankMap.get(b.id) ?? Number.MAX_SAFE_INTEGER)
      );
    }

    // For union mode, paginate after merging/deduping both result sets.
    const finalProducts =
      shouldUnionSearchAndFacets
        ? products.slice(skip, skip + limit)
        : products;

    return NextResponse.json(
      {
        success: true,
        products: finalProducts,
        count: finalProducts.length,
        total: totalCount,
        facets: responseFacets,
      },
      {
        headers: buildResponseHeaders(),
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[API /products] Error:', errorMessage, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products', details: errorMessage },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      comparePrice,
      isDigital,
      stock,
      sku,
      trackInventory,
      images,
      videoUrl,
      categoryIds,
      tags,
      brand,
      weight,
      dimensions,
      specifications,
      slug,
      metaTitle,
      metaDescription,
      isFeatured,
    } = body;

    // Validation
    if (!name || !description || !price || !slug) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product with this slug already exists' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        isDigital: isDigital || false,
        stock: stock ? parseInt(stock) : null,
        sku,
        trackInventory: trackInventory !== false,
        images: images || [],
        videoUrl: videoUrl || null,
        tags: tags || [],
        brand,
        weight: weight ? parseFloat(weight) : null,
        dimensions,
        specifications,
        slug,
        metaTitle,
        metaDescription,
        isFeatured: isFeatured || false,
        isActive: true,
        categories: {
          create: (categoryIds || []).map((categoryId: string) => ({
            categoryId
          }))
        }
      },
      include: {
        categories: true
      }
    });

    await syncProductToElasticsearch(product.id);
    revalidateTag('products', 'max');
    revalidatePath('/products');
    revalidatePath(`/products/${product.slug}`);

    return NextResponse.json({
      success: true,
      product,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
