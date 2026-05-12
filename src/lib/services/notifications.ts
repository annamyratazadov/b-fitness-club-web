import { createClient } from "@/lib/supabase/server";

export interface NotificationRecord {
  id: string;
  member_id: string;
  message_type: string;
  sent_at: string;
  status: "sent" | "failed";
  error_message: string | null;
  profiles: {
    first_name: string;
    last_name: string;
    phone: string;
  } | null;
}

export async function getNotifications(limit = 50): Promise<NotificationRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("whatsapp_notifications")
    .select(
      `
      id, member_id, message_type, sent_at, status, error_message,
      profiles(first_name, last_name, phone)
    `
    )
    .order("sent_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []) as any;
}

export async function getNotificationStats() {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
    .toISOString()
    .split("T")[0];

  const [{ count: totalSent }, { count: totalFailed }, { count: sentToday }] =
    await Promise.all([
      supabase
        .from("whatsapp_notifications")
        .select("*", { count: "exact", head: true })
        .eq("status", "sent")
        .gte("sent_at", `${thirtyDaysAgo}T00:00:00Z`),

      supabase
        .from("whatsapp_notifications")
        .select("*", { count: "exact", head: true })
        .eq("status", "failed")
        .gte("sent_at", `${thirtyDaysAgo}T00:00:00Z`),

      supabase
        .from("whatsapp_notifications")
        .select("*", { count: "exact", head: true })
        .eq("status", "sent")
        .gte("sent_at", `${today}T00:00:00Z`),
    ]);

  return {
    totalSent: totalSent ?? 0,
    totalFailed: totalFailed ?? 0,
    sentToday: sentToday ?? 0,
  };
}
