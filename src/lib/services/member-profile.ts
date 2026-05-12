import { createClient } from "@/lib/supabase/server";

export async function getMemberProfile(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id, first_name, last_name, phone, birth_date, birth_place,
      occupation, address, status, language, created_at,
      memberships(
        id, start_date, end_date, payment_amount, is_active, created_at,
        membership_packages(id, name, package_type, duration_days, price)
      )
    `
    )
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  const today = new Date().toISOString().split("T")[0];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeMembership = (data.memberships as any[])?.find((m) => m.is_active) ?? null;

  const daysRemaining = activeMembership
    ? Math.max(
        0,
        Math.ceil(
          (new Date(activeMembership.end_date).getTime() -
            new Date(today).getTime()) /
            86400000
        )
      )
    : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortedMemberships = [...((data.memberships as any[]) ?? [])].sort(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return {
    ...data,
    active_membership: activeMembership,
    days_remaining: daysRemaining,
    memberships: sortedMemberships,
  };
}
