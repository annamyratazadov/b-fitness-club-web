import { notFound } from "next/navigation";
import { getMemberDetail } from "@/lib/services/members";
import MemberForm from "@/components/admin/MemberForm";

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const member = await getMemberDetail(id);

  if (!member) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Üye Düzenle — {member.first_name} {member.last_name}
      </h1>
      <MemberForm packages={[]} locale={locale} member={member} />
    </div>
  );
}
