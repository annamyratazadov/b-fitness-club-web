export default function MemberDashboardLoading() {
  return (
    <div className="max-w-xl mx-auto space-y-5 animate-pulse">
      {/* Greeting */}
      <div className="space-y-2">
        <div className="h-8 w-56 bg-gray-200 rounded-lg" />
        <div className="h-4 w-40 bg-gray-100 rounded" />
      </div>

      {/* Membership status card */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-5 space-y-4">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="text-center space-y-3">
          <div className="h-20 w-24 bg-gray-100 rounded-xl mx-auto" />
          <div className="h-4 w-20 bg-gray-100 rounded mx-auto" />
          <div className="h-3 bg-gray-100 rounded-full w-full" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-1 text-left">
                <div className="h-3 w-10 bg-gray-200 rounded" />
                <div className="h-4 w-20 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-24 bg-gray-200 rounded" />
          <div className="h-5 w-16 bg-gray-100 rounded-full" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50">
            <div className="w-7 h-7 bg-orange-50 rounded-lg shrink-0" />
            <div className="space-y-1">
              <div className="h-3 w-14 bg-gray-100 rounded" />
              <div className="h-4 w-28 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
