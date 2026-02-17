import React from 'react';
import { Metadata } from 'next';

type Props = { params: { slug: string } };

async function fetchProduct(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/products/${encodeURIComponent(slug)}`, { next: { revalidate: 300 } });
  if (!res.ok) return null;
  const data = await res.json();
  return data.product ?? null;
}

export default async function Head({ params }: Props) {
  const product = await fetchProduct(params.slug);

  const title = product?.metaTitle || product?.name || 'Product';
  const description =
    product?.metaDescription ||
    (product?.description ? product.description.replace(/<[^>]+>/g, '').slice(0, 160) : '');

  const image = product?.images?.[0];

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </>
  );
}
