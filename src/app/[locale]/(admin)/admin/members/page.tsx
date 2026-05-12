import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus, History } from "lucide-react";
import { getMembers } from "@/lib/services/members";
import MembersTable from "@/components/admin/MembersTable";
import MemberSearchFilter from "@/components/admin/MemberSearchFilter";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    search?: string;
    status?: string;
    packageType?: string;
    page?: string;
  }>;
}

export default async function MembersPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations("members");

  const page = parseInt(sp.page ?? "1");
  const { data: members, count, totalPages } = await getMembers({
    search: sp.search,
    status: sp.status as "active" | "passive" | "",
    packageType: sp.packageType as "student" | "normal" | "",
    page,
  });

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Toplam <span className="font-semibold text-gray-700">{count}</span> üye
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href={`/${locale}/admin/members/existing`}>
            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
              <History className="w-4 h-4 mr-2" />
              Mevcut Üye Ekle
            </Button>
          </Link>
          <Link href={`/${locale}/admin/members/new`}>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <UserPlus className="w-4 h-4 mr-2" />
              Yeni Üye Ekle
            </Button>
          </Link>
        </div>
      </div>

      <MemberSearchFilter />

      <MembersTable
        members={members}
        locale={locale}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
