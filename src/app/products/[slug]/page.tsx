import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import { getProductDetailBySlug } from '@/lib/productDetail';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductDetailBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient key={product.id} product={product} />;
}
