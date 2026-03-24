'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BlogCard from './BlogCard';

type BlogListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  author?: string | null;
  createdAt: string;
};

export default function LatestBlogPostsSection() {
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchLatestBlogs = async () => {
      try {
        const response = await fetch('/api/blog?limit=3');
        const data = await response.json();

        if (mounted && data.success) {
          setBlogs(data.blogs ?? []);
        }
      } catch (error) {
        console.error('Failed to fetch blogs', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchLatestBlogs();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="theme-section-shell px-4 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--primary)]" />
        </div>
      </section>
    );
  }

  if (blogs.length === 0) {
    return null;
  }

  return (
    <section className="theme-section-shell px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="theme-heading-rule mx-auto mb-4 h-1 w-20" />
          <h2 className="mb-4 text-3xl font-bold text-dark-theme md:text-4xl">
            Latest from Our Blog
          </h2>
          <p className="theme-info-note mx-auto max-w-2xl text-lg">
            Tips, trends, and insights to help you make the best purchasing decisions
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          {blogs.map((blog) => (
            <BlogCard
              key={blog.id}
              title={blog.title}
              slug={blog.slug}
              excerpt={blog.excerpt ?? undefined}
              featuredImage={blog.featuredImage ?? undefined}
              author={blog.author ?? undefined}
              createdAt={blog.createdAt}
            />
          ))}
        </div>

        <div className="text-center">
          <Link href="/blog" className="theme-cta-primary">
            Read All Blog Posts
          </Link>
        </div>
      </div>
    </section>
  );
}
