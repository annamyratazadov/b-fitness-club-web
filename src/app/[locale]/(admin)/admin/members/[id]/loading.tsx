export default function MemberDetailLoading() {
  return (
    <div className="max-w-4xl space-y-6 animate-pulse">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-28 bg-gray-200 rounded-lg" />
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-gray-100 rounded-lg" />
          <div className="h-9 w-24 bg-gray-100 rounded-lg" />
          <div className="h-9 w-24 bg-gray-100 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile card */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div className="h-5 w-32 bg-gray-200 rounded" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg shrink-0" />
              <div className="space-y-1.5">
                <div className="h-3 w-16 bg-gray-100 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Membership status card */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-20 w-24 bg-gray-100 rounded-lg mx-auto" />
          <div className="h-3 bg-gray-100 rounded-full w-full" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-1">
                <div className="h-3 w-12 bg-gray-200 rounded" />
                <div className="h-4 w-20 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="h-5 w-36 bg-gray-200 rounded" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4">
              <div className="space-y-1.5">
                <div className="h-4 w-28 bg-gray-200 rounded" />
                <div className="h-3 w-40 bg-gray-100 rounded" />
              </div>
              <div className="text-right space-y-1.5">
                <div className="h-4 w-16 bg-gray-200 rounded" />
                <div className="h-5 w-12 bg-gray-100 rounded-full ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
