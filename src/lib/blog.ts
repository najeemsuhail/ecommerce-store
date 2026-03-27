import { unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';

const blogListSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  featuredImage: true,
  author: true,
  createdAt: true,
} as const;

export async function getPublishedBlogs(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const getCachedBlogs = unstable_cache(
    async () => {
      const [blogs, total] = await Promise.all([
        prisma.blog.findMany({
          where: { published: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          select: blogListSelect,
        }),
        prisma.blog.count({
          where: { published: true },
        }),
      ]);

      return {
        blogs,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    },
    [`published-blogs:${page}:${limit}`],
    { revalidate: 300, tags: ['blogs'] }
  );

  return getCachedBlogs();
}

export async function getLatestPublishedBlogs(limit: number) {
  const getCachedLatestBlogs = unstable_cache(
    async () =>
      prisma.blog.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: blogListSelect,
      }),
    [`latest-published-blogs:${limit}`],
    { revalidate: 300, tags: ['blogs'] }
  );

  return getCachedLatestBlogs();
}
