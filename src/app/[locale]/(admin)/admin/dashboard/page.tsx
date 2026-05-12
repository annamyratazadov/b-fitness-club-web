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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("title")}</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title={t("totalMembers")} value={stats.total_members} icon={Users} color="blue" />
        <StatCard title={t("activeMembers")} value={stats.active_members} icon={UserCheck} color="green" />
        <StatCard title={t("passiveMembers")} value={stats.passive_members} icon={UserX} color="red" />
        <StatCard title={t("newMembersThisMonth")} value={stats.new_members_this_month} icon={TrendingUp} color="orange" />
        <StatCard title={t("expiringThisMonth")} value={stats.expiring_this_month} icon={Calendar} color="yellow" />
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
      </div>

      {/* Expiring & Expired */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Soon */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-600 flex items-center gap-2 text-base">
              <AlertTriangle className="w-4 h-4" />
              {t("expiringMemberships")} (7 gün)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expiring.length === 0 ? (
              <p className="text-gray-400 text-sm">Yakında dolacak üyelik yok.</p>
            ) : (
              <div className="space-y-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {expiring.map((m: any) => {
                  const today = new Date().toISOString().split("T")[0];
                  const days = Math.max(
                    0,
                    Math.ceil(
                      (new Date(m.end_date).getTime() - new Date(today).getTime()) / 86400000
                    )
                  );
                  return (
                    <div key={m.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                      <div>
                        <Link
                          href={`/${locale}/admin/members/${m.profiles?.id}`}
                          className="font-medium text-sm text-gray-900 hover:text-orange-600"
                        >
                          {m.profiles?.first_name} {m.profiles?.last_name}
                        </Link>
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
                    </div>
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expired.length === 0 ? (
              <p className="text-gray-400 text-sm">Son biten üyelik yok.</p>
            ) : (
              <div className="space-y-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {expired.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                    <div>
                      <Link
                        href={`/${locale}/admin/members/${m.profiles?.id}`}
                        className="font-medium text-sm text-gray-900 hover:text-red-600"
                      >
                        {m.profiles?.first_name} {m.profiles?.last_name}
                      </Link>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Bitti: {new Date(m.end_date).toLocaleDateString("tr-TR")}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Phone className="w-3 h-3" />
                      {m.profiles?.phone}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  small = false,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  small?: boolean;
}) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    red: "text-red-600 bg-red-100",
    orange: "text-orange-600 bg-orange-100",
    yellow: "text-yellow-600 bg-yellow-100",
    purple: "text-purple-600 bg-purple-100",
    indigo: "text-indigo-600 bg-indigo-100",
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-3">
            <p className="text-sm text-gray-500">{title}</p>
            <p className={`font-bold mt-1 truncate ${small ? "text-base" : "text-2xl"}`}>{value}</p>
          </div>
          <div className={`p-3 rounded-full shrink-0 ${colorMap[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
