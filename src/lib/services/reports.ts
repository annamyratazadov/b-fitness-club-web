import { createClient } from "@/lib/supabase/server";

export interface ReportEntry {
  membershipId: string;
  memberId: string;
  memberName: string;
  phone: string | null;
  packageName: string | null;
  startDate: string;
  amount: number;
  type: "new" | "renewal";
}

export interface MonthlyReport {
  year: number;
  /** 1-12 */
  month: number;
  /** Revenue per month of the year, index 0 = January */
  monthlyTotals: number[];
  /** New-member count per month, index 0 = January */
  monthlyNewCounts: number[];
  /** Renewal count per month, index 0 = January */
  monthlyRenewalCounts: number[];
  /** Memberships that started in the selected month, sorted by start_date */
  entries: ReportEntry[];
  summary: {
    revenue: number;
    newCount: number;
    renewalCount: number;
    total: number;
  };
}

// Month index (0-11) straight from the "YYYY-MM-DD" string — timezone-safe,
// unlike new Date(...).getMonth() which shifts around UTC midnight.
function monthIndex(startDate: string): number {
  return parseInt(startDate.slice(5, 7), 10) - 1;
}

/**
 * Monthly revenue/member report, computed from `memberships.start_date`
 * (when the membership actually starts) — NOT `created_at`.
 *
 * Every membership that starts in a month counts toward that month: a member's
 * first membership is tagged "new", later ones "renewal", so a coach can tell
 * brand-new sign-ups apart from renewals.
 */
export async function getMonthlyReport(
  year: number,
  month: number
): Promise<MonthlyReport> {
  const supabase = await createClient();

  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;

  const [yearRes, allRes] = await Promise.all([
    // This year's memberships, with member + package for the detail list.
    supabase
      .from("memberships")
      .select(
        `id, member_id, start_date, payment_amount,
         profiles(first_name, last_name, phone),
         membership_packages(name)`
      )
      .gte("start_date", yearStart)
      .lte("start_date", yearEnd)
      .order("start_date", { ascending: true }),
    // All memberships (lightweight) to find each member's first one (new vs renewal).
    supabase.from("memberships").select("id, member_id, start_date, created_at"),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const yearRows: any[] = yearRes.data ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allRows: any[] = allRes.data ?? [];

  // member_id -> id of the membership with the earliest start_date (created_at tiebreak)
  const firstMembershipByMember = new Map<string, string>();
  const firstSeen = new Map<string, { start: string; created: string }>();
  for (const r of allRows) {
    const prev = firstSeen.get(r.member_id);
    const isEarlier =
      !prev ||
      r.start_date < prev.start ||
      (r.start_date === prev.start && r.created_at < prev.created);
    if (isEarlier) {
      firstSeen.set(r.member_id, { start: r.start_date, created: r.created_at });
      firstMembershipByMember.set(r.member_id, r.id);
    }
  }

  const isNew = (membershipId: string, memberId: string) =>
    firstMembershipByMember.get(memberId) === membershipId;

  const monthlyTotals = Array<number>(12).fill(0);
  const monthlyNewCounts = Array<number>(12).fill(0);
  const monthlyRenewalCounts = Array<number>(12).fill(0);

  for (const r of yearRows) {
    const mi = monthIndex(r.start_date);
    if (mi < 0 || mi > 11) continue;
    monthlyTotals[mi] += Number(r.payment_amount) || 0;
    if (isNew(r.id, r.member_id)) monthlyNewCounts[mi] += 1;
    else monthlyRenewalCounts[mi] += 1;
  }

  const monthStr = String(month).padStart(2, "0");
  const entries: ReportEntry[] = yearRows
    .filter((r) => r.start_date.slice(5, 7) === monthStr)
    .map((r) => {
      // Embedded to-one relations may arrive as an object or a single-element array.
      const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
      const pkg = Array.isArray(r.membership_packages)
        ? r.membership_packages[0]
        : r.membership_packages;
      const name = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();
      return {
        membershipId: r.id,
        memberId: r.member_id,
        memberName: name || "—",
        phone: profile?.phone ?? null,
        packageName: pkg?.name ?? null,
        startDate: r.start_date,
        amount: Number(r.payment_amount) || 0,
        type: isNew(r.id, r.member_id) ? "new" : "renewal",
      };
    });

  const summary = {
    revenue: entries.reduce((s, e) => s + e.amount, 0),
    newCount: entries.filter((e) => e.type === "new").length,
    renewalCount: entries.filter((e) => e.type === "renewal").length,
    total: entries.length,
  };

  return {
    year,
    month,
    monthlyTotals,
    monthlyNewCounts,
    monthlyRenewalCounts,
    entries,
    summary,
  };
}
