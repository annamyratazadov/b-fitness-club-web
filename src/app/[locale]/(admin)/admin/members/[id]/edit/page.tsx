import { notFound } from "next/navigation";
import Link from "next/link";
import { getMemberDetail } from "@/lib/services/members";
import MemberForm from "@/components/admin/MemberForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit3 } from "lucide-react";

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const member = await getMemberDetail(id);

  if (!member) notFound();

  return (
    <div className="max-w-4xl">
      <Link href={`/${locale}/admin/members/${id}`}>
        <Button variant="ghost" size="sm" className="mb-3">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Üye Detayı
        </Button>
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <Edit3 className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {member.first_name} {member.last_name}
          </h1>
          <p className="text-sm text-gray-500">Üye bilgilerini düzenleyin.</p>
        </div>
      </div>
      <MemberForm packages={[]} locale={locale} member={member} />
    </div>
  );
}
