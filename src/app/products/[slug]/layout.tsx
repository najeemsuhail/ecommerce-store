import { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;  // ← Promise now
  children: React.ReactNode;
};

async function fetchProduct(slug: string) {
  try {
    const url = `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/products/${encodeURIComponent(slug)}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.product ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;  // ← await here
  const product = await fetchProduct(slug);

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