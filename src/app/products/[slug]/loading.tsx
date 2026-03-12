import Layout from '@/components/Layout';

export default function Loading() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
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
        </div>
      </div>
    </Layout>
  );
}
