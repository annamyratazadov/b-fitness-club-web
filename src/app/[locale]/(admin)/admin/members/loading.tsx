export default function MembersLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-gray-200 rounded-lg" />
          <div className="h-4 w-24 bg-gray-100 rounded" />
        </div>
        <div className="h-9 w-32 bg-gray-200 rounded-lg" />
      </div>

      {/* Search/filter bar */}
      <div className="bg-white rounded-xl border p-4 flex gap-3">
        <div className="flex-1 h-9 bg-gray-100 rounded-md" />
        <div className="h-9 w-32 bg-gray-100 rounded-md" />
        <div className="h-9 w-32 bg-gray-100 rounded-md" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="bg-gray-50 border-b px-4 py-3 flex gap-4">
          {["Ad Soyad", "Telefon", "Paket", "Bitiş", "Kalan", "Durum", ""].map((h, i) => (
            <div key={i} className="h-4 w-16 bg-gray-200 rounded" />
          ))}
        </div>
        <div className="divide-y">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="h-4 w-28 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-100 rounded" />
              <div className="h-4 w-20 bg-gray-100 rounded" />
              <div className="h-4 w-20 bg-gray-100 rounded" />
              <div className="h-4 w-12 bg-gray-100 rounded" />
              <div className="h-5 w-12 bg-gray-100 rounded-full" />
              <div className="h-7 w-7 bg-gray-100 rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
