import type { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://onlyinkani.in').replace(/\/+$/, '');

const staticRoutes = [
  '',
  '/products',
  '/categories',
  '/blog',
  '/about',
  '/contact',
  '/faq',
  '/privacy-policy',
  '/terms-of-service',
  '/refund-policy',
  '/check-delivery',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.7,
  }));

  try {
    const [products, categories, blogs] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({
        select: { slug: true, updatedAt: true },
      }),
      prisma.blog.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${SITE_URL}/categories/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const blogEntries: MetadataRoute.Sitemap = blogs.map((blog) => ({
      url: `${SITE_URL}/blog/${blog.slug}`,
      lastModified: blog.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

    return [...staticEntries, ...productEntries, ...categoryEntries, ...blogEntries];
  } catch (error) {
    console.error('Failed to build dynamic sitemap entries:', error);
    return staticEntries;
  }
}
