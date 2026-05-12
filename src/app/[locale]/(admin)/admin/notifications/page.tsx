import { getNotifications, getNotificationStats } from "@/lib/services/notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, CheckCircle2, XCircle, Send } from "lucide-react";

export default async function NotificationsPage() {
  const [notifications, stats] = await Promise.all([
    getNotifications(100),
    getNotificationStats(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">WhatsApp Bildirimleri</h1>
        <p className="text-gray-500 text-sm mt-1">Son 100 bildirim — her gün 10:00&apos;da otomatik gönderilir</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSent}</p>
                <p className="text-xs text-gray-500">Son 30 günde gönderildi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFailed}</p>
                <p className="text-xs text-gray-500">Son 30 günde başarısız</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Send className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.sentToday}</p>
                <p className="text-xs text-gray-500">Bugün gönderildi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="w-5 h-5 text-gray-500" />
            Bildirim Geçmişi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Henüz bildirim gönderilmedi</p>
              <p className="text-sm mt-1">Bildirimler her gün saat 10:00&apos;da otomatik gönderilir</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Üye</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Telefon</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Mesaj Tipi</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Tarih / Saat</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((n) => (
                    <tr key={n.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-2 font-medium text-gray-900">
                        {n.profiles
                          ? `${n.profiles.first_name} ${n.profiles.last_name}`
                          : "—"}
                      </td>
                      <td className="py-3 px-2 text-gray-600">
                        {n.profiles?.phone ?? "—"}
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                          {n.message_type === "3_days_before" ? "3 Gün Kala" : n.message_type}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-500 text-xs">
                        {new Date(n.sent_at).toLocaleString("tr-TR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-2">
                        {n.status === "sent" ? (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            ✅ Gönderildi
                          </Badge>
                        ) : (
                          <div>
                            <Badge className="bg-red-100 text-red-700 text-xs">
                              ❌ Hata
                            </Badge>
                            {n.error_message && (
                              <p className="text-xs text-red-500 mt-1 max-w-[200px] truncate" title={n.error_message}>
                                {n.error_message}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
