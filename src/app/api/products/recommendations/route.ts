import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { isExternalSearchEnabled, searchProductIdsFromElasticsearch } from '@/lib/elasticsearch';
import { getExternalSearchProvider } from '@/lib/searchProvider';

export const revalidate = 60; // ISR: Revalidate every 60 seconds

function withRating<T extends { reviews: Array<{ rating: number }> }>(items: T[]) {
  return items.map((p) => ({
    ...p,
    averageRating:
      p.reviews.length > 0
        ? Math.round(
            (p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length) * 2
          ) / 2
        : 0,
    reviewCount: p.reviews.length,
  }));
}

type RecommendationProduct = Prisma.ProductGetPayload<{
  include: {
    reviews: {
      select: {
        rating: true;
      };
    };
    orderItems: {
      select: {
        quantity: true;
      };
    };
  };
}>;

export async function GET(request: NextRequest) {
  try {
    let recommendationSource: 'elasticsearch' | 'meilisearch' | 'database' = 'database';
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    const category = searchParams.get('category');
    const userId = searchParams.get('userId');
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '4'), 1), 20);

    const json = (payload: unknown, status = 200) =>
      NextResponse.json(payload, {
        status,
        headers: {
          'X-Recommendation-Source': recommendationSource,
        },
      });

    const fetchProductsByRankedIds = async (ids: string[]) => {
      if (ids.length === 0) return [];
      const rankMap = new Map(ids.map((id, index) => [id, index]));
      const products = await prisma.product.findMany({
        where: {
          id: { in: ids },
          isActive: true,
        },
        include: {
          reviews: {
            select: { rating: true },
          },
          orderItems: {
            select: { quantity: true },
          },
        },
      });

      return products.sort(
        (a, b) =>
          (rankMap.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
          (rankMap.get(b.id) ?? Number.MAX_SAFE_INTEGER)
      );
    };

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
          recommendations = await fetchProductsByRankedIds(candidateIds);
          if (recommendations.length > 0) {
            recommendationSource = getExternalSearchProvider() || 'database';
          }
        } catch (error) {
          console.error('Elasticsearch similar recommendations failed, falling back to database:', error);
        }
      }

      if (recommendations.length === 0) {
        recommendations = await prisma.product.findMany({
          where: {
            isActive: true,
            id: { not: productId },
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
          include: {
            reviews: {
              select: {
                rating: true,
              },
            },
            orderItems: {
              select: {
                quantity: true,
              },
            },
          },
          orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        });
      }

      return json({
        success: true,
        recommendations: withRating(recommendations),
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
          recommendations = await fetchProductsByRankedIds(result?.productIds || []);
          if (recommendations.length > 0) {
            recommendationSource = getExternalSearchProvider() || 'database';
          }
        } catch (error) {
          console.error('Elasticsearch category recommendations failed, falling back to database:', error);
        }
      }

      if (recommendations.length === 0) {
        recommendations = await prisma.product.findMany({
          where: {
            isActive: true,
            categories: {
              some: {
                category: {
                  name: category,
                },
              },
            },
          },
          take: limit,
          include: {
            reviews: {
              select: {
                rating: true,
              },
            },
            orderItems: {
              select: {
                quantity: true,
              },
            },
          },
          orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        });
      }

      return json({
        success: true,
        recommendations: withRating(recommendations),
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
        const featured = await prisma.product.findMany({
          where: { isActive: true, isFeatured: true },
          take: limit,
          include: {
            reviews: {
              select: {
                rating: true,
              },
            },
          },
        });

        return json({
          success: true,
          recommendations: withRating(featured),
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
          recommendations = await fetchProductsByRankedIds(candidateIds);
          if (recommendations.length > 0) {
            recommendationSource = getExternalSearchProvider() || 'database';
          }
        } catch (error) {
          console.error('Elasticsearch personalized recommendations failed, falling back to database:', error);
        }
      }

      if (recommendations.length === 0) {
        recommendations = await prisma.product.findMany({
          where: {
            isActive: true,
            id: { notIn: Array.from(purchasedIds) },
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
          include: {
            reviews: {
              select: {
                rating: true,
              },
            },
            orderItems: {
              select: {
                quantity: true,
              },
            },
          },
          orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        });
      }

      return json({
        success: true,
        recommendations: withRating(recommendations),
        recommendationType: 'personalized',
      });
    }

    let trending: RecommendationProduct[] = [];
    if (isExternalSearchEnabled()) {
      try {
        const result = await searchProductIdsFromElasticsearch({
          from: 0,
          size: limit,
          sort: 'featured-newest',
          includeFacets: false,
        });
        trending = await fetchProductsByRankedIds(result?.productIds || []);
        if (trending.length > 0) {
          recommendationSource = getExternalSearchProvider() || 'database';
        }
      } catch (error) {
        console.error('Elasticsearch trending recommendations failed, falling back to database:', error);
      }
    }

    if (trending.length === 0) {
      trending = await prisma.product.findMany({
        where: { isActive: true },
        take: limit,
        include: {
          reviews: {
            select: {
              rating: true,
            },
          },
          orderItems: {
            select: {
              quantity: true,
            },
          },
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      });
    }

    if (trending.length === 0) {
      return json({
        success: true,
        recommendations: [],
        recommendationType: 'trending',
      });
    }

    const withMetrics = trending.map((p) => {
      const totalSales = p.orderItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
      return {
        ...p,
        averageRating:
          p.reviews.length > 0
            ? Math.round(
                (p.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / p.reviews.length) * 2
              ) / 2
            : 0,
        reviewCount: p.reviews.length,
        totalSales,
      };
    });

    return json({
      success: true,
      recommendations: withMetrics,
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
