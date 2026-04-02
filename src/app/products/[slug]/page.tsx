import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { formatPrice } from '@/lib/currency';
import { getProductDetailBySlug } from '@/lib/productDetail';
import ProductImageGallery from './ProductImageGallery';
import ProductPurchasePanel from './ProductPurchasePanel';

const ProductDetailEnhancements = dynamic(() => import('./ProductDetailEnhancements'), {
  loading: () => (
    <div className="mt-12">
      <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
        Scroll down to load recommendations and review tools.
      </div>
    </div>
  ),
});

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
};

function ProductDetailSkeleton() {
  return (
    <div className="min-h-[calc(100vh-160px)] bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 h-4 w-56 animate-pulse rounded bg-gray-200" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-4 shadow-lg">
            <div className="aspect-square animate-pulse rounded bg-gray-200" />
            <div className="mt-4 flex gap-2">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-20 w-20 animate-pulse rounded-lg bg-gray-200" />
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-3 h-10 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="mb-2 h-5 w-40 animate-pulse rounded bg-gray-200" />
            <div className="mb-6 h-10 w-48 animate-pulse rounded bg-gray-200" />
            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="mt-8 h-14 w-64 animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="rounded-lg bg-white p-4 shadow-lg">
              <div className="mb-4 aspect-square animate-pulse rounded bg-gray-200" />
              <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function ProductDetailContent({ slug }: { slug: string }) {
  const product = await getProductDetailBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-primary-theme">
            Home
          </Link>
          {' / '}
          <Link href="/products" className="hover:text-primary-theme">
            Products
          </Link>
          {' / '}
          <span>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <ProductImageGallery
            productName={product.name}
            images={product.images}
            videoUrl={product.videoUrl}
          />

          <div>
            <div className="rounded-lg bg-light-theme p-6 shadow-lg">
              <h1 className="mb-2 text-3xl font-bold">{product.name}</h1>

              <div className="mb-6">
                <div className="mb-2 flex items-center gap-4">
                  <span className="text-4xl font-bold text-primary-theme">{formatPrice(product.price)}</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="prose prose-sm max-w-none text-gray-700" style={{ lineHeight: 1.7 }}>
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  <style>{`
                    .prose ul, .prose ol {
                      margin-left: 1.5em;
                      padding-left: 1.2em;
                    }
                    .prose ul {
                      list-style-type: disc !important;
                    }
                    .prose ol {
                      list-style-type: decimal !important;
                    }
                    .prose li {
                      margin-bottom: 0.3em;
                      font-size: 1em;
                    }
                  `}</style>
                </div>
              </div>

              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-2 text-lg font-semibold">Specifications</h3>
                  <div className="space-y-2 rounded bg-gray-50 p-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-semibold">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <ProductPurchasePanel
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  images: product.images,
                  isDigital: product.isDigital,
                  isActive: product.isActive,
                  stock: product.stock,
                  weight: product.weight,
                  variants: product.variants,
                }}
              />
            </div>
          </div>
        </div>

        <div id="deferred-sections-anchor" className="h-1 w-full" />
        <ProductDetailEnhancements
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            images: product.images,
            price: product.price,
            isDigital: product.isDigital,
            isActive: product.isActive,
            weight: product.weight,
          }}
        />
      </div>
    </div>
  );
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  return (
    <Layout>
      <Suspense key={slug} fallback={<ProductDetailSkeleton />}>
        <ProductDetailContent slug={slug} />
      </Suspense>
    </Layout>
  );
}
