import Layout from '@/components/Layout';
import ProductsClientPage from './ProductsClientPage';
import { getInitialProductsPageData } from '@/lib/productsListing';

type ProductsPageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string | string[];
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  const initialSearchTerm = resolvedSearchParams.search?.trim() || '';
  const initialCategories = Array.isArray(resolvedSearchParams.category)
    ? resolvedSearchParams.category.filter(Boolean)
    : resolvedSearchParams.category
      ? [resolvedSearchParams.category]
      : [];

  const initialData = await getInitialProductsPageData({
    search: initialSearchTerm || undefined,
    categories: initialCategories,
    sort: 'newest',
    limit: 12,
  });

  return (
    <Layout>
      <ProductsClientPage
        initialProducts={initialData.products}
        initialTotal={initialData.total}
        initialFacets={initialData.facets}
        initialDefaultFacets={initialData.facets}
        initialCategoryHierarchy={initialData.categoryHierarchy}
        initialSearchTerm={initialSearchTerm}
        initialCategories={initialCategories}
      />
    </Layout>
  );
}
