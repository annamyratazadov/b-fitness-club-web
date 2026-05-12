import { createClient } from "@/lib/supabase/server";

export interface MembersFilter {
  search?: string;
  status?: "active" | "passive" | "";
  packageType?: "student" | "normal" | "";
  page?: number;
  pageSize?: number;
}

export async function getMembers({
  search = "",
  status = "",
  packageType = "",
  page = 1,
  pageSize = 15,
}: MembersFilter = {}) {
  const supabase = await createClient();

  // Get member IDs matching packageType filter first
  let filteredMemberIds: string[] | null = null;
  if (packageType) {
    const { data: pkgMemberships } = await supabase
      .from("memberships")
      .select("member_id, membership_packages!inner(package_type)")
      .eq("is_active", true)
      .eq("membership_packages.package_type", packageType);

    filteredMemberIds = pkgMemberships?.map((m) => m.member_id) ?? [];
  }

  let query = supabase
    .from("profiles")
    .select(
      `
      id, first_name, last_name, phone, status, created_at,
      memberships(
        id, start_date, end_date, payment_amount, is_active,
        membership_packages(id, name, package_type, duration_days)
      )
    `,
      { count: "exact" }
    )
    .eq("role", "member")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%`
    );
  }
  if (status) {
    query = query.eq("status", status);
  }
  if (filteredMemberIds !== null) {
    if (filteredMemberIds.length === 0) {
      return { data: [], count: 0, totalPages: 0 };
    }
    query = query.in("id", filteredMemberIds);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;

  // Attach computed fields
  const today = new Date().toISOString().split("T")[0];
  const members = (data ?? []).map((m) => {
    const activeMembership = m.memberships?.find((mb) => mb.is_active) ?? null;
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
    return { ...m, active_membership: activeMembership, days_remaining: daysRemaining };
  });

  return {
    data: members,
    count: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getMemberDetail(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id, first_name, last_name, phone, birth_date, birth_place,
      occupation, address, role, status, language, created_at, updated_at,
      memberships(
        id, start_date, end_date, payment_amount, is_active, created_at,
        membership_packages(id, name, package_type, duration_days, price)
      )
    `
    )
    .eq("id", id)
    .eq("role", "member")
    .single();

  if (error || !data) return null;

  const today = new Date().toISOString().split("T")[0];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeMembership = data.memberships?.find((m: any) => m.is_active) ?? null;
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

  const sortedMemberships = [...(data.memberships ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return {
    ...data,
    active_membership: activeMembership,
    days_remaining: daysRemaining,
    memberships: sortedMemberships,
  };
}
