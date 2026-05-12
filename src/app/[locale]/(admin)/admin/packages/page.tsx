import { getPackages } from "@/lib/services/packages";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PackageActions from "@/components/admin/PackageActions";
import AddPackageDialog from "@/components/admin/AddPackageDialog";

export default async function PackagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const packages = await getPackages();

  const studentPackages = packages.filter((p) => p.package_type === "student");
  const normalPackages = packages.filter((p) => p.package_type === "normal");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Paket Yönetimi</h1>
        <AddPackageDialog locale={locale} />
      </div>

      {[
        { title: "Öğrenci Paketleri", data: studentPackages },
        { title: "Normal Paketler", data: normalPackages },
      ].map(({ title, data }) => (
        <div key={title} className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">{title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.map((pkg) => (
              <Card key={pkg.id} className={`${!pkg.is_active ? "opacity-60" : ""}`}>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{pkg.name}</p>
                      <p className="text-sm text-gray-500">{pkg.duration_days} gün</p>
                    </div>
                    <Badge className={pkg.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                      {pkg.is_active ? "Aktif" : "Pasif"}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-orange-500 mb-4">
                    ₺{pkg.price.toLocaleString("tr-TR")}
                  </p>
                  <PackageActions pkg={pkg} locale={locale} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
