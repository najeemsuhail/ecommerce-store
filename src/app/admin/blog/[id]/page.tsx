'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';

// Simple markdown to HTML converter
const parseMarkdown = (markdown: string): string => {
  let html = markdown
    // Headers
    .replace(/^### (.*?)$/gm, '<h3 className="text-lg font-bold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2 className="text-xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1 className="text-2xl font-bold mt-8 mb-4">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Code blocks
    .replace(/```(.*?)```/gs, '<pre className="bg-gray-100 p-4 rounded overflow-x-auto"><code>$1</code></pre>')
    // Inline code
    .replace(/`(.*?)`/g, '<code className="bg-gray-200 px-2 py-1 rounded">$1</code>')
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener" className="text-blue-600 hover:underline">$1</a>')
    // Lists
    .replace(/^\* (.*?)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul className="list-disc list-inside mb-4">$1</ul>')
    // Blockquotes
    .replace(/^&gt; (.*?)$/gm, '<blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">$1</blockquote>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<)(.+)$/gm, (match) => {
      if (match.startsWith('<')) return match;
      return `<p>${match}</p>`;
    });

  return html;
};

export default function AdminBlogEditPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';
  const [loading, setLoading] = useState(!isNew);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSyntaxGuide, setShowSyntaxGuide] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    author: '',
    published: false,
  });

  useEffect(() => {
    if (!token) {
      router.push('/auth');
      return;
    }
    if (!isNew) {
      fetchBlog();
    }
  }, [token, router]);

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blog/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setFormData(data.blog);
      }
    } catch (error) {
      console.error('Failed to fetch blog');
      setError('Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? '/api/blog' : `/api/blog/${params.id}`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        router.push('/admin/blog');
      } else {
        setError(data.error || 'Failed to save blog');
      }
    } catch (error) {
      console.error('Failed to save blog:', error);
      setError('An error occurred while saving. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{isNew ? 'New Blog' : 'Edit Blog'}</h1>
            <Link href="/admin/blog" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Back to Blogs
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-light-theme rounded-lg shadow p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter blog title"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Slug *</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="url-friendly-slug"
              />
              <p className="text-xs text-gray-500 mt-1">Used in URL: /blog/{formData.slug}</p>
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Author</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Author name"
              />
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Featured Image URL</label>
              <input
                type="url"
                value={formData.featuredImage}
                onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://example.com/image.jpg"
              />
              {formData.featuredImage && (
                <img
                  src={formData.featuredImage}
                  alt="Preview"
                  className="mt-4 h-48 w-full object-cover rounded-lg"
                />
              )}
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Short description for blog listing"
              />
              <p className="text-xs text-gray-500 mt-1">Short description for blog listing</p>
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Content * (Markdown)</label>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors font-medium"
                  >
                    {showPreview ? '✏️ Edit' : '👁️ Preview'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSyntaxGuide(!showSyntaxGuide)}
                    className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors font-medium"
                  >
                    {showSyntaxGuide ? '✕ Close' : '? Syntax'}
                  </button>
                </div>
              </div>

              {/* Syntax Guide */}
              {showSyntaxGuide && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold mb-3 text-sm">Markdown Syntax Guide:</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="font-mono bg-white p-2 rounded mb-1"># Heading 1</p>
                      <p className="font-mono bg-white p-2 rounded mb-1">## Heading 2</p>
                      <p className="font-mono bg-white p-2 rounded mb-1">### Heading 3</p>
                    </div>
                    <div>
                      <p className="font-mono bg-white p-2 rounded mb-1">**bold**</p>
                      <p className="font-mono bg-white p-2 rounded mb-1">*italic*</p>
                      <p className="font-mono bg-white p-2 rounded mb-1">`code`</p>
                    </div>
                    <div>
                      <p className="font-mono bg-white p-2 rounded mb-1">[link](url)</p>
                      <p className="font-mono bg-white p-2 rounded mb-1">* List item</p>
                      <p className="font-mono bg-white p-2 rounded mb-1">Quote</p>
                    </div>
                    <div>
                      <p className="text-gray-600">```code block```</p>
                      <p className="text-gray-600">Double line break for paragraph</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Editor / Preview Toggle */}
              {!showPreview ? (
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={16}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                  placeholder="Write your blog content in Markdown..."
                />
              ) : (
                <div className="w-full border rounded-lg p-6 bg-white prose prose-sm max-w-none">
                  <h2 className="text-2xl font-bold mb-4">{formData.title}</h2>
                  <div className="text-gray-600 mb-6">
                    {formData.author && <span>{formData.author} • </span>}
                    {new Date().toLocaleDateString('en-IN')}
                  </div>
                  <div 
                    className="text-gray-800 leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{
                      __html: formData.content
                        .split('\n\n')
                        .map(paragraph => {
                          // Headers
                          if (paragraph.startsWith('# ')) {
                            return `<h1 class="text-2xl font-bold mt-6 mb-4">${paragraph.substring(2)}</h1>`;
                          }
                          if (paragraph.startsWith('## ')) {
                            return `<h2 class="text-xl font-bold mt-6 mb-3">${paragraph.substring(3)}</h2>`;
                          }
                          if (paragraph.startsWith('### ')) {
                            return `<h3 class="text-lg font-bold mt-4 mb-2">${paragraph.substring(4)}</h3>`;
                          }
                          // Bold
                          let text = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                          // Italic
                          text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
                          // Inline code
                          text = text.replace(/`(.*?)`/g, '<code class="bg-gray-200 px-2 py-1 rounded">$1</code>');
                          // Links
                          text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-blue-600 hover:underline">$1</a>');
                          return `<p class="mb-4">${text}</p>`;
                        })
                        .join('')
                    }}
                  />
                </div>
              )}
            </div>

            {/* Published */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="published" className="text-sm font-medium cursor-pointer text-gray-700">
                Publish this blog
              </label>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-block-primary-md disabled:bg-gray-400 w-full md:w-auto"
          >
            {submitting ? 'Saving...' : 'Save Blog'}
          </button>
        </form>
        </div>
      </div>
    </AdminLayout>
  );
}
