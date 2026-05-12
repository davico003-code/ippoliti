export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="h-[60vh] bg-gray-200" />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 space-y-4">
              <div className="h-8 w-3/4 bg-gray-200 rounded" />
              <div className="h-5 w-1/2 bg-gray-200 rounded" />
              <div className="h-10 w-1/3 bg-gray-200 rounded" />
            </div>
            <div className="bg-white rounded-2xl p-6">
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 space-y-4">
              <div className="h-5 w-2/3 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded-xl" />
              <div className="h-12 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
