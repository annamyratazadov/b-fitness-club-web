import { createClient } from "@/lib/supabase/server";

export async function getDashboardStats() {
  const supabase = await createClient();

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const [
    { count: total },
    { count: active },
    { count: passive },
    { count: newThisMonth },
    { count: expiringThisMonth },
    revenueResult,
    popularPackageResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "member"),

    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "member")
      .eq("status", "active"),

    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "member")
      .eq("status", "passive"),

    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "member")
      .gte("created_at", startOfMonth),

    supabase
      .from("memberships")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .gte("end_date", startOfMonth)
      .lte("end_date", endOfMonth),

    supabase
      .from("memberships")
      .select("payment_amount")
      .gte("created_at", startOfMonth),

    supabase
      .from("memberships")
      .select("membership_packages(name)")
      .eq("is_active", true)
      .gte("created_at", startOfMonth),
  ]);

  const monthlyRevenue =
    revenueResult.data?.reduce((sum, m) => sum + (m.payment_amount || 0), 0) ??
    0;

  // Count package occurrences to find most popular
  const packageCounts: Record<string, number> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  popularPackageResult.data?.forEach((m: any) => {
    const pkgs = Array.isArray(m.membership_packages) ? m.membership_packages : [m.membership_packages];
    pkgs.forEach((pkg: { name?: string } | null) => {
      const name = pkg?.name;
      if (name) packageCounts[name] = (packageCounts[name] || 0) + 1;
    });
  });
  const mostPopularPackage =
    Object.entries(packageCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "-";

  return {
    total_members: total ?? 0,
    active_members: active ?? 0,
    passive_members: passive ?? 0,
    new_members_this_month: newThisMonth ?? 0,
    expiring_this_month: expiringThisMonth ?? 0,
    monthly_revenue: monthlyRevenue,
    most_popular_package: mostPopularPackage,
  };
}

export async function getExpiringMemberships(days = 7) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const future = new Date(Date.now() + days * 86400000)
    .toISOString()
    .split("T")[0];

  const { data } = await supabase
    .from("memberships")
    .select(
      `
      id, end_date, member_id,
      profiles!inner(id, first_name, last_name, phone),
      membership_packages(name)
    `
    )
    .eq("is_active", true)
    .gte("end_date", today)
    .lte("end_date", future)
    .order("end_date", { ascending: true });

  return data ?? [];
}

export async function getRecentlyExpiredMemberships(days = 14) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const past = new Date(Date.now() - days * 86400000)
    .toISOString()
    .split("T")[0];

  const { data } = await supabase
    .from("memberships")
    .select(
      `
      id, end_date, member_id,
      profiles!inner(id, first_name, last_name, phone),
      membership_packages(name)
    `
    )
    .eq("is_active", true)
    .lt("end_date", today)
    .gte("end_date", past)
    .order("end_date", { ascending: false });

  return data ?? [];
}
