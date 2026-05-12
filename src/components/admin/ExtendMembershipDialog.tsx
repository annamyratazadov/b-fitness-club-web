"use client";

import { useState, useTransition } from "react";

// Stable reference to "today" captured at module load — not per-render
const SESSION_START = Date.now();
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { extendMembership } from "@/lib/actions/members";
import { toast } from "sonner";

interface Package {
  id: string;
  name: string;
  duration_days: number;
  price: number;
  package_type: string;
}

interface Props {
  memberId: string;
  packages: Package[];
  locale: string;
}

export default function ExtendMembershipDialog({ memberId, packages, locale }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [customPrice, setCustomPrice] = useState("");

  const studentPackages = packages.filter((p) => p.package_type === "student");
  const normalPackages = packages.filter((p) => p.package_type === "normal");

  const endDateStr = selectedPkg
    ? new Date(SESSION_START + selectedPkg.duration_days * 86400000).toLocaleDateString("tr-TR")
    : "";

  const handlePackageChange = (pkgId: string) => {
    const pkg = packages.find((p) => p.id === pkgId) ?? null;
    setSelectedPkg(pkg);
    setCustomPrice(pkg ? String(pkg.price) : "");
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("locale", locale);

    startTransition(async () => {
      const result = await extendMembership(memberId, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        toast.success("Üyelik başarıyla uzatıldı!");
        setOpen(false);
        setSelectedPkg(null);
        setCustomPrice("");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-green-600 hover:bg-green-700" />}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Üyelik Uzat / Ödeme Al
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Üyelik Uzat / Ödeme Al</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="extend-package">Paket Seç *</Label>
            <select
              id="extend-package"
              name="package_id"
              required
              onChange={(e) => handlePackageChange(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Paket seçin...</option>
              {studentPackages.length > 0 && (
                <optgroup label="Öğrenci Paketleri">
                  {studentPackages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₺{p.price.toLocaleString("tr-TR")} ({p.duration_days} gün)
                    </option>
                  ))}
                </optgroup>
              )}
              {normalPackages.length > 0 && (
                <optgroup label="Normal Paketler">
                  {normalPackages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₺{p.price.toLocaleString("tr-TR")} ({p.duration_days} gün)
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div>
            <Label htmlFor="payment_amount">Ödeme Tutarı (₺) *</Label>
            <Input
              id="payment_amount"
              name="payment_amount"
              type="number"
              step="0.01"
              min="0"
              required
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              placeholder="0.00"
              className="mt-1"
            />
            {selectedPkg && (
              <p className="text-xs text-gray-500 mt-1">
                Paket fiyatı: ₺{selectedPkg.price.toLocaleString("tr-TR")} — İndirim uygulamak için değiştirin.
              </p>
            )}
          </div>

          {selectedPkg && (
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3 text-sm">
              <p className="text-orange-800 font-medium">Yeni üyelik bilgileri:</p>
              <p className="text-orange-700 mt-1">
                Başlangıç: <strong>Bugün</strong> ({new Date().toLocaleDateString("tr-TR")})
              </p>
              <p className="text-orange-700">
                Bitiş:{" "}
                <strong>
                  {endDateStr}
                </strong>{" "}
                ({selectedPkg.duration_days} gün)
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                "Ödemeyi Kaydet"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
