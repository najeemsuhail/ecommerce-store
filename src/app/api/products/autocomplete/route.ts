import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isElasticsearchEnabled, searchProductIdsFromElasticsearch } from '@/lib/elasticsearch';

// GET autocomplete suggestions for product search (products + categories + tags)
// Uses PostgreSQL full-text search for better results with thousands of products
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '8');

    if (!query || query.trim().length < 1) {
      return NextResponse.json({
        success: true,
        products: [],
        categories: [],
        tags: [],
      });
    }

    const searchQuery = query.trim().toLowerCase();

    const safeLimit = Math.min(limit, 8);

    // Prefer Elasticsearch when configured; fallback to PostgreSQL search when unavailable.
    let products: Array<{
      id: string;
      name: string;
      slug: string;
      price: number;
      images: string[];
      brand: string | null;
      rank?: number;
    }> = [];

    if (isElasticsearchEnabled()) {
      try {
        const elasticsearchResult = await searchProductIdsFromElasticsearch({
          query: searchQuery,
          from: 0,
          size: safeLimit,
        });

        if (elasticsearchResult?.productIds.length) {
          const rankMap = new Map(
            elasticsearchResult.productIds.map((id, index) => [id, index])
          );

          const productsFromDb = await prisma.product.findMany({
            where: {
              id: {
                in: elasticsearchResult.productIds,
              },
              isActive: true,
            },
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              images: true,
              brand: true,
            },
          });

          products = productsFromDb
            .sort(
              (a, b) =>
                (rankMap.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
                (rankMap.get(b.id) ?? Number.MAX_SAFE_INTEGER)
            )
            .map((product) => ({ ...product, rank: 100 - (rankMap.get(product.id) ?? 100) }));
        }
      } catch (error) {
        console.error('Elasticsearch autocomplete search failed, falling back to database search:', error);
      }
    }

    if (products.length === 0) {
      // Use PostgreSQL raw query fallback for full-text search.
      products = await prisma.$queryRaw<
        Array<{
          id: string;
          name: string;
          slug: string;
          price: number;
          images: string[];
          brand: string | null;
          rank: number;
        }>
      >`
        SELECT DISTINCT p.id, p.name, p.slug, p.price, p.images, p.brand,
               CASE
                 WHEN p.name ILIKE ${searchQuery + '%'} THEN 5
                 WHEN p.name ILIKE ${'%' + searchQuery + '%'} THEN 3
                 WHEN p.description ILIKE ${'%' + searchQuery + '%'} THEN 2
                 WHEN p.brand ILIKE ${'%' + searchQuery + '%'} THEN 2
                 ELSE 1
               END as rank
        FROM "Product" p
        WHERE p."isActive" = true
          AND (
            p.name ILIKE ${'%' + searchQuery + '%'}
            OR p.description ILIKE ${'%' + searchQuery + '%'}
            OR p.brand ILIKE ${'%' + searchQuery + '%'}
            OR p.tags && ARRAY[${searchQuery}]
          )
        ORDER BY rank DESC, p.name ASC
        LIMIT ${safeLimit}
      `;
    }

    // Search categories
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { parent: { name: { contains: searchQuery, mode: 'insensitive' } } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { products: true },
        },
      },
      take: 3,
    });

    // Get unique tags from products that match the query
    const tagsResult = await prisma.product.findMany({
      where: {
        isActive: true,
        tags: {
          hasSome: [searchQuery],
        },
      },
      select: {
        tags: true,
      },
      take: 20,
    });

    // Extract and deduplicate tags - prioritize exact matches
    const tagsSet = new Map<string, number>();
    tagsResult.forEach((product) => {
      product.tags.forEach((tag) => {
        const tagLower = tag.toLowerCase();
        if (tagLower.includes(searchQuery)) {
          // Give higher weight to exact prefix matches
          const weight = tagLower.startsWith(searchQuery) ? 2 : 1;
          tagsSet.set(tag, (tagsSet.get(tag) || 0) + weight);
        }
      });
    });

    // Sort tags by weight and get top results
    const tags = Array.from(tagsSet.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);

    // Format product suggestions
    const productSuggestions = products.map((product) => ({
      type: 'product' as const,
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : null,
      brand: product.brand,
    }));

    // Format category suggestions
    const categorySuggestions = categories.map((category) => ({
      type: 'category' as const,
      id: category.id,
      name: category.name,
      slug: category.slug,
      productCount: category._count.products,
    }));

    // Format tag suggestions
    const tagSuggestions = tags.map((tag) => ({
      type: 'tag' as const,
      name: tag,
    }));

    return NextResponse.json({
      success: true,
      products: productSuggestions,
      categories: categorySuggestions,
      tags: tagSuggestions,
      totalResults: productSuggestions.length + categorySuggestions.length + tagSuggestions.length,
    });
  } catch (error) {
    console.error('Error fetching autocomplete suggestions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
