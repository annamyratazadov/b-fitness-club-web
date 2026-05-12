import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getMemberProfile } from "@/lib/services/member-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  History,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default async function MemberDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("member");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const profile = await getMemberProfile(user.id);
  if (!profile) redirect(`/${locale}/login`);

  const activeMembership = profile.active_membership;
  const daysRemaining = profile.days_remaining;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalDays = (activeMembership?.membership_packages as any)?.duration_days ?? 1;
  const progressPercent = activeMembership
    ? Math.max(0, Math.min(100, ((daysRemaining ?? 0) / totalDays) * 100))
    : 0;

  const urgency =
    daysRemaining === null
      ? "none"
      : daysRemaining === 0
      ? "expired"
      : daysRemaining <= 3
      ? "critical"
      : daysRemaining <= 7
      ? "warning"
      : "good";

  const urgencyStyles = {
    none: { bg: "bg-gray-50 border-gray-200", number: "text-gray-400", bar: "bg-gray-300" },
    expired: { bg: "bg-red-50 border-red-200", number: "text-red-500", bar: "bg-red-400" },
    critical: { bg: "bg-red-50 border-red-200", number: "text-red-500", bar: "bg-red-400" },
    warning: { bg: "bg-orange-50 border-orange-200", number: "text-orange-500", bar: "bg-orange-400" },
    good: { bg: "bg-green-50 border-green-200", number: "text-green-600", bar: "bg-green-500" },
  }[urgency];

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t("welcomeBack")}, {profile.first_name} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* ── Membership Status Card ── */}
      <Card className={`border-2 ${urgencyStyles.bg}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            {urgency === "good" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
            {urgency === "warning" && <Clock className="w-4 h-4 text-orange-500" />}
            {(urgency === "critical" || urgency === "expired") && (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            )}
            {t("membershipStatus")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!activeMembership ? (
            <div className="text-center py-6">
              <p className="text-gray-500 font-medium">{t("noActiveMembership")}</p>
              <p className="text-gray-400 text-sm mt-2">{t("contactAdmin")}</p>
              <p className="text-sm text-gray-400 mt-1 font-medium">📞 0216 693 21 65</p>
            </div>
          ) : (
            <div className="text-center">
              {/* Big number */}
              <div className={`text-7xl font-black leading-none mb-1 ${urgencyStyles.number}`}>
                {daysRemaining === 0 ? "0" : daysRemaining}
              </div>
              <div className="text-gray-500 text-sm mb-4">
                {daysRemaining === 0 ? "Üyeliğiniz doldu" : "gün kaldı"}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-5">
                <div
                  className={`h-3 rounded-full transition-all ${urgencyStyles.bar}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/70 rounded-lg p-3 text-left">
                  <p className="text-gray-400 text-xs mb-1">Paket</p>
                  <p className="font-semibold text-gray-800">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(activeMembership.membership_packages as any)?.name ?? "-"}
                  </p>
                </div>
                <div className="bg-white/70 rounded-lg p-3 text-left">
                  <p className="text-gray-400 text-xs mb-1">Bitiş Tarihi</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(activeMembership.end_date).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <div className="bg-white/70 rounded-lg p-3 text-left">
                  <p className="text-gray-400 text-xs mb-1">Başlangıç</p>
                  <p className="font-medium text-gray-700">
                    {new Date(activeMembership.start_date).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <div className="bg-white/70 rounded-lg p-3 text-left">
                  <p className="text-gray-400 text-xs mb-1">Ödenen</p>
                  <p className="font-medium text-gray-700">
                    ₺{activeMembership.payment_amount?.toLocaleString("tr-TR")}
                  </p>
                </div>
              </div>

              {(urgency === "critical" || urgency === "expired") && (
                <div className="mt-4 p-3 bg-red-100 rounded-lg text-sm text-red-700">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  Üyeliğinizi yenilemek için salonu ziyaret edin veya arayın: <strong>0216 693 21 65</strong>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Profile Card ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-5 h-5 text-orange-500" />
              {t("myProfile")}
            </CardTitle>
            <Badge className={profile.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
              {profile.status === "active" ? "Aktif Üye" : "Pasif Üye"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            <ProfileRow icon={Phone} label="Telefon" value={profile.phone} />
            <ProfileRow
              icon={Calendar}
              label="Doğum Tarihi"
              value={new Date(profile.birth_date).toLocaleDateString("tr-TR")}
            />
            <ProfileRow icon={MapPin} label="Doğum Yeri" value={profile.birth_place} />
            <ProfileRow icon={Briefcase} label="Meslek" value={profile.occupation} />
            <ProfileRow icon={MapPin} label="Adres" value={profile.address} />
            <ProfileRow
              icon={Calendar}
              label="Kayıt Tarihi"
              value={new Date(profile.created_at).toLocaleDateString("tr-TR")}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Membership History ── */}
      {profile.memberships.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="w-5 h-5 text-gray-500" />
              {t("membershipHistory")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {profile.memberships.map((m: any) => (
                <div
                  key={m.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    m.is_active
                      ? "border-green-200 bg-green-50/50"
                      : "border-gray-100 bg-gray-50/50"
                  }`}
                >
                  <div>
                    <p className="font-medium text-sm text-gray-900">
                      {m.membership_packages?.name ?? "-"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(m.start_date).toLocaleDateString("tr-TR")} →{" "}
                      {new Date(m.end_date).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">
                      ₺{m.payment_amount?.toLocaleString("tr-TR")}
                    </p>
                    {m.is_active ? (
                      <Badge className="text-xs bg-green-100 text-green-700 mt-1">Aktif</Badge>
                    ) : (
                      <Badge className="text-xs bg-gray-100 text-gray-500 mt-1">Geçmiş</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-orange-500" />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
