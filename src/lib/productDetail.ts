import { cache } from 'react';
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

export interface ProductMetadata {
  name: string;
  description: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  images: string[];
}

export const getProductMetadataBySlug = cache(async (slug: string): Promise<ProductMetadata | null> => {
  const product = await getProductDetailBySlug(slug);

  if (!product) {
    return null;
  }

  return {
    name: product.name,
    description: product.description,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    images: product.images,
  };
});

export const getProductDetailBySlug = cache(async (slug: string): Promise<ProductDetail | null> => {
  const product = await prisma.product.findUnique({
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
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });

  if (!product) {
    return null;
  }

  const { _count, ...productData } = product;
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;

  return {
    ...productData,
    reviews: product.reviews.slice(0, 10),
    specifications: product.specifications as Record<string, unknown> | null,
    averageRating: Math.round(avgRating * 10) / 10,
    reviewCount: _count.reviews,
  };
});
