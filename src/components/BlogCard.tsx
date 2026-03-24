import Link from 'next/link';

interface BlogCardProps {
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  author?: string;
  createdAt: string;
}

export default function BlogCard({
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
    <Link href={`/blog/${slug}`} className="block h-full">
      <div className="theme-product-card group h-full overflow-hidden">
        {featuredImage && (
          <div className="theme-product-media h-48 w-full overflow-hidden">
            <img
              src={featuredImage}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-6">
          <h3 className="mb-2 line-clamp-2 text-lg font-bold text-dark-theme transition-colors group-hover:text-primary-theme">
            {title}
          </h3>
          {excerpt && (
            <p className="theme-info-note mb-4 line-clamp-3 text-sm">{excerpt}</p>
          )}
          <div className="theme-info-note flex items-center justify-between gap-3 text-xs">
            <span>{date}</span>
            {author && <span className="truncate">{author}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
