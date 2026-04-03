import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { isExternalSearchEnabled, searchProductIdsFromElasticsearch } from '@/lib/elasticsearch';
import { getExternalSearchProvider } from '@/lib/searchProvider';

export const revalidate = 60; // ISR: Revalidate every 60 seconds

const recommendationProductSelect = {
  id: true,
  name: true,
  price: true,
  comparePrice: true,
  slug: true,
  images: true,
  isDigital: true,
  isActive: true,
  stock: true,
  weight: true,
  isFeatured: true,
  createdAt: true,
} as const;

type RecommendationProduct = Prisma.ProductGetPayload<{
  select: typeof recommendationProductSelect;
}> & {
  averageRating: number;
  reviewCount: number;
  totalSales?: number;
};

function sortProductsByRank<T extends { id: string }>(products: T[], rankedIds: string[]) {
  const rankMap = new Map(rankedIds.map((id, index) => [id, index]));

  return [...products].sort(
    (a, b) =>
      (rankMap.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
      (rankMap.get(b.id) ?? Number.MAX_SAFE_INTEGER)
  );
}

async function fetchRecommendationProducts(ids: string[], excludeIds: string[] = []) {
  if (ids.length === 0) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: {
      id: excludeIds.length > 0 ? { in: ids, notIn: excludeIds } : { in: ids },
      isActive: true,
    },
    select: recommendationProductSelect,
  });

  return sortProductsByRank(products, ids);
}

async function fetchReviewMetrics(productIds: string[]) {
  if (productIds.length === 0) {
    return new Map<string, { averageRating: number; reviewCount: number }>();
  }

  const [reviewCounts, reviewAverages] = await Promise.all([
    prisma.review.groupBy({
      by: ['productId'],
      where: { productId: { in: productIds } },
      _count: { _all: true },
    }),
    prisma.review.groupBy({
      by: ['productId'],
      where: { productId: { in: productIds } },
      _avg: { rating: true },
    }),
  ]);

  const metrics = new Map<string, { averageRating: number; reviewCount: number }>();

  for (const row of reviewCounts) {
    metrics.set(row.productId, {
      averageRating: 0,
      reviewCount: row._count._all,
    });
  }

  for (const row of reviewAverages) {
    const existing = metrics.get(row.productId) || { averageRating: 0, reviewCount: 0 };
    existing.averageRating = row._avg.rating
      ? Math.round(row._avg.rating * 2) / 2
      : 0;
    metrics.set(row.productId, existing);
  }

  return metrics;
}

async function fetchSalesMetrics(productIds: string[]) {
  if (productIds.length === 0) {
    return new Map<string, number>();
  }

  const salesGroups = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: { productId: { in: productIds } },
    _sum: { quantity: true },
  });

  return new Map(
    salesGroups.map((row) => [row.productId, row._sum.quantity ?? 0])
  );
}

async function attachRecommendationMetrics(
  products: Prisma.ProductGetPayload<{ select: typeof recommendationProductSelect }>[],
  options?: { includeSales?: boolean; salesMetrics?: Map<string, number> }
): Promise<RecommendationProduct[]> {
  const productIds = products.map((product) => product.id);
  const reviewMetrics = await fetchReviewMetrics(productIds);
  const salesMetrics = options?.includeSales
    ? options.salesMetrics ?? await fetchSalesMetrics(productIds)
    : null;

  return products.map((product) => {
    const reviewMetric = reviewMetrics.get(product.id);

    return {
      ...product,
      averageRating: reviewMetric?.averageRating ?? 0,
      reviewCount: reviewMetric?.reviewCount ?? 0,
      ...(salesMetrics ? { totalSales: salesMetrics.get(product.id) ?? 0 } : {}),
    };
  });
}

