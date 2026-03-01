import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { isElasticsearchEnabled, searchProductIdsFromElasticsearch } from '@/lib/elasticsearch';
import { syncProductToElasticsearch } from '@/lib/elasticsearchSync';

export const revalidate = 300; // ISR: Revalidate every 5 minutes (industry standard)

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

type ProductWithRating = Omit<ProductWithRelations, 'reviews'> & {
  averageRating: number;
  reviewCount: number;
};

const productInclude = {
  reviews: {
    select: {
      rating: true,
    },
  },
  categories: {
    include: {
      category: true,
    },
  },
  attributes: {
    include: {
      attribute: true,
    },
  },
  variants: true,
} as const;

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

// GET all products (with search and filter)
export async function GET(request: NextRequest) {
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

    const hasNonSearchFilters =
      categories.length > 0 ||
      brands.length > 0 ||
      Boolean(isDigital) ||
      Boolean(minPrice) ||
      Boolean(maxPrice) ||
      Boolean(tag) ||
      Boolean(isFeatured) ||
      attributeFilters.size > 0;

    const shouldUseElasticsearch = Boolean(search) && isElasticsearchEnabled();

    let elasticsearchResult: {
      productIds: string[];
      total: number;
      facets?: {
        brands: Array<{ name: string; count: number }>;
        categories: Array<{ name: string; count: number }>;
        priceRange: { min: number; max: number };
      };
    } | null = null;

    if (shouldUseElasticsearch && search) {
      // When additional filters are active with a text query, fetch a wider ES window
      // and apply facet/category/price filtering in Prisma on top of those IDs.
      const elasticFrom = hasNonSearchFilters ? 0 : skip;
      const elasticSize = hasNonSearchFilters ? 10000 : limit;
      try {
        elasticsearchResult = await searchProductIdsFromElasticsearch({
          query: search,
          from: elasticFrom,
          size: elasticSize,
        });
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
      if (minPrice) facetWhere.price.gte = parseFloat(minPrice);
      if (maxPrice) facetWhere.price.lte = parseFloat(maxPrice);
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
      case 'rating':
        orderBy = { createdAt: 'desc' }; // Will be sorted after calculating ratings
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
    }

    const hasSearch = Boolean(search);
    const shouldUnionSearchAndFacets = hasSearch && hasNonSearchFilters;

    let products: ProductWithRelations[] = [];
    let totalCount = 0;

    if (shouldUnionSearchAndFacets && search) {
      let searchProducts: ProductWithRelations[] = [];

      if (elasticsearchResult) {
        if (elasticsearchResult.productIds.length > 0) {
          searchProducts = await prisma.product.findMany({
            where: {
              isActive: true,
              id: {
                in: elasticsearchResult.productIds,
              },
            },
            include: productInclude,
          });
        }
      } else {
        searchProducts = await prisma.product.findMany({
          where: {
            isActive: true,
            OR: buildSearchOrConditions(search),
          },
          orderBy,
          include: productInclude,
        });
      }

      const facetProducts = await prisma.product.findMany({
        where: facetWhere,
        orderBy,
        include: productInclude,
      });

      const mergedById = new Map<string, ProductWithRelations>();
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
    } else {
      const combinedWhere: Prisma.ProductWhereInput = { ...facetWhere };

      if (search && elasticsearchResult) {
        if (elasticsearchResult.productIds.length === 0) {
          return NextResponse.json(
            {
              success: true,
              products: [],
              count: 0,
              total: 0,
              facets: elasticsearchResult.facets || null,
            },
            {
              headers: {
                'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=120',
              },
            }
          );
        }

        combinedWhere.id = {
          in: elasticsearchResult.productIds,
        };
      } else if (search) {
        combinedWhere.OR = buildSearchOrConditions(search);
      }

      products = await prisma.product.findMany({
        where: combinedWhere,
        orderBy: elasticsearchResult ? undefined : orderBy,
        skip: elasticsearchResult ? 0 : skip,
        take: elasticsearchResult ? undefined : limit,
        include: productInclude,
      });

      totalCount = elasticsearchResult
        ? hasNonSearchFilters
          ? products.length
          : elasticsearchResult.total
        : await prisma.product.count({ where: combinedWhere });
    }

    // If no products found, return empty array
    if (products.length === 0) {
      return NextResponse.json(
        {
          success: true,
          products: [],
          count: 0,
          total: 0,
          facets: elasticsearchResult?.facets || null,
        },
        {
          headers: {
            'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=120',
          },
        }
      );
    }

    // Calculate average rating for each product
    const productsWithRating: ProductWithRating[] = products.map((product) => {
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
          : 0;
      
      const { reviews, ...productData } = product;
      
      return {
        ...productData,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
      };
    });

    // Preserve Elasticsearch ranking order when applicable
    if (elasticsearchResult) {
      const rankMap = new Map(elasticsearchResult.productIds.map((id, index) => [id, index]));
      productsWithRating.sort(
        (a, b) => (rankMap.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (rankMap.get(b.id) ?? Number.MAX_SAFE_INTEGER)
      );
    }

    // Sort by rating if requested
    if (sort === 'rating') {
      productsWithRating.sort((a, b) => b.averageRating - a.averageRating);
    }

    // For union mode, paginate after merging/deduping both result sets.
    const finalProducts =
      shouldUnionSearchAndFacets
        ? productsWithRating.slice(skip, skip + limit)
        : productsWithRating;

    return NextResponse.json(
      {
        success: true,
        products: finalProducts,
        count: finalProducts.length,
        total: totalCount,
        facets: elasticsearchResult?.facets || null,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=120',
        },
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
