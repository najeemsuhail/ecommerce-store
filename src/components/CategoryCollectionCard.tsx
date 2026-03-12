'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CategoryCollectionCardProps {
  name: string;
  imageUrl?: string | null;
}

export default function CategoryCollectionCard({
  name,
  imageUrl,
}: CategoryCollectionCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !imageFailed;

  return (
    <Link
      href={`/products?category=${encodeURIComponent(name)}`}
      className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200">
        {showImage ? (
          <img
            src={imageUrl || ''}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_40%)]" />
            <div className="absolute inset-0 opacity-50">
              <div className="absolute left-5 top-5 h-14 w-14 rounded-2xl bg-white/70 blur-sm" />
              <div className="absolute bottom-6 right-6 h-20 w-20 rounded-full bg-sky-200/60 blur-md" />
            </div>
            <div className="relative flex h-full items-center justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white/90 text-3xl font-bold text-slate-700 shadow-lg">
                {name.charAt(0).toUpperCase()}
              </div>
            </div>
          </>
        )}

        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/80 via-slate-900/25 to-transparent" />
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-4 md:px-5">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 md:text-base">
            {name}
          </h3>
          <p className="mt-1 text-xs font-medium text-slate-500 md:text-sm">Explore products</p>
        </div>
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm text-white transition-transform duration-300 group-hover:translate-x-0.5">
          →
        </div>
      </div>
    </Link>
  );
}
