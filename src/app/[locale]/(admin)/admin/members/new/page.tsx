import Link from "next/link";
import { getPackages } from "@/lib/services/packages";
import MemberForm from "@/components/admin/MemberForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus } from "lucide-react";

export default async function NewMemberPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const packages = await getPackages(true);

  return (
    <div className="max-w-5xl">
      <Link href={`/${locale}/admin/members`}>
        <Button variant="ghost" size="sm" className="mb-3">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Üye Listesi
        </Button>
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yeni Üye Ekle</h1>
          <p className="text-sm text-gray-500">Üyelik bugünden başlatılır.</p>
        </div>
      </div>
      <MemberForm packages={packages} locale={locale} mode="new" />
    </div>
  );
}
