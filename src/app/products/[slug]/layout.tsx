import { Metadata } from 'next';
import { getProductMetadataBySlug } from '@/lib/productDetail';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductMetadataBySlug(slug);

  const title = product?.metaTitle || product?.name || 'Product';
  const description =
    product?.metaDescription ||
    (product?.description
      ? product.description.replace(/<[^>]+>/g, '').slice(0, 160)
      : '');
  const image = product?.images?.[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(image && { images: [image] }),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
