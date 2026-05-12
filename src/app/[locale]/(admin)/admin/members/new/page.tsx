import { getTranslations } from "next-intl/server";
import { getPackages } from "@/lib/services/packages";
import MemberForm from "@/components/admin/MemberForm";

export default async function NewMemberPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("members");
  const packages = await getPackages(true);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("addMember")}</h1>
      <MemberForm packages={packages} locale={locale} />
    </div>
  );
}
