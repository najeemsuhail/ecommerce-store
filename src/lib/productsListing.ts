import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { stripHtml } from '@/lib/html';

export interface ListingFacetData {
  brands: { name: string; count: number }[];
  categories: { name: string; id: string; count: number }[];
  priceRange: { min: number; max: number };
}

export interface ListingCategoryHierarchyItem {
  id: string;
  name: string;
  parentId: string | null;
}

export const productListingSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  comparePrice: true,
  isDigital: true,
  images: true,
  slug: true,
  isActive: true,
  isFeatured: true,
  brand: true,
  weight: true,
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

export type ProductListingItem = Prisma.ProductGetPayload<{
  select: typeof productListingSelect;
}>;

export function serializeListingProduct<T extends { description: string }>(product: T) {
  return {
    ...product,
    description: stripHtml(product.description).slice(0, 100),
  };
}

function buildSearchOrConditions(search: string): Prisma.ProductWhereInput[] {
  return [
    { name: { contains: search, mode: 'insensitive' } },
    { description: { contains: search, mode: 'insensitive' } },
    { brand: { contains: search, mode: 'insensitive' } },
    { tags: { has: search } },
    {
      categories: {
        some: {
          category: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
      },
    },
  ];
}

async function buildDatabaseFacets(where: Prisma.ProductWhereInput): Promise<ListingFacetData> {
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

function buildListingWhere(search?: string, categories: string[] = []): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (categories.length > 0) {
    where.categories = {
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

  if (search) {
    where.OR = buildSearchOrConditions(search);
  }

  return where;
}

export async function getInitialProductsPageData(params: {
  search?: string;
  categories?: string[];
  sort?: 'newest' | 'price-low' | 'price-high' | 'popular';
  limit?: number;
}) {
  const search = params.search?.trim() || undefined;
  const categories = params.categories ?? [];
  const limit = params.limit ?? 12;
  const sort = params.sort ?? 'newest';

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
  if (sort === 'price-low') {
    orderBy = { price: 'asc' };
  } else if (sort === 'price-high') {
    orderBy = { price: 'desc' };
  }

  const where = buildListingWhere(search, categories);

  const [products, total, facets, categoryHierarchy] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take: limit,
      select: productListingSelect,
    }),
    prisma.product.count({ where }),
    buildDatabaseFacets(where),
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        parentId: true,
      },
      orderBy: [{ name: 'asc' }],
    }),
  ]);

  return {
    products: products.map(serializeListingProduct),
    total,
    facets,
    categoryHierarchy: categoryHierarchy as ListingCategoryHierarchyItem[],
  };
}
