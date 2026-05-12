"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Member = any & {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  status: string;
  active_membership: Record<string, unknown> | null;
  days_remaining: number | null;
}

interface Props {
  members: Member[];
  locale: string;
  page: number;
  totalPages: number;
}

export default function MembersTable({ members, locale, page, totalPages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  };

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-xl border">
        <div className="py-16 text-center text-gray-400">
          <p className="text-lg">Üye bulunamadı</p>
          <p className="text-sm mt-1">Arama kriterlerinizi değiştirin veya yeni üye ekleyin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Ad Soyad</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Telefon</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Paket</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Bitiş</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kalan</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Durum</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {members.map((member) => {
              const days = member.days_remaining;
              const daysColor =
                days === null
                  ? "text-gray-400"
                  : days === 0
                  ? "text-red-600 font-bold"
                  : days <= 3
                  ? "text-red-500 font-semibold"
                  : days <= 7
                  ? "text-orange-500 font-semibold"
                  : "text-green-600";

              return (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {member.first_name} {member.last_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{member.phone}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {member.active_membership?.membership_packages?.name ?? (
                      <span className="text-gray-400 italic">Paket yok</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {member.active_membership?.end_date
                      ? new Date(member.active_membership.end_date).toLocaleDateString("tr-TR")
                      : "-"}
                  </td>
                  <td className={cn("px-4 py-3", daysColor)}>
                    {days === null ? "-" : days === 0 ? "Doldu" : `${days} gün`}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        member.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }
                    >
                      {member.status === "active" ? "Aktif" : "Pasif"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/${locale}/admin/members/${member.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
          <p className="text-sm text-gray-500">
            Sayfa {page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
