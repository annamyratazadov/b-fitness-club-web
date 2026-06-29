import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  UserPlus,
  RefreshCw,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getMonthlyReport } from "@/lib/services/reports";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
}

const fmtTry = (n: number) => `₺${n.toLocaleString("tr-TR")}`;

export default async function ReportsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations("reports");

  const now = new Date();
  const currentYear = now.getFullYear();

  // Parse + clamp year/month, defaulting to the current month.
  const parsedYear = parseInt(sp.year ?? "", 10);
  const year =
    Number.isFinite(parsedYear) && parsedYear >= 2000 && parsedYear <= currentYear + 1
      ? parsedYear
      : currentYear;
  const parsedMonth = parseInt(sp.month ?? "", 10);
  const month =
    Number.isFinite(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12
      ? parsedMonth
      : now.getMonth() + 1;

  const report = await getMonthlyReport(year, month);

  // Localized month names (Ocak… / January…) straight from the locale.
  const monthFmt = new Intl.DateTimeFormat(locale, { month: "long" });
  const monthNames = Array.from({ length: 12 }, (_, i) =>
    monthFmt.format(new Date(2000, i, 1))
  );

  const canGoNext = year < currentYear;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("subtitle")}</p>
      </div>

      {/* Year navigation */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <Link
          href={`?year=${year - 1}&month=${month}`}
          aria-label={t("prevYear")}
          className="p-2 rounded-lg border bg-white text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <span className="text-xl font-bold text-gray-900 tabular-nums w-16 text-center">
          {year}
        </span>
        {canGoNext ? (
          <Link
            href={`?year=${year + 1}&month=${month}`}
            aria-label={t("nextYear")}
            className="p-2 rounded-lg border bg-white text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        ) : (
          <span className="p-2 rounded-lg border bg-gray-50 text-gray-300 cursor-not-allowed">
            <ChevronRight className="w-5 h-5" />
          </span>
        )}
      </div>

      {/* Month strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-8">
        {monthNames.map((name, i) => {
          const m = i + 1;
          const isActive = m === month;
          const total = report.monthlyTotals[i];
          return (
            <Link
              key={m}
              href={`?year=${year}&month=${m}`}
              className={cn(
                "flex flex-col gap-0.5 px-3 py-2.5 rounded-lg border text-left transition-colors",
                isActive
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "bg-white border-gray-200 hover:bg-orange-50 hover:border-orange-200 text-gray-700"
              )}
            >
              <span className="text-sm font-medium">{name}</span>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  isActive
                    ? "text-orange-50"
                    : total > 0
                    ? "text-gray-500"
                    : "text-gray-300"
                )}
              >
                {fmtTry(total)}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Selected month summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title={t("totalRevenue")}
          value={fmtTry(report.summary.revenue)}
          icon={Wallet}
          color="purple"
        />
        <SummaryCard
          title={t("newMembers")}
          value={report.summary.newCount}
          icon={UserPlus}
          color="green"
        />
        <SummaryCard
          title={t("renewals")}
          value={report.summary.renewalCount}
          icon={RefreshCw}
          color="blue"
        />
        <SummaryCard
          title={t("totalEntries")}
          value={report.summary.total}
          icon={Users}
          color="orange"
        />
      </div>

      {/* Entries table */}
      <div className="mb-3">
        <h2 className="text-base font-semibold text-gray-800">
          {monthNames[month - 1]} {year}
        </h2>
      </div>

      {report.entries.length === 0 ? (
        <div className="bg-white rounded-xl border py-16 text-center text-gray-400">
          <p className="text-lg">{t("emptyMonth")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    {t("member")}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    {t("type")}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    {t("package")}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    {t("startDate")}
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    {t("amount")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {report.entries.map((e) => (
                  <tr key={e.membershipId} className="hover:bg-orange-50/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <Link
                        href={`/${locale}/admin/members/${e.memberId}`}
                        className="hover:text-orange-600 hover:underline"
                      >
                        {e.memberName}
                      </Link>
                      {e.phone && (
                        <span className="block text-xs text-gray-400 mt-0.5">{e.phone}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          e.type === "new"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }
                      >
                        {e.type === "new" ? t("newBadge") : t("renewalBadge")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {e.packageName ?? <span className="text-gray-400 italic">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(e.startDate).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 tabular-nums">
                      {fmtTry(e.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right font-medium text-gray-600">
                    {t("totalRevenue")}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900 tabular-nums">
                    {fmtTry(report.summary.revenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    orange: "text-orange-600 bg-orange-100",
    purple: "text-purple-600 bg-purple-100",
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-3">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="font-bold mt-1 truncate text-2xl">{value}</p>
          </div>
          <div className={`p-3 rounded-full shrink-0 ${colorMap[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
