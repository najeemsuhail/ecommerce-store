import { notFound } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { getProductDetailBySlug } from '@/lib/productDetail';
import ProductImageGallery from './ProductImageGallery';
import ProductPurchasePanel from './ProductPurchasePanel';
import ProductDetailEnhancements from './ProductDetailEnhancements';

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductDetailBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <Layout>
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

                {product.brand && <p className="mb-1 text-gray-600">Brand: {product.brand}</p>}

                {product.categories.length > 0 && (
                  <div className="mb-4">
                    <span className="text-gray-600">Categories: </span>
                    {product.categories.map((cat, idx) => (
                      <span
                        key={cat.category?.id || cat.categoryId}
                        className="mr-2 inline-block text-sm font-medium text-primary-theme"
                      >
                        {cat.category?.name || cat.categoryId}
                        {idx < product.categories.length - 1 && ','}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mb-6">
                  <div className="mb-2 flex items-center gap-4">
                    <span className="text-4xl font-bold text-primary-theme">
                      {'₹'}
                      {product.price.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
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
    </Layout>
  );
}
