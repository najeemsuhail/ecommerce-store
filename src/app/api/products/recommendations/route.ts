import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId'); // For product-based recommendations
    const category = searchParams.get('category'); // For category-based recommendations
    const userId = searchParams.get('userId'); // For user-based recommendations
    const limit = parseInt(searchParams.get('limit') || '4');

    if (productId) {
      // Get recommendations based on a product (same category/tags, excluding current product)
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          categories: {
            select: { categoryId: true }
          }
        }
      });

      if (!product) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }

      const categoryIds = product.categories.map(cat => cat.categoryId);

      // Find similar products by category and tags
      const recommendations = await prisma.product.findMany({
        where: {
          isActive: true,
          id: { not: productId },
          OR: [
            ...(categoryIds.length > 0 ? [{
              categories: {
                some: {
                  categoryId: {
                    in: categoryIds
                  }
                }
              }
            }] : []),
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
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' },
        ],
      });

      const productsWithRating = recommendations.map((p) => ({
        ...p,
        averageRating:
          p.reviews.length > 0
            ? Math.round(
                (p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length) * 2
              ) / 2
            : 0,
        reviewCount: p.reviews.length,
      }));

      return NextResponse.json({
        success: true,
        recommendations: productsWithRating,
        recommendationType: 'similar',
      });
    }

    if (category) {
      // Get top-rated products from a specific category
      const recommendations = await prisma.product.findMany({
        where: {
          isActive: true,
          categories: {
            some: {
              category: {
                name: category
              }
            }
          }
        },
        take: limit,
        include: {
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' },
        ],
      });

      const productsWithRating = recommendations.map((p) => ({
        ...p,
        averageRating:
          p.reviews.length > 0
            ? Math.round(
                (p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length) * 2
              ) / 2
            : 0,
        reviewCount: p.reviews.length,
      }));

      return NextResponse.json({
        success: true,
        recommendations: productsWithRating,
        recommendationType: 'category',
      });
    }

    if (userId) {
      // Get recommendations based on user's purchase history
      const userOrders = await prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  categories: {
                    select: { categoryId: true }
                  }
                }
              },
            },
          },
        },
      });

      if (userOrders.length === 0) {
        // If user has no orders, return featured products
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

        const withRating = featured.map((p) => ({
          ...p,
          averageRating:
            p.reviews.length > 0
              ? Math.round(
                  (p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length) * 2
                ) / 2
              : 0,
          reviewCount: p.reviews.length,
        }));

        return NextResponse.json({
          success: true,
          recommendations: withRating,
          recommendationType: 'featured',
        });
      }

      // Get categories and tags from user's purchase history
      const purchasedCategories = new Set<string>();
      const purchasedTags = new Set<string>();
      const purchasedIds = new Set<string>();

      userOrders.forEach((order) => {
        order.items.forEach((item) => {
          purchasedIds.add(item.product.id);
          item.product.categories?.forEach((cat) => {
            purchasedCategories.add(cat.categoryId);
          });
          if (item.product.tags) {
            item.product.tags.forEach((tag) => purchasedTags.add(tag));
          }
        });
      });

      // Find products similar to what user has purchased
      const recommendations = await prisma.product.findMany({
        where: {
          isActive: true,
          id: { notIn: Array.from(purchasedIds) },
          OR: [
            ...(purchasedCategories.size > 0 ? [{
              categories: {
                some: {
                  categoryId: {
                    in: Array.from(purchasedCategories)
                  }
                }
              }
            }] : []),
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
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' },
        ],
      });

      const withRating = recommendations.map((p) => ({
        ...p,
        averageRating:
          p.reviews.length > 0
            ? Math.round(
                (p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length) * 2
              ) / 2
            : 0,
        reviewCount: p.reviews.length,
      }));

      return NextResponse.json({
        success: true,
        recommendations: withRating,
        recommendationType: 'personalized',
      });
    }

    // Default: Return trending/best-selling products
    const trending = await prisma.product.findMany({
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
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    if (trending.length === 0) {
      return NextResponse.json({
        success: true,
        recommendations: [],
        recommendationType: 'trending',
      });
    }

    const withMetrics = trending.map((p) => {
      const totalSales = p.orderItems.reduce((sum, item) => sum + item.quantity, 0);
      return {
        ...p,
        averageRating:
          p.reviews.length > 0
            ? Math.round(
                (p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length) * 2
              ) / 2
            : 0,
        reviewCount: p.reviews.length,
        totalSales,
      };
    });

    return NextResponse.json({
      success: true,
      recommendations: withMetrics,
      recommendationType: 'trending',
    });
  } catch (error) {
    console.error('Recommendation fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
