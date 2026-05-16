import { createClient, createPublicClient } from "@/lib/supabase/server";

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

/**
 * Fetch active packages without requiring an auth session.
 * Used on the public landing page where visitors have no cookies.
 */
export async function getPublicPackages() {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("membership_packages")
    .select("id, name, duration_days, price, package_type")
    .eq("is_active", true)
    .order("package_type", { ascending: true })
    .order("duration_days", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
