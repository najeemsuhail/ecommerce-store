import Layout from '@/components/Layout';

export default function Loading() {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-160px)] bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6 h-4 w-56 animate-pulse rounded bg-gray-200" />

          <div className="mb-8 rounded-lg bg-white p-4 shadow-lg">
            <div className="mb-4 h-12 animate-pulse rounded bg-gray-200" />
            <div className="flex flex-wrap gap-2">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-10 w-28 animate-pulse rounded bg-gray-200" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="rounded-lg bg-white p-4 shadow-lg">
                <div className="mb-4 aspect-square animate-pulse rounded bg-gray-200" />
                <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="mb-4 h-4 w-5/6 animate-pulse rounded bg-gray-200" />
                <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