export async function GET(request: NextRequest) {
  try {
    let recommendationSource: 'elasticsearch' | 'meilisearch' | 'database' = 'database';
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('mode');
    const productId = searchParams.get('productId');
    const category = searchParams.get('category');
    const userId = searchParams.get('userId');
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '4'), 1), 20);
    const excludeIds = Array.from(
      new Set(searchParams.getAll('excludeId').filter((id) => typeof id === 'string' && id.length > 0))
    );

    const json = (payload: unknown, status = 200) =>
      NextResponse.json(payload, {
        status,
        headers: {
          'X-Recommendation-Source': recommendationSource,
        },
      });

    if (mode === 'bestsellers') {
      const salesGroups = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true,
        },
        where: excludeIds.length > 0 ? { productId: { notIn: excludeIds } } : undefined,
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: limit * 4,
      });

      const salesMetrics = new Map(
        salesGroups.map((group) => [group.productId, group._sum.quantity ?? 0])
      );
      const rankedIds = salesGroups.map((group) => group.productId);
      const bestSellerBase = await fetchRecommendationProducts(rankedIds, excludeIds);
      const bestSellers = await attachRecommendationMetrics(bestSellerBase, {
        includeSales: true,
        salesMetrics,
      });

      if (bestSellers.length < limit) {
        const fallbackBase = await prisma.product.findMany({
          where: {
            isActive: true,
            ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
          },
          take: Math.max(limit * 2, 16),
          select: recommendationProductSelect,
          orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        });
        const fallbackSalesMetrics = await fetchSalesMetrics(fallbackBase.map((product) => product.id));
        const fallback = await attachRecommendationMetrics(fallbackBase, {
          includeSales: true,
          salesMetrics: fallbackSalesMetrics,
        });

        const seen = new Set(bestSellers.map((product) => product.id));
        for (const product of fallback) {
          if (!seen.has(product.id)) {
            bestSellers.push(product);
            seen.add(product.id);
          }
          if (bestSellers.length >= limit) break;
        }
      }

      const ranked = bestSellers
        .sort((a, b) => {
          const salesDiff = (b.totalSales ?? 0) - (a.totalSales ?? 0);
          if (salesDiff !== 0) return salesDiff;
          const reviewDiff = (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
          if (reviewDiff !== 0) return reviewDiff;
          return (b.averageRating ?? 0) - (a.averageRating ?? 0);
        })
        .slice(0, limit);

      return json({
        success: true,
        recommendations: ranked,
        recommendationType: 'bestsellers',
      });
    }

    const fetchIdsFromElasticsearch = async (params: {
      categories?: string[];
      categoryIds?: string[];
      tags?: string[];
      excludeIds?: string[];
      size: number;
    }) => {
      if (!isExternalSearchEnabled()) return [];

      const ids: string[] = [];
      const seen = new Set<string>(params.excludeIds || []);

      const pushIds = (candidateIds: string[]) => {
        for (const id of candidateIds) {
          if (!seen.has(id)) {
            seen.add(id);
            ids.push(id);
            if (ids.length >= params.size) break;
          }
        }
      };

      if (params.categories && params.categories.length > 0) {
        const byCategories = await searchProductIdsFromElasticsearch({
          from: 0,
          size: params.size * 3,
          sort: 'featured-newest',
          includeFacets: false,
          filters: {
            categories: params.categories,
            categoryIds: params.categoryIds,
          },
        });
        if (byCategories?.productIds.length) {
          pushIds(byCategories.productIds);
        }
      }

      if (ids.length < params.size && params.categoryIds && params.categoryIds.length > 0) {
        const byCategoryIds = await searchProductIdsFromElasticsearch({
          from: 0,
          size: params.size * 3,
          sort: 'featured-newest',
          includeFacets: false,
          filters: {
            categoryIds: params.categoryIds,
          },
        });
        if (byCategoryIds?.productIds.length) {
          pushIds(byCategoryIds.productIds);
        }
      }

      if (ids.length < params.size && params.tags && params.tags.length > 0) {
        const byTags = await searchProductIdsFromElasticsearch({
          from: 0,
          size: params.size * 3,
          sort: 'featured-newest',
          includeFacets: false,
          filters: {
            tags: params.tags,
          },
        });
        if (byTags?.productIds.length) {
          pushIds(byTags.productIds);
        }
      }

      return ids.slice(0, params.size);
    };

    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          categories: {
            select: { categoryId: true, category: { select: { name: true } } },
          },
        },
      });

      if (!product) {
        return json({ success: false, error: 'Product not found' }, 404);
      }

      let recommendations: RecommendationProduct[] = [];
      if (isExternalSearchEnabled()) {
        try {
          const categoryNames = product.categories
            .map((cat) => cat.category?.name)
            .filter((name): name is string => Boolean(name));
          const categoryIds = product.categories
            .map((cat) => cat.categoryId)
            .filter((id): id is string => Boolean(id));
          const candidateIds = await fetchIdsFromElasticsearch({
            categories: categoryNames,
            categoryIds,
            tags: product.tags,
            excludeIds: [productId],
            size: limit,
          });
          const recommendationBase = await fetchRecommendationProducts(candidateIds, excludeIds);
          recommendations = await attachRecommendationMetrics(recommendationBase);
          if (recommendations.length > 0) {
            recommendationSource = getExternalSearchProvider() || 'database';
          }
        } catch (error) {
          console.error('Elasticsearch similar recommendations failed, falling back to database:', error);
        }
      }

      if (recommendations.length === 0) {
        const recommendationBase = await prisma.product.findMany({
          where: {
            isActive: true,
            id: excludeIds.length > 0 ? { not: productId, notIn: excludeIds } : { not: productId },
            OR: [
              ...(product.categories.length > 0
                ? [
                    {
                      categories: {
                        some: {
                          categoryId: {
                            in: product.categories.map((cat) => cat.categoryId),
                          },
                        },
                      },
                    },
                  ]
                : []),
              {
                tags: {
                  hasSome: product.tags,
                },
              },
            ],
          },
          take: limit,
          select: recommendationProductSelect,
          orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        });
        recommendations = await attachRecommendationMetrics(recommendationBase);
      }

      return json({
        success: true,
        recommendations,
        recommendationType: 'similar',
      });
    }

    if (category) {
      let recommendations: RecommendationProduct[] = [];
      if (isExternalSearchEnabled()) {
        try {
          const result = await searchProductIdsFromElasticsearch({
            from: 0,
            size: limit,
            sort: 'featured-newest',
            includeFacets: false,
            filters: {
              categories: [category],
            },
          });
          const recommendationBase = await fetchRecommendationProducts(result?.productIds || [], excludeIds);
          recommendations = await attachRecommendationMetrics(recommendationBase);
          if (recommendations.length > 0) {
            recommendationSource = getExternalSearchProvider() || 'database';
          }
        } catch (error) {
          console.error('Elasticsearch category recommendations failed, falling back to database:', error);
        }
      }

      if (recommendations.length === 0) {
        const recommendationBase = await prisma.product.findMany({
          where: {
            isActive: true,
            ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
            categories: {
              some: {
                category: {
                  name: category,
                },
              },
            },
          },
          take: limit,
          select: recommendationProductSelect,
          orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        });
        recommendations = await attachRecommendationMetrics(recommendationBase);
      }

      return json({
        success: true,
        recommendations,
        recommendationType: 'category',
      });
    }

    if (userId) {
      const userOrders = await prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  categories: {
                    select: { categoryId: true, category: { select: { name: true } } },
                  },
                },
              },
            },
          },
        },
      });

      if (userOrders.length === 0) {
        const featuredBase = await prisma.product.findMany({
          where: { isActive: true, isFeatured: true },
          take: limit,
          select: recommendationProductSelect,
        });
        const featured = await attachRecommendationMetrics(featuredBase);

        return json({
          success: true,
          recommendations: featured,
          recommendationType: 'featured',
        });
      }

      const purchasedCategoryNames = new Set<string>();
      const purchasedCategoryIds = new Set<string>();
      const purchasedTags = new Set<string>();
      const purchasedIds = new Set<string>();

      userOrders.forEach((order) => {
        order.items.forEach((item) => {
          purchasedIds.add(item.product.id);
          item.product.categories?.forEach((cat) => {
            purchasedCategoryIds.add(cat.categoryId);
            if (cat.category?.name) {
              purchasedCategoryNames.add(cat.category.name);
            }
          });
          if (item.product.tags) {
            item.product.tags.forEach((tag) => purchasedTags.add(tag));
          }
        });
      });

      let recommendations: RecommendationProduct[] = [];
      if (isExternalSearchEnabled()) {
        try {
          const candidateIds = await fetchIdsFromElasticsearch({
            categories: Array.from(purchasedCategoryNames),
            tags: Array.from(purchasedTags),
            excludeIds: Array.from(purchasedIds),
            size: limit,
          });
          const recommendationBase = await fetchRecommendationProducts(candidateIds, excludeIds);
          recommendations = await attachRecommendationMetrics(recommendationBase);
          if (recommendations.length > 0) {
            recommendationSource = getExternalSearchProvider() || 'database';
          }
        } catch (error) {
          console.error('Elasticsearch personalized recommendations failed, falling back to database:', error);
        }
      }

      if (recommendations.length === 0) {
        const recommendationBase = await prisma.product.findMany({
          where: {
            isActive: true,
            id: {
              notIn:
                excludeIds.length > 0
                  ? Array.from(new Set([...Array.from(purchasedIds), ...excludeIds]))
                  : Array.from(purchasedIds),
            },
            OR: [
              ...(purchasedCategoryIds.size > 0
                ? [
                    {
                      categories: {
                        some: {
                          categoryId: {
                            in: Array.from(purchasedCategoryIds),
                          },
                        },
                      },
                    },
                  ]
                : []),
              {
                tags: {
                  hasSome: Array.from(purchasedTags),
                },
              },
            ],
          },
          take: limit,
          select: recommendationProductSelect,
          orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        });
        recommendations = await attachRecommendationMetrics(recommendationBase);
      }

      return json({
        success: true,
        recommendations,
        recommendationType: 'personalized',
      });
    }

    let trending: RecommendationProduct[] = [];
    if (isExternalSearchEnabled()) {
      try {
        const result = await searchProductIdsFromElasticsearch({
          from: 0,
          size: limit + excludeIds.length,
          sort: 'featured-newest',
          includeFacets: false,
        });
        const trendingBase = await fetchRecommendationProducts(result?.productIds || [], excludeIds);
        trending = await attachRecommendationMetrics(trendingBase);
        if (trending.length > 0) {
          recommendationSource = getExternalSearchProvider() || 'database';
        }
      } catch (error) {
        console.error('Elasticsearch trending recommendations failed, falling back to database:', error);
      }
    }

    if (trending.length === 0) {
      const trendingBase = await prisma.product.findMany({
        where: {
          isActive: true,
          ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
        },
        take: limit,
        select: recommendationProductSelect,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      });
      trending = await attachRecommendationMetrics(trendingBase);
    }

    if (trending.length === 0) {
      return json({
        success: true,
        recommendations: [],
        recommendationType: 'trending',
      });
    }

    return json({
      success: true,
      recommendations: trending.slice(0, limit),
      recommendationType: 'trending',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[API /recommendations] Error:', errorMessage, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recommendations', details: errorMessage },
      { status: 500 }
    );
  }
}
