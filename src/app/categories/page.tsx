import Link from 'next/link';
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

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const shuffledCategories = [...categories].sort(
    (a, b) => hashString(a.id) - hashString(b.id)
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="mb-12 rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#eef6ff_45%,#ffffff_100%)] px-6 py-10 text-center shadow-sm md:mb-16 md:px-10 md:py-14">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
              <span className="bg-gradient-to-r from-sky-600 via-blue-700 to-slate-900 bg-clip-text text-transparent">
                All collections
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-slate-600 md:text-lg">
              Browse all available product collections in one clean, consistent view.
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">No collections available</p>
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
            <Link
              href="/"
              className="inline-block rounded-full bg-slate-900 px-8 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
            >
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
