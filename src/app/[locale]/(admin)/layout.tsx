import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
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

  if (!profile || profile.role !== "admin") {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar locale={locale} adminName={`${profile.first_name} ${profile.last_name}`} />
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
