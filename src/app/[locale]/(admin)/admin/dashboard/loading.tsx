export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="h-8 w-48 bg-gray-200 rounded-lg" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="w-9 h-9 bg-gray-100 rounded-lg" />
            </div>
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Two list cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white rounded-xl border overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <div className="h-5 w-40 bg-gray-200 rounded" />
            </div>
            <div className="divide-y">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between p-4">
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-24 bg-gray-100 rounded" />
                  </div>
                  <div className="h-5 w-16 bg-gray-100 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
