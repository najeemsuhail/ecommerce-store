import prisma from '@/lib/prisma';

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number | null;
  isActive: boolean;
}

export interface ProductCategoryLink {
  categoryId: string;
  category?: {
    id?: string;
    name?: string;
  } | null;
}

export interface ProductReview {
  id: string;
  rating: number;
  comment?: string | null;
  user?: {
    name?: string | null;
  } | null;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  videoUrl?: string | null;
  isDigital: boolean;
  isActive: boolean;
  stock: number | null;
  weight?: number | null;
  brand?: string | null;
  specifications?: Record<string, unknown> | null;
  tags?: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  averageRating: number;
  reviewCount: number;
  variants: ProductVariant[];
  categories: ProductCategoryLink[];
  reviews: ProductReview[];
}

export async function getProductDetailBySlug(slug: string): Promise<ProductDetail | null> {
  const [product, reviewStats] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        images: true,
        videoUrl: true,
        isDigital: true,
        isActive: true,
        stock: true,
        weight: true,
        brand: true,
        specifications: true,
        tags: true,
        metaTitle: true,
        metaDescription: true,
        variants: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            isActive: true,
          },
        },
        categories: {
          select: {
            categoryId: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            rating: true,
            comment: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
    prisma.review.aggregate({
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
      where: {
        product: {
          slug,
        },
      },
    }),
  ]);

  if (!product) {
    return null;
  }

  const avgRating = reviewStats._avg.rating ?? 0;
  const reviewCount = reviewStats._count.id ?? 0;

  return {
    ...product,
    specifications: product.specifications as Record<string, unknown> | null,
    averageRating: Math.round(avgRating * 10) / 10,
    reviewCount,
  };
}
