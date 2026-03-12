import { unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';
import { sanitizeRichHtml, stripHtml } from '@/lib/html';

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

const getProductMetadataRecordBySlug = unstable_cache(
  async (slug: string) => {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        name: true,
        description: true,
        metaTitle: true,
        metaDescription: true,
        images: true,
      },
    });

    return product;
  },
  ['product-metadata-by-slug'],
  { revalidate: 300, tags: ['products'] }
);

const getProductDetailRecordBySlug = unstable_cache(
  async (slug: string) => {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
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
        images: true,
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
      },
    });

    return product;
  },
  ['product-detail-by-slug'],
  { revalidate: 300, tags: ['products'] }
);

export async function getProductMetadataBySlug(slug: string): Promise<ProductMetadata | null> {
  const product = await getProductMetadataRecordBySlug(slug);

  if (!product) {
    return null;
  }

  return {
    name: product.name,
    description: stripHtml(product.description),
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    images: product.images,
  };
}

export async function getProductDetailBySlug(slug: string): Promise<ProductDetail | null> {
  const product = await getProductDetailRecordBySlug(slug);

  if (!product) {
    return null;
  }

  return {
    ...product,
    description: sanitizeRichHtml(product.description),
    specifications: product.specifications as Record<string, unknown> | null,
    averageRating: 0,
    reviewCount: 0,
    reviews: [],
  };
}
