import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Calendar,
  DollarSign,
  Package,
  Phone,
  AlertTriangle,
  UserPlus,
  History,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import {
  getDashboardStats,
  getExpiringMemberships,
  getRecentlyExpiredMemberships,
} from "@/lib/services/dashboard";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("dashboard");

  const [stats, expiring, expired] = await Promise.all([
    getDashboardStats(),
    getExpiringMemberships(7),
    getRecentlyExpiredMemberships(14),
  ]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 6) return "İyi geceler";
    if (h < 12) return "Günaydın";
    if (h < 18) return "İyi günler";
    return "İyi akşamlar";
  })();

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {greeting} — bugünün özetine göz at.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        <QuickAction
          href={`/${locale}/admin/members/new`}
          icon={UserPlus}
          label="Yeni Üye Ekle"
          color="orange"
        />
        <QuickAction
          href={`/${locale}/admin/members/existing`}
          icon={History}
          label="Mevcut Üye Ekle"
          color="blue"
        />
        <QuickAction
          href={`/${locale}/admin/members`}
          icon={Users}
          label="Üye Listesi"
          color="gray"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title={t("totalMembers")}
          value={stats.total_members}
          icon={Users}
          color="blue"
          href={`/${locale}/admin/members`}
        />
        <StatCard
          title={t("activeMembers")}
          value={stats.active_members}
          icon={UserCheck}
          color="green"
          href={`/${locale}/admin/members?status=active`}
        />
        <StatCard
          title={t("passiveMembers")}
          value={stats.passive_members}
          icon={UserX}
          color="red"
          href={`/${locale}/admin/members?status=passive`}
        />
        <StatCard
          title={t("newMembersThisMonth")}
          value={stats.new_members_this_month}
          icon={TrendingUp}
          color="orange"
        />
        <StatCard
          title={t("expiringThisMonth")}
          value={stats.expiring_this_month}
          icon={Calendar}
          color="yellow"
        />
        <StatCard
          title={t("monthlyRevenue")}
          value={`₺${stats.monthly_revenue.toLocaleString("tr-TR")}`}
          icon={DollarSign}
          color="purple"
        />
        <StatCard
          title={t("mostPopularPackage")}
          value={stats.most_popular_package}
          icon={Package}
          color="indigo"
          small
        />
        <StatCard
          title="Bildirimler"
          value="Görüntüle"
          icon={MessageSquare}
          color="emerald"
          small
          href={`/${locale}/admin/notifications`}
        />
      </div>

      {/* Expiring & Expired */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Soon */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-600 flex items-center gap-2 text-base">
              <AlertTriangle className="w-4 h-4" />
              {t("expiringMemberships")} (7 gün)
              {expiring.length > 0 && (
                <Badge className="ml-auto bg-orange-100 text-orange-700 text-xs">
                  {expiring.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expiring.length === 0 ? (
              <p className="text-gray-400 text-sm">Yakında dolacak üyelik yok. 🎉</p>
            ) : (
              <div className="space-y-1">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {expiring.map((m: any) => {
                  const today = new Date().toISOString().split("T")[0];
                  const days = Math.max(
                    0,
                    Math.ceil(
                      (new Date(m.end_date).getTime() - new Date(today).getTime()) /
                        86400000
                    )
                  );
                  return (
                    <Link
                      key={m.id}
                      href={`/${locale}/admin/members/${m.profiles?.id}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {m.profiles?.first_name} {m.profiles?.last_name}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <Phone className="w-3 h-3" />
                          {m.profiles?.phone}
                        </div>
                      </div>
                      <Badge
                        className={
                          days <= 2
                            ? "bg-red-100 text-red-700"
                            : days <= 5
                            ? "bg-orange-100 text-orange-700"
                            : "bg-yellow-100 text-yellow-700"
                        }
                      >
                        {days} gün
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Expired */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-red-600 flex items-center gap-2 text-base">
              <UserX className="w-4 h-4" />
              {t("recentlyExpired")} (14 gün)
              {expired.length > 0 && (
                <Badge className="ml-auto bg-red-100 text-red-700 text-xs">
                  {expired.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expired.length === 0 ? (
              <p className="text-gray-400 text-sm">Son biten üyelik yok.</p>
            ) : (
              <div className="space-y-1">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {expired.map((m: any) => (
                  <Link
                    key={m.id}
                    href={`/${locale}/admin/members/${m.profiles?.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {m.profiles?.first_name} {m.profiles?.last_name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Bitti: {new Date(m.end_date).toLocaleDateString("tr-TR")}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Phone className="w-3 h-3" />
                      {m.profiles?.phone}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  color,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  color: "orange" | "blue" | "gray";
}) {
  const styles: Record<string, string> = {
    orange:
      "bg-orange-500 hover:bg-orange-600 text-white border-orange-500",
    blue: "bg-white hover:bg-blue-50 text-blue-700 border-blue-200",
    gray: "bg-white hover:bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <Link
      href={href}
      className={`flex items-center justify-between gap-2 px-4 py-3 rounded-lg border font-medium text-sm transition-colors ${styles[color]}`}
    >
      <span className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {label}
      </span>
      <ArrowRight className="w-4 h-4 opacity-70" />
    </Link>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  small = false,
  href,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  small?: boolean;
  href?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    red: "text-red-600 bg-red-100",
    orange: "text-orange-600 bg-orange-100",
    yellow: "text-yellow-600 bg-yellow-100",
    purple: "text-purple-600 bg-purple-100",
    indigo: "text-indigo-600 bg-indigo-100",
    emerald: "text-emerald-600 bg-emerald-100",
  };

  const body = (
    <Card className={href ? "hover:shadow-md transition-shadow cursor-pointer" : ""}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-3">
            <p className="text-sm text-gray-500">{title}</p>
            <p className={`font-bold mt-1 truncate ${small ? "text-base" : "text-2xl"}`}>
              {value}
            </p>
          </div>
          <div className={`p-3 rounded-full shrink-0 ${colorMap[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}
