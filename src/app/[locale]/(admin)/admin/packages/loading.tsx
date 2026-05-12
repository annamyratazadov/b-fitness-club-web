export default function PackagesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-36 bg-gray-200 rounded-lg" />
        <div className="h-9 w-32 bg-gray-200 rounded-lg" />
      </div>

      {["Öğrenci Paketleri", "Normal Paketler"].map((label, i) => (
        <div key={i} className="space-y-3">
          <div className="h-5 w-36 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="bg-white rounded-xl border p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="h-5 w-28 bg-gray-200 rounded" />
                    <div className="h-3 w-16 bg-gray-100 rounded" />
                  </div>
                  <div className="h-5 w-12 bg-gray-100 rounded-full" />
                </div>
                <div className="h-8 w-20 bg-gray-100 rounded" />
                <div className="flex gap-2 pt-1">
                  <div className="h-8 flex-1 bg-gray-100 rounded" />
                  <div className="h-8 w-8 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
