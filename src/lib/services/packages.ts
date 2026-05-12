import { createClient } from "@/lib/supabase/server";

export async function getPackages(onlyActive = false) {
  const supabase = await createClient();

  let query = supabase
    .from("membership_packages")
    .select("*")
    .order("package_type", { ascending: true })
    .order("duration_days", { ascending: true });

  if (onlyActive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
