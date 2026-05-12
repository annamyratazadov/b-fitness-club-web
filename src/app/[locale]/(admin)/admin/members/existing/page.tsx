import Link from "next/link";
import { getPackages } from "@/lib/services/packages";
import MemberForm from "@/components/admin/MemberForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, History } from "lucide-react";

export default async function ExistingMemberPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const packages = await getPackages(true);

  return (
    <div className="max-w-4xl">
      <Link href={`/${locale}/admin/members`}>
        <Button variant="ghost" size="sm" className="mb-3">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Üye Listesi
        </Button>
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <History className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mevcut Üye Ekle</h1>
          <p className="text-sm text-gray-500">
            Salonu zaten kullanan üyeyi geçmiş başlangıç tarihi ile sisteme ekleyin.
          </p>
        </div>
      </div>
      <MemberForm packages={packages} locale={locale} mode="existing" />
    </div>
  );
}
