import { NextRequest } from "next/server";
import twilio from "twilio";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Türkiye telefon numarasını WhatsApp formatına çevir
// Örnek: "05321234567" → "+905321234567"
function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("90")) return `+${digits}`;
  if (digits.startsWith("0")) return `+90${digits.slice(1)}`;
  return `+90${digits}`;
}

export async function GET(request: NextRequest) {
  // Güvenlik: CRON_SECRET doğrulama
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createAdminClient();

  // 3 gün sonraki tarihi hesapla
  const targetDate = new Date(Date.now() + 3 * 86400000)
    .toISOString()
    .split("T")[0];

  // 3 gün sonra biten aktif üyelikleri bul (profiles ile join)
  const { data: memberships, error: membershipsError } = await supabase
    .from("memberships")
    .select(
      `
      id,
      member_id,
      end_date,
      membership_packages(name),
      profiles!inner(first_name, last_name, phone)
    `
    )
    .eq("is_active", true)
    .eq("end_date", targetDate);

  if (membershipsError) {
    console.error("Membership query error:", membershipsError);
    return Response.json(
      { error: "DB query failed", detail: membershipsError.message },
      { status: 500 }
    );
  }

  if (!memberships || memberships.length === 0) {
    return Response.json({
      success: true,
      message: `${targetDate} tarihinde biten üyelik yok.`,
      sent: 0,
    });
  }

  // Bugün zaten bildirim gönderilmiş üyeleri bul (duplicate protection)
  const today = new Date().toISOString().split("T")[0];
  const memberIds = memberships.map((m) => m.member_id);

  const { data: alreadySent } = await supabase
    .from("whatsapp_notifications")
    .select("member_id")
    .in("member_id", memberIds)
    .eq("message_type", "3_days_before")
    .eq("status", "sent")
    .gte("sent_at", `${today}T00:00:00Z`)
    .lte("sent_at", `${today}T23:59:59Z`);

  const alreadySentIds = new Set((alreadySent ?? []).map((n) => n.member_id));

  // Twilio client
  const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  const fromNumber = `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`;

  const results: { member_id: string; status: "sent" | "failed"; error?: string }[] = [];

  for (const membership of memberships) {
    if (alreadySentIds.has(membership.member_id)) {
      console.log(`Skipping ${membership.member_id} — already sent today`);
      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = membership.profiles as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const packageName = (membership.membership_packages as any)?.name ?? "Üyelik";
    const firstName = profile?.first_name ?? "Üyemiz";
    const phone = profile?.phone;

    if (!phone) {
      results.push({ member_id: membership.member_id, status: "failed", error: "Phone missing" });
      continue;
    }

    const toNumber = `whatsapp:${toWhatsAppNumber(phone)}`;
    const messageBody =
      `Merhaba ${firstName} 👋\n\n` +
      `B-Fitness Club Kavacık'taki *${packageName}* üyeliğinizin *3 günü* kaldı.\n\n` +
      `Üyeliğinizi yenilemek için salonu ziyaret edebilir veya bizi arayabilirsiniz:\n` +
      `📞 0216 693 21 65\n\n` +
      `Sizi görmek için sabırsızlanıyoruz! 💪`;

    try {
      await twilioClient.messages.create({
        from: fromNumber,
        to: toNumber,
        body: messageBody,
      });

      // Başarılı → log
      await supabase.from("whatsapp_notifications").insert({
        member_id: membership.member_id,
        message_type: "3_days_before",
        status: "sent",
      });

      results.push({ member_id: membership.member_id, status: "sent" });
      console.log(`✅ WhatsApp sent to ${phone}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`❌ WhatsApp failed for ${phone}:`, errorMessage);

      // Başarısız → log
      await supabase.from("whatsapp_notifications").insert({
        member_id: membership.member_id,
        message_type: "3_days_before",
        status: "failed",
        error_message: errorMessage,
      });

      results.push({ member_id: membership.member_id, status: "failed", error: errorMessage });
    }
  }

  const sentCount = results.filter((r) => r.status === "sent").length;
  const failedCount = results.filter((r) => r.status === "failed").length;
  const skippedCount = memberships.length - results.length;

  return Response.json({
    success: true,
    targetDate,
    total: memberships.length,
    sent: sentCount,
    failed: failedCount,
    skipped: skippedCount,
    results,
  });
}
