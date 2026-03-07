import Link from 'next/link';
import Layout from '@/components/Layout';
import prisma from '@/lib/prisma';

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
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                All collections
              </span>
            </h1>
            <p className="text-base md:text-xl text-gray-600">Browse all available product collections</p>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">No collections available</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {shuffledCategories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/products?category=${encodeURIComponent(category.name)}`}
                  className="group relative overflow-hidden rounded-2xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-2xl transform hover:-translate-y-2"
                >
                  {category.imageUrl ? (
                    <div className="absolute inset-0">
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                          <pattern id={`pattern-${index}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="10" cy="10" r="2" fill="white" />
                          </pattern>
                        </defs>
                        <rect width="100" height="100" fill={`url(#pattern-${index})`} />
                      </svg>
                    </div>
                  )}

                  <div className="relative px-4 py-8 md:px-8 md:py-12 text-center flex flex-col items-center justify-center min-h-28 md:min-h-32">
                    <h3 className="font-bold text-base md:text-lg lg:text-2xl text-white group-hover:scale-105 transition-transform duration-300 line-clamp-3">
                      {category.name}
                    </h3>
                    <div className="mt-2 md:mt-4 text-white/80 group-hover:text-white transition-colors text-xs md:text-sm font-semibold">
                      Browse -&gt;
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300"></div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
