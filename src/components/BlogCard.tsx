'use client';

import Link from 'next/link';

interface BlogCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  author?: string;
  createdAt: string;
}

export default function BlogCard({
  id,
  title,
  slug,
  excerpt,
  featuredImage,
  author,
  createdAt,
}: BlogCardProps) {
  const date = new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Link href={`/blog/${slug}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden h-full cursor-pointer">
        {featuredImage && (
          <div className="w-full h-48 bg-gray-200 overflow-hidden">
            <img
              src={featuredImage}
              alt={title}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          </div>
        )}
        <div className="p-6">
          <h3 className="text-lg font-bold mb-2 line-clamp-2 hover:text-blue-600">
            {title}
          </h3>
          {excerpt && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{excerpt}</p>
          )}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{date}</span>
            {author && <span>{author}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
