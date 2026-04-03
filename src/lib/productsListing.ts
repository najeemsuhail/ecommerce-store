import { unstable_cache } from 'next/cache';
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

export type ListingSort = 'newest' | 'price-low' | 'price-high' | 'popular';

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
  const brandGroups = await prisma.product.groupBy({
    by: ['brand'],
    where: {
      ...where,
      brand: { not: null },
    },
    _count: { brand: true },
  });

  const priceAggregate = await prisma.product.aggregate({
    where,
    _min: { price: true },
    _max: { price: true },
  });

  const categoryGroups = await prisma.productCategory.groupBy({
    by: ['categoryId'],
    where: {
      product: where,
    },
    _count: { categoryId: true },
  });

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

export function getListingOrderBy(sort: ListingSort): Prisma.ProductOrderByWithRelationInput {
  if (sort === 'price-low') {
    return { price: 'asc' };
  }

  if (sort === 'price-high') {
    return { price: 'desc' };
  }

  return { createdAt: 'desc' };
}

const getCachedInitialProductsPageData = unstable_cache(
  async (
    search: string | undefined,
    categories: string[],
    sort: ListingSort,
    limit: number
  ) => {
    const orderBy = getListingOrderBy(sort);
    const where = buildListingWhere(search, categories);

    const products = await prisma.product.findMany({
      where,
      orderBy,
      take: limit,
      select: productListingSelect,
    });

    const total = await prisma.product.count({ where });
    const facets = await buildDatabaseFacets(where);
    const categoryHierarchy = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        parentId: true,
      },
      orderBy: [{ name: 'asc' }],
    });

    return {
      products: products.map(serializeListingProduct),
      total,
      facets,
      categoryHierarchy: categoryHierarchy as ListingCategoryHierarchyItem[],
    };
  },
  ['initial-products-page-data'],
  { revalidate: 300, tags: ['products'] }
);

const getCachedDefaultProductsApiData = unstable_cache(
  async (
    sort: ListingSort,
    skip: number,
    limit: number,
    includeFacets: boolean
  ) => {
    const where = buildListingWhere();
    const orderBy = getListingOrderBy(sort);

    const [products, total, facets] = await Promise.all([
      limit > 0
        ? prisma.product.findMany({
            where,
            orderBy,
            skip,
            take: limit,
            select: productListingSelect,
          })
        : Promise.resolve([]),
      prisma.product.count({ where }),
      includeFacets ? buildDatabaseFacets(where) : Promise.resolve(null),
    ]);

    return {
      products: products.map(serializeListingProduct),
      total,
      facets,
    };
  },
  ['default-products-api-data'],
  { revalidate: 300, tags: ['products'] }
);

export async function getInitialProductsPageData(params: {
  search?: string;
  categories?: string[];
  sort?: ListingSort;
  limit?: number;
}) {
  const search = params.search?.trim() || undefined;
  const categories = params.categories ?? [];
  const limit = params.limit ?? 12;
  const sort = params.sort ?? 'newest';

  return getCachedInitialProductsPageData(search, categories, sort, limit);
}

export async function getDefaultProductsApiData(params: {
  sort?: ListingSort;
  skip?: number;
  limit?: number;
  includeFacets?: boolean;
}) {
  return getCachedDefaultProductsApiData(
    params.sort ?? 'newest',
    params.skip ?? 0,
    params.limit ?? 12,
    params.includeFacets ?? false
  );
}
