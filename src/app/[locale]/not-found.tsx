import Link from "next/link";
import { Dumbbell } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mb-6">
        <Dumbbell className="w-10 h-10 text-orange-500" />
      </div>

      <h1 className="text-7xl font-black text-gray-200 mb-2">404</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Sayfa Bulunamadı</h2>
      <p className="text-gray-500 text-sm mb-8 max-w-sm">
        Aradığınız sayfa mevcut değil ya da taşınmış olabilir.
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
