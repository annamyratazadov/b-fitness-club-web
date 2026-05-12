export default function NotificationsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-1">
        <div className="h-8 w-52 bg-gray-200 rounded-lg" />
        <div className="h-4 w-64 bg-gray-100 rounded" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg" />
              <div className="space-y-1.5">
                <div className="h-6 w-8 bg-gray-200 rounded" />
                <div className="h-3 w-32 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-4 py-4 border-b bg-gray-50">
          <div className="h-5 w-36 bg-gray-200 rounded" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="h-4 w-28 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-100 rounded" />
              <div className="h-5 w-16 bg-gray-100 rounded-full" />
              <div className="h-4 w-28 bg-gray-100 rounded" />
              <div className="h-5 w-20 bg-gray-100 rounded-full ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
