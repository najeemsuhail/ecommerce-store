import Link from 'next/link';
import Layout from '@/components/Layout';
import BlogCard from '@/components/BlogCard';
import { getPublishedBlogs } from '@/lib/blog';

export const revalidate = 300;

type Props = {
  searchParams?: Promise<{ page?: string }>;
};

function buildBlogPageHref(page: number) {
  return page <= 1 ? '/blog' : `/blog?page=${page}`;
}

export default async function BlogPage({ searchParams }: Props) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const rawPage = resolvedSearchParams.page;
  const parsedPage = Number.parseInt(rawPage ?? '1', 10);
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const { blogs, pagination } = await getPublishedBlogs(currentPage, 9);

  return (
    <Layout>
      <div className="theme-page-shell min-h-screen">
        <div className="px-4 py-16">
          <div className="mx-auto max-w-6xl text-center">
            <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/20 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_78%,black)_0%,color-mix(in_srgb,var(--gradient-accent)_74%,black)_100%)] px-6 py-12 text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
              <div className="mx-auto mb-4 h-1 w-20 rounded-full bg-white/70" />
              <h1 className="mb-4 text-4xl font-bold md:text-5xl">Our Blog</h1>
              <p className="mx-auto max-w-2xl text-xl text-white/80">
                Tips, trends, and insights for smart shopping
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-16">
          {blogs.length === 0 ? (
            <div className="theme-surface py-12 text-center">
              <p className="theme-info-note">No blogs available yet</p>
            </div>
          ) : (
            <>
              <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {blogs.map((blog) => (
                  <BlogCard
                    key={blog.id}
                    title={blog.title}
                    slug={blog.slug}
                    excerpt={blog.excerpt ?? undefined}
                    featuredImage={blog.featuredImage ?? undefined}
                    author={blog.author ?? undefined}
                    createdAt={blog.createdAt.toISOString()}
                  />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href={buildBlogPageHref(Math.max(currentPage - 1, 1))}
                    className={`theme-cta-secondary min-w-24 ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                    aria-disabled={currentPage === 1}
                  >
                    Previous
                  </Link>

                  {Array.from({ length: pagination.pages }, (_, index) => index + 1).map((page) => (
                    <Link
                      key={page}
                      href={buildBlogPageHref(page)}
                      className={page === currentPage ? 'theme-cta-primary min-w-12' : 'theme-cta-secondary min-w-12'}
                      aria-current={page === currentPage ? 'page' : undefined}
                    >
                      {page}
                    </Link>
                  ))}

                  <Link
                    href={buildBlogPageHref(Math.min(currentPage + 1, pagination.pages))}
                    className={`theme-cta-secondary min-w-24 ${currentPage === pagination.pages ? 'pointer-events-none opacity-50' : ''}`}
                    aria-disabled={currentPage === pagination.pages}
                  >
                    Next
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
