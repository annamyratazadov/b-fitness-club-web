import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MemberHeader from "@/components/member/MemberHeader";

export default async function MemberLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "member") {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberHeader locale={locale} memberName={`${profile.first_name} ${profile.last_name}`} />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
