'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import Link from 'next/link';

// Helper function to render inline markdown (bold, italic, code, links)
function renderInlineMarkdown(text: string) {
  const parts = [];
  let lastIndex = 0;

  // Regex for **bold**, *italic*, `code`, and [link](url)
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    if (match[1]) {
      // Bold
      parts.push(
        <strong key={parts.length} className="font-bold">
          {match[1]}
        </strong>
      );
    } else if (match[2]) {
      // Italic
      parts.push(
        <em key={parts.length} className="italic">
          {match[2]}
        </em>
      );
    } else if (match[3]) {
      // Code
      parts.push(
        <code key={parts.length} className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
          {match[3]}
        </code>
      );
    } else if (match[4] && match[5]) {
      // Link
      parts.push(
        <a
          key={parts.length}
          href={match[5]}
          className="text-blue-600 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {match[4]}
        </a>
      );
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export default function BlogDetailPage() {
  const params = useParams() as { slug: string };
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      fetchBlog();
    }
  }, [params.slug]);

  const fetchBlog = async () => {
    try {
      // Fetch blog by slug
      const response = await fetch(`/api/blog/slug/${params.slug}`);
      const data = await response.json();
      if (data.success && data.blog) {
        setBlog(data.blog);
      } else {
        setBlog(null);
      }
    } catch (error) {
      console.error('Failed to fetch blog:', error);
      setBlog(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!blog) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Blog not found</h1>
            <Link href="/blog" className="text-blue-600 hover:underline">
              ← Back to Blog
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link href="/blog" className="text-blue-600 hover:underline mb-4 inline-block">
              ← Back to Blog
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{blog.title}</h1>
            <div className="flex items-center gap-4 text-gray-600">
              {blog.author && <span>{blog.author}</span>}
              <span>
                {new Date(blog.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Featured Image */}
          {blog.featuredImage && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={blog.featuredImage}
                alt={blog.title}
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="bg-white rounded-lg shadow p-8 mb-8">
            <div className="prose prose-lg max-w-none text-gray-700">
              {/* Check if content is HTML or Markdown */}
              {blog.content.trim().startsWith('<') ? (
                // Render as HTML
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              ) : (
                // Render as Markdown
                <>
                  {blog.content.split('\n\n').map((paragraph: string, index: number) => {
                    // Headers
                    if (paragraph.startsWith('# ')) {
                      return (
                        <h1 key={index} className="text-3xl font-bold mt-8 mb-4">
                          {paragraph.substring(2)}
                        </h1>
                      );
                    }
                    if (paragraph.startsWith('## ')) {
                      return (
                        <h2 key={index} className="text-2xl font-bold mt-6 mb-3">
                          {paragraph.substring(3)}
                        </h2>
                      );
                    }
                    if (paragraph.startsWith('### ')) {
                      return (
                        <h3 key={index} className="text-xl font-bold mt-4 mb-2">
                          {paragraph.substring(4)}
                        </h3>
                      );
                    }

                    // Lists
                    if (paragraph.startsWith('* ')) {
                      const items = paragraph.split('\n').filter(line => line.startsWith('* '));
                      return (
                        <ul key={index} className="list-disc list-inside mb-4 space-y-2">
                          {items.map((item, i) => (
                            <li key={i} className="text-gray-700">
                              {renderInlineMarkdown(item.substring(2))}
                            </li>
                          ))}
                        </ul>
                      );
                    }

                    // Blockquotes
                    if (paragraph.startsWith('> ')) {
                      return (
                        <blockquote
                          key={index}
                          className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4 py-2"
                        >
                          {renderInlineMarkdown(paragraph.substring(2))}
                        </blockquote>
                      );
                    }

                    // Code blocks
                    if (paragraph.startsWith('```')) {
                      const code = paragraph.replace(/```/g, '').trim();
                      return (
                        <pre key={index} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                          <code>{code}</code>
                        </pre>
                      );
                    }

                    // Regular paragraphs
                    return (
                      <p key={index} className="mb-4 leading-relaxed">
                        {renderInlineMarkdown(paragraph)}
                      </p>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold mb-2">Interested in our products?</h3>
            <p className="text-gray-700 mb-4">
              Check out our collection of quality products mentioned in this blog.
            </p>
            <Link
              href="/products"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
