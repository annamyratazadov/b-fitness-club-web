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
  const today = new Date().toISOString().split("T")[0];

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

  // Status filter means "membership validity": does the member currently have a
  // non-expired membership (end_date >= today)? We derive this from dates rather
  // than profiles.status (which the app never changes) or the stale is_active flag.
  let validMemberIds: string[] | null = null;
  if (status === "active" || status === "passive") {
    const { data: validRows } = await supabase
      .from("memberships")
      .select("member_id")
      .gte("end_date", today);
    validMemberIds = Array.from(new Set((validRows ?? []).map((r) => r.member_id)));
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
  if (filteredMemberIds !== null) {
    if (filteredMemberIds.length === 0) {
      return { data: [], count: 0, totalPages: 0 };
    }
    query = query.in("id", filteredMemberIds);
  }

  if (status === "active") {
    if (validMemberIds!.length === 0) {
      return { data: [], count: 0, totalPages: 0 };
    }
    query = query.in("id", validMemberIds!);
  } else if (status === "passive" && validMemberIds!.length > 0) {
    // Everyone WITHOUT a currently-valid membership (expired or none).
    query = query.not("id", "in", `(${validMemberIds!.join(",")})`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;

  // Attach computed fields. The member's CURRENT membership is the one with the
  // latest end_date (covers renewals and expired memberships alike), and validity
  // is derived from that date — NOT the is_active flag, which is never flipped
  // when a membership lapses.
  const members = (data ?? []).map((m) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const list: any[] = m.memberships ?? [];
    const current = list.length
      ? list.reduce((a, b) => (b.end_date > a.end_date ? b : a))
      : null;
    let membershipState: "active" | "expired" | "none" = "none";
    let daysRemaining: number | null = null;
    if (current) {
      daysRemaining = Math.ceil(
        (new Date(current.end_date).getTime() - new Date(today).getTime()) / 86400000
      );
      membershipState = current.end_date >= today ? "active" : "expired";
    }
    return {
      ...m,
      active_membership: current,
      days_remaining: daysRemaining,
      membership_state: membershipState,
    };
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
  // Current membership = the one with the latest end_date; validity is by date,
  // not the is_active flag (which is never flipped when a membership lapses).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const list: any[] = data.memberships ?? [];
  const current = list.length
    ? list.reduce((a, b) => (b.end_date > a.end_date ? b : a))
    : null;
  let membershipState: "active" | "expired" | "none" = "none";
  let daysRemaining: number | null = null;
  if (current) {
    daysRemaining = Math.ceil(
      (new Date(current.end_date).getTime() - new Date(today).getTime()) / 86400000
    );
    membershipState = current.end_date >= today ? "active" : "expired";
  }

  const sortedMemberships = [...list].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return {
    ...data,
    active_membership: current,
    days_remaining: daysRemaining,
    membership_state: membershipState,
    memberships: sortedMemberships,
  };
}
