import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import Layout from '@/components/Layout';
import prisma from '@/lib/prisma';
import CategoryCollectionCard from '@/components/CategoryCollectionCard';

export const revalidate = 300;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}

const getTopLevelCategories = unstable_cache(
  async () =>
    prisma.category.findMany({
      where: { parentId: null },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ['top-level-categories-page'],
  { revalidate: 300, tags: ['categories'] }
);

export default async function CategoriesPage() {
  const categories = await getTopLevelCategories();

  const shuffledCategories = [...categories].sort(
    (a, b) => hashString(a.id) - hashString(b.id)
  );

  return (
    <Layout>
      <div className="theme-page-shell min-h-screen">
        <div className="px-4 py-16">
          <div className="mx-auto max-w-6xl text-center">
            <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/20 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_78%,black)_0%,color-mix(in_srgb,var(--gradient-accent)_74%,black)_100%)] px-6 py-12 text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
              <div className="mx-auto mb-4 h-1 w-20 rounded-full bg-white/70" />
              <h1 className="mb-4 text-3xl font-bold md:text-5xl">All collections</h1>
              <p className="mx-auto max-w-2xl text-sm text-white/80 md:text-lg">
                Browse all available product collections in one clean, consistent view.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-16">
          {categories.length === 0 ? (
            <div className="theme-surface py-20 text-center">
              <p className="theme-info-note text-lg">No collections available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {shuffledCategories.map((category) => (
                <CategoryCollectionCard
                  key={category.id}
                  name={category.name}
                  imageUrl={category.imageUrl}
                />
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <Link href="/" className="theme-cta-secondary">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
