import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Layout from '@/components/Layout';
import prisma from '@/lib/prisma';

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
};

function renderInlineMarkdown(text: string): ReactNode[] | string {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    if (match[1]) {
      parts.push(
        <strong key={parts.length} className="font-bold">
          {match[1]}
        </strong>
      );
    } else if (match[2]) {
      parts.push(
        <em key={parts.length} className="italic">
          {match[2]}
        </em>
      );
    } else if (match[3]) {
      parts.push(
        <code
          key={parts.length}
          className="rounded-md bg-[color-mix(in_srgb,var(--bg-gray)_86%,white)] px-2 py-1 font-mono text-sm text-dark-theme"
        >
          {match[3]}
        </code>
      );
    } else if (match[4] && match[5]) {
      parts.push(
        <a
          key={parts.length}
          href={match[5]}
          className="theme-inline-link underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {match[4]}
        </a>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

function renderMarkdown(content: string) {
  return content.split('\n\n').map((paragraph, index) => {
    if (paragraph.startsWith('# ')) {
      return (
        <h1 key={index} className="mt-8 mb-4 text-3xl font-bold text-dark-theme">
          {paragraph.substring(2)}
        </h1>
      );
    }

    if (paragraph.startsWith('## ')) {
      return (
        <h2 key={index} className="mt-6 mb-3 text-2xl font-bold text-dark-theme">
          {paragraph.substring(3)}
        </h2>
      );
    }

    if (paragraph.startsWith('### ')) {
      return (
        <h3 key={index} className="mt-4 mb-2 text-xl font-bold text-dark-theme">
          {paragraph.substring(4)}
        </h3>
      );
    }

    if (paragraph.startsWith('* ')) {
      const items = paragraph.split('\n').filter((line) => line.startsWith('* '));

      return (
        <ul key={index} className="mb-4 list-disc space-y-2 pl-6 text-dark-theme">
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInlineMarkdown(item.substring(2))}</li>
          ))}
        </ul>
      );
    }

    if (paragraph.startsWith('> ')) {
      return (
        <blockquote
          key={index}
          className="my-5 border-l-4 border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_6%,var(--bg-light))] py-3 pl-4 italic text-[color:var(--text-light)]"
        >
          {renderInlineMarkdown(paragraph.substring(2))}
        </blockquote>
      );
    }

    if (paragraph.startsWith('```')) {
      const code = paragraph.replace(/```/g, '').trim();

      return (
        <pre
          key={index}
          className="mb-4 overflow-x-auto rounded-xl bg-[color-mix(in_srgb,var(--text-dark)_96%,black)] p-4 text-sm text-white"
        >
          <code>{code}</code>
        </pre>
      );
    }

    return (
      <p key={index} className="mb-4 leading-relaxed text-dark-theme">
        {renderInlineMarkdown(paragraph)}
      </p>
    );
  });
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;

  const blog = await prisma.blog.findFirst({
    where: {
      slug,
      published: true,
    },
  });

  if (!blog) {
    notFound();
  }

  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Layout>
      <div className="theme-page-shell min-h-screen">
        <div className="px-4 py-12">
          <div className="mx-auto max-w-4xl">
            <Link href="/blog" className="theme-inline-link mb-6 inline-flex items-center gap-2 text-sm font-medium underline">
              <span aria-hidden="true">&larr;</span>
              <span>Back to Blog</span>
            </Link>

            <div className="theme-surface mb-8 overflow-hidden p-8 md:p-10">
              <div className="theme-heading-rule mb-4 h-1 w-20" />
              <h1 className="mb-4 text-4xl font-bold text-dark-theme md:text-5xl">
                {blog.title}
              </h1>
              <div className="theme-info-note flex flex-wrap items-center gap-3 text-sm md:text-base">
                {blog.author && <span>{blog.author}</span>}
                {blog.author && <span aria-hidden="true">&bull;</span>}
                <span>{formattedDate}</span>
              </div>
            </div>

            {blog.featuredImage && (
              <div className="theme-surface mb-8 overflow-hidden p-3">
                <div className="theme-product-media overflow-hidden rounded-[calc(var(--radius-lg)+0.125rem)]">
                  <img
                    src={blog.featuredImage}
                    alt={blog.title}
                    className="h-72 w-full object-cover md:h-96"
                  />
                </div>
              </div>
            )}

            <div className="theme-surface mb-8 p-8 md:p-10">
              {blog.content.trim().startsWith('<') ? (
                <div
                  className="prose prose-lg max-w-none prose-headings:text-[color:var(--text-dark)] prose-p:text-[color:var(--text-dark)] prose-strong:text-[color:var(--text-dark)] prose-li:text-[color:var(--text-dark)] prose-blockquote:text-[color:var(--text-light)] prose-blockquote:border-l-[var(--primary)] prose-a:text-[color:var(--primary)] hover:prose-a:text-[color:var(--primary-hover)]"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              ) : (
                <div className="text-base md:text-lg">
                  {renderMarkdown(blog.content)}
                </div>
              )}
            </div>

            <div className="theme-surface theme-surface-accent p-6 md:p-8">
              <h2 className="mb-2 text-2xl font-bold text-dark-theme">Interested in our products?</h2>
              <p className="mb-5 text-base text-dark-theme">
                Check out our collection of quality products mentioned in this blog.
              </p>
              <Link href="/products" className="theme-cta-primary">
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
