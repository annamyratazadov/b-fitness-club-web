"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Bir hata oluştu</h2>
      <p className="text-gray-500 text-sm mb-6 max-w-sm">
        Sayfa yüklenirken beklenmeyen bir sorun yaşandı. Lütfen tekrar deneyin.
      </p>
      {error.digest && (
        <p className="text-xs text-gray-400 mb-4 font-mono">Hata kodu: {error.digest}</p>
      )}
      <Button
        onClick={reset}
        className="bg-orange-500 hover:bg-orange-600 flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Tekrar Dene
      </Button>
    </div>
  );
}
