import { notFound } from "next/navigation";
import Link from "next/link";
import { getMemberDetail } from "@/lib/services/members";
import { getPackages } from "@/lib/services/packages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, User, Phone, MapPin, Briefcase, Calendar, History } from "lucide-react";
import DeleteMemberButton from "@/components/admin/DeleteMemberButton";
import ExtendMembershipDialog from "@/components/admin/ExtendMembershipDialog";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const [member, packages] = await Promise.all([
    getMemberDetail(id),
    getPackages(true),
  ]);

  if (!member) notFound();

  const today = new Date().toISOString().split("T")[0];
  const state = member.membership_state as "active" | "expired" | "none";
  const activeMembership = member.active_membership;
  const daysRemaining = member.days_remaining;
  const totalDays = (activeMembership?.membership_packages as { duration_days?: number } | null)?.duration_days ?? 1;
  const progressPercent = activeMembership
    ? Math.max(0, Math.min(100, ((daysRemaining ?? 0) / totalDays) * 100))
    : 0;

  return (
    <div className="max-w-4xl">
      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Link href={`/${locale}/admin/members`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Üye Listesi
          </Button>
        </Link>
        <div className="flex gap-2 flex-wrap">
          <ExtendMembershipDialog memberId={id} packages={packages} locale={locale} />
          <Link href={`/${locale}/admin/members/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Düzenle
            </Button>
          </Link>
          <DeleteMemberButton
            memberId={id}
            memberName={`${member.first_name} ${member.last_name}`}
            locale={locale}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-500" />
                  {member.first_name} {member.last_name}
                </CardTitle>
                <Badge
                  className={
                    state === "active"
                      ? "bg-green-100 text-green-700"
                      : state === "expired"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }
                >
                  {state === "active" ? "Aktif" : state === "expired" ? "Süresi Doldu" : "Üyelik Yok"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={Phone} label="Telefon" value={member.phone} />
                <InfoRow icon={Calendar} label="Doğum Tarihi" value={member.birth_date ? new Date(member.birth_date).toLocaleDateString("tr-TR") : null} />
                <InfoRow icon={MapPin} label="Doğum Yeri" value={member.birth_place} />
                <InfoRow icon={Briefcase} label="Meslek" value={member.occupation} />
                <InfoRow icon={Calendar} label="Kayıt Tarihi" value={new Date(member.created_at).toLocaleDateString("tr-TR")} />
                <div className="sm:col-span-2">
                  <InfoRow icon={MapPin} label="Adres" value={member.address} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Membership Status */}
        <div>
          <Card className={`border-2 ${
            state === "expired" || (state === "active" && (daysRemaining ?? 0) <= 3)
              ? "border-red-200 bg-red-50/30"
              : "border-orange-100"
          }`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-600">Üyelik Durumu</CardTitle>
            </CardHeader>
            <CardContent>
              {state === "none" ? (
                <div className="text-center py-6">
                  <p className="text-gray-400 text-sm font-medium">Aktif üyelik yok</p>
                  <p className="text-gray-300 text-xs mt-1">Üyelik uzatmak için yukarıdaki butonu kullanın</p>
                </div>
              ) : (
                <div className="text-center">
                  {state === "active" ? (
                    <>
                      <div className={`text-5xl font-black mb-1 ${
                        (daysRemaining ?? 0) <= 3 ? "text-red-500" : (daysRemaining ?? 0) <= 7 ? "text-orange-500" : "text-green-600"
                      }`}>
                        {daysRemaining}
                      </div>
                      <div className="text-gray-500 text-sm mb-3">gün kaldı</div>

                      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div
                          className={`h-2 rounded-full ${progressPercent > 50 ? "bg-green-500" : progressPercent > 20 ? "bg-orange-500" : "bg-red-500"}`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="mb-4">
                      <div className="text-2xl font-black text-red-600 mb-1">Süresi doldu</div>
                      <div className="text-gray-500 text-sm">
                        {Math.abs(daysRemaining ?? 0)} gün önce sona erdi
                      </div>
                    </div>
                  )}

                  <div className="text-left space-y-2 text-sm border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Paket</span>
                      <span className="font-medium text-right">{(activeMembership.membership_packages as { name?: string } | null)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Başlangıç</span>
                      <span>{new Date(activeMembership.start_date).toLocaleDateString("tr-TR")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bitiş</span>
                      <span className={`font-semibold ${state === "expired" ? "text-red-600" : ""}`}>{new Date(activeMembership.end_date).toLocaleDateString("tr-TR")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ödeme</span>
                      <span>₺{activeMembership.payment_amount?.toLocaleString("tr-TR")}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Membership History */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="w-5 h-5 text-gray-500" />
            Abonelik Geçmişi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {member.memberships.length === 0 ? (
            <p className="text-gray-400 text-sm">Henüz üyelik kaydı yok.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 rounded">
                  <tr>
                    <th className="text-left px-3 py-2 text-gray-600 font-medium rounded-l">Tarih</th>
                    <th className="text-left px-3 py-2 text-gray-600 font-medium">Paket</th>
                    <th className="text-left px-3 py-2 text-gray-600 font-medium">Süre</th>
                    <th className="text-left px-3 py-2 text-gray-600 font-medium">Bitiş</th>
                    <th className="text-left px-3 py-2 text-gray-600 font-medium">Ödeme</th>
                    <th className="text-left px-3 py-2 text-gray-600 font-medium rounded-r">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {member.memberships.map((m: any) => {
                    const valid = m.end_date >= today;
                    return (
                    <tr key={m.id} className={valid ? "bg-green-50/40" : "hover:bg-gray-50/50"}>
                      <td className="px-3 py-2 text-gray-500 text-xs">
                        {new Date(m.created_at).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-3 py-2 font-medium">{m.membership_packages?.name ?? "-"}</td>
                      <td className="px-3 py-2 text-gray-600">{m.membership_packages?.duration_days ?? "-"} gün</td>
                      <td className="px-3 py-2 text-gray-600">
                        {new Date(m.end_date).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-3 py-2 font-medium">₺{m.payment_amount?.toLocaleString("tr-TR")}</td>
                      <td className="px-3 py-2">
                        {valid ? (
                          <Badge className="bg-green-100 text-green-700 text-xs">Aktif</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-500 text-xs">Geçmiş</Badge>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null }) {
  const empty = value === null || value === "";
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-sm font-medium ${empty ? "text-gray-300" : "text-gray-900"}`}>
          {empty ? "—" : value}
        </p>
      </div>
    </div>
  );
}
