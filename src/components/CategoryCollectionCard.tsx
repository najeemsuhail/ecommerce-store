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
      className="theme-product-card group block overflow-hidden"
    >
      <div className="theme-product-media relative aspect-[4/5] overflow-hidden">
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_45%),radial-gradient(circle_at_bottom_right,color-mix(in_srgb,var(--gradient-accent)_16%,transparent),transparent_40%)]" />
            <div className="absolute inset-0 opacity-50">
              <div className="absolute left-5 top-5 h-14 w-14 rounded-2xl bg-white/70 blur-sm" />
              <div className="absolute bottom-6 right-6 h-20 w-20 rounded-full bg-[color-mix(in_srgb,var(--primary)_28%,white)] blur-md" />
            </div>
            <div className="relative flex h-full items-center justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white/90 text-3xl font-bold text-dark-theme shadow-lg">
                {name.charAt(0).toUpperCase()}
              </div>
            </div>
          </>
        )}

        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-4 md:px-5">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold text-dark-theme md:text-base">
            {name}
          </h3>
          <p className="theme-info-note mt-1 text-xs font-medium md:text-sm">Explore products</p>
        </div>
        <div className="theme-action-fab flex h-10 w-10 flex-shrink-0 items-center justify-center text-sm transition-transform duration-300 group-hover:translate-x-0.5">
          &rarr;
        </div>
      </div>
    </Link>
  );
}
