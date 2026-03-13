'use client';

import Link from 'next/link';

interface CategoryCarouselProps {
  categories: Array<{ name: string; id: string; slug: string; imageUrl?: string | null }>;
}

export default function CategoryCarousel({ categories }: CategoryCarouselProps) {
  if (categories.length === 0) return null;

  const displayedCategories = categories.slice(0, 6);
  const hasMore = categories.length > 6;

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Collections
              </span>
            </h2>
            <p className="text-sm text-gray-600 md:text-lg">Browse curated collections</p>
          </div>
          <Link
            href="/categories"
            className="w-fit whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700 hover:shadow-lg md:px-6 md:text-base"
          >
            View All {hasMore && `(${categories.length})`}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {displayedCategories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="group relative overflow-hidden rounded-2xl bg-slate-900 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="absolute inset-0">
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-500" />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />

              <div className="relative flex min-h-28 flex-col justify-end px-4 py-5 md:min-h-32 md:px-5">
                <h3 className="line-clamp-2 text-base font-bold text-white transition-transform duration-300 group-hover:scale-105 md:text-lg lg:text-xl">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
