import Layout from '@/components/Layout';

export default function Loading() {
  return (
    <Layout>
      <div className="min-h-screen bg-bg-gray">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-bg-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
              <div className="hidden lg:block bg-light-theme rounded-lg shadow p-6 h-fit space-y-6">
                <div className="h-6 bg-gray-200 rounded w-24"></div>
                <div className="space-y-3">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div>
                <div className="h-12 bg-bg-200 rounded mb-4"></div>
                <div className="flex gap-2 mb-8">
                  <div className="h-10 bg-bg-200 rounded w-32"></div>
                  <div className="h-10 bg-bg-200 rounded w-32"></div>
                  <div className="h-10 bg-bg-200 rounded w-32"></div>
                </div>
                <div className="grid grid-cols-2 grid-rows-2 md:grid-cols-2 md:grid-rows-none lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="bg-light-theme rounded-lg shadow p-4">
                      <div className="aspect-square bg-bg-200 rounded mb-4"></div>
                      <div className="h-6 bg-bg-200 rounded mb-2"></div>
                      <div className="h-4 bg-bg-200 rounded mb-4"></div>
                      <div className="h-10 bg-bg-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
