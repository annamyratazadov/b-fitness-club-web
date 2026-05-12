"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

export default function MemberSearchFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
        params.delete("page");
      });
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = useDebouncedCallback((value: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ search: value })}`);
    });
  }, 350);

  const handleStatus = (value: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ status: value })}`);
    });
  };

  const handlePackageType = (value: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ packageType: value })}`);
    });
  };

  return (
    <div className="bg-white rounded-xl border p-4 mb-4 flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        {isPending ? (
          <Loader2 className="absolute left-3 top-2.5 w-4 h-4 text-orange-400 animate-spin" />
        ) : (
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        )}
        <Input
          placeholder="İsim veya telefon ile ara..."
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <select
        defaultValue={searchParams.get("status") ?? ""}
        onChange={(e) => handleStatus(e.target.value)}
        className="px-3 py-2 border rounded-md text-sm text-gray-600 bg-white"
      >
        <option value="">Tüm Durumlar</option>
        <option value="active">Aktif</option>
        <option value="passive">Pasif</option>
      </select>

      <select
        defaultValue={searchParams.get("packageType") ?? ""}
        onChange={(e) => handlePackageType(e.target.value)}
        className="px-3 py-2 border rounded-md text-sm text-gray-600 bg-white"
      >
        <option value="">Tüm Paketler</option>
        <option value="student">Öğrenci</option>
        <option value="normal">Normal</option>
      </select>
    </div>
  );
}
