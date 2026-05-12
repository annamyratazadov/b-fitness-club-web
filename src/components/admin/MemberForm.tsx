"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  Loader2,
  CalendarClock,
  User,
  CreditCard,
  Info,
} from "lucide-react";
import { createMember, updateMember } from "@/lib/actions/members";

interface Package {
  id: string;
  name: string;
  duration_days: number;
  price: number;
  package_type: string;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  birth_date: string;
  birth_place: string;
  occupation: string;
  address: string;
}

type Mode = "new" | "existing" | "edit";

interface Props {
  packages: Package[];
  locale: string;
  member?: Profile;
  mode?: Mode;
}

function formatDateTR(d: Date) {
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export default function MemberForm({ packages, locale, member, mode: modeProp }: Props) {
  const isEdit = !!member;
  const mode: Mode = isEdit ? "edit" : modeProp ?? "new";

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  // Live preview state
  const [selectedPkgId, setSelectedPkgId] = useState("");
  const [startDateInput, setStartDateInput] = useState(today);
  const [paymentInput, setPaymentInput] = useState("");

  const selectedPkg = useMemo(
    () => packages.find((p) => p.id === selectedPkgId) ?? null,
    [packages, selectedPkgId]
  );

  // Live computed end date for preview
  const previewStart = mode === "existing" ? startDateInput : today;
  const previewEndDate = selectedPkg
    ? addDays(new Date(previewStart), selectedPkg.duration_days)
    : null;
  const previewIsActive = previewEndDate ? previewEndDate >= new Date(today) : true;

  const studentPackages = packages.filter((p) => p.package_type === "student");
  const normalPackages = packages.filter((p) => p.package_type === "normal");

  function handlePackageChange(id: string) {
    setSelectedPkgId(id);
    const pkg = packages.find((p) => p.id === id);
    if (pkg) setPaymentInput(String(pkg.price));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("locale", locale);
    if (!isEdit) formData.set("mode", mode);

    startTransition(async () => {
      const result = isEdit
        ? await updateMember(member!.id, formData)
        : await createMember(formData);
      if (result?.error) setError(result.error);
    });
  }

  // Mode-specific UI text
  const headerHint =
    mode === "existing" ? (
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <strong>Mevcut üye kaydı.</strong> Bu form, salonu zaten kullanan ve üyelik
          başlangıç tarihi geçmişte olan bir üyeyi sisteme eklemek içindir. Başlangıç
          tarihini girin — bitiş tarihi paket süresine göre otomatik hesaplanacaktır.
        </div>
      </div>
    ) : mode === "new" ? (
      <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6">
        <Info className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
        <div className="text-sm text-orange-900">
          <strong>Yeni üye kaydı.</strong> Üyelik <strong>bugünden</strong> başlar.
          Geçmiş tarihten başlatmak için &quot;Mevcut Üye Ekle&quot; sayfasını kullanın.
        </div>
      </div>
    ) : null;

  return (
    <Card>
      <CardContent className="pt-6">
        {headerHint}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Info */}
          <section>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b">
              <User className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-700">Kişisel Bilgiler</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">Ad *</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  required
                  defaultValue={member?.first_name}
                  placeholder="Ahmet"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Soyad *</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  required
                  defaultValue={member?.last_name}
                  placeholder="Yılmaz"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  defaultValue={member?.phone}
                  placeholder="05XX XXX XX XX"
                  className="mt-1"
                />
                <p className="text-xs text-gray-400 mt-1">Üye, bu numara ile giriş yapacak.</p>
              </div>
              <div>
                <Label htmlFor="birth_date">Doğum Tarihi *</Label>
                <Input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  required
                  defaultValue={member?.birth_date}
                  max={today}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="birth_place">Doğum Yeri *</Label>
                <Input
                  id="birth_place"
                  name="birth_place"
                  required
                  defaultValue={member?.birth_place}
                  placeholder="İstanbul"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="occupation">Meslek *</Label>
                <Input
                  id="occupation"
                  name="occupation"
                  required
                  defaultValue={member?.occupation}
                  placeholder="Öğrenci, Mühendis..."
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Adres *</Label>
                <Input
                  id="address"
                  name="address"
                  required
                  defaultValue={member?.address}
                  placeholder="Mahalle, Cadde, No, İlçe..."
                  className="mt-1"
                />
              </div>
            </div>
          </section>

          {/* Package + Auth — only for create modes */}
          {!isEdit && (
            <section>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <h3 className="font-semibold text-gray-700">Üyelik & Giriş Bilgileri</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="package_id">Üyelik Paketi *</Label>
                  <select
                    id="package_id"
                    name="package_id"
                    required
                    value={selectedPkgId}
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

                {/* Start date — only for existing-member flow */}
                {mode === "existing" && (
                  <div>
                    <Label htmlFor="start_date" className="flex items-center gap-1">
                      <CalendarClock className="w-3.5 h-3.5" />
                      Başlangıç Tarihi *
                    </Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="date"
                      required
                      max={today}
                      value={startDateInput}
                      onChange={(e) => setStartDateInput(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Üyenin gerçek başlangıç tarihi (bugünden sonra olamaz).
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="payment_amount">Ödeme Tutarı (₺)</Label>
                  <Input
                    id="payment_amount"
                    name="payment_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={paymentInput}
                    onChange={(e) => setPaymentInput(e.target.value)}
                    placeholder={selectedPkg ? String(selectedPkg.price) : "0.00"}
                    className="mt-1"
                  />
                  {selectedPkg && (
                    <p className="text-xs text-gray-400 mt-1">
                      Paket fiyatı: ₺{selectedPkg.price.toLocaleString("tr-TR")} — indirim için
                      değiştirin.
                    </p>
                  )}
                </div>

                <div className={mode === "existing" ? "md:col-span-2" : ""}>
                  <Label htmlFor="password">Üye Giriş Şifresi *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="En az 6 karakter"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Üye, telefon numarası + bu şifre ile giriş yapacak.
                  </p>
                </div>
              </div>

              {/* Live Preview */}
              {selectedPkg && (
                <div className="mt-5 rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-orange-600 font-semibold mb-2">
                    Üyelik Özeti
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-gray-500 text-xs">Paket</div>
                      <div className="font-semibold text-gray-900">{selectedPkg.name}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">Başlangıç</div>
                      <div className="font-semibold text-gray-900">
                        {formatDateTR(new Date(previewStart))}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">Bitiş</div>
                      <div className="font-semibold text-gray-900">
                        {previewEndDate ? formatDateTR(previewEndDate) : "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">Durum</div>
                      <div
                        className={`font-semibold ${
                          previewIsActive ? "text-green-700" : "text-red-600"
                        }`}
                      >
                        {previewIsActive ? "Aktif olacak" : "Süresi dolmuş olacak"}
                      </div>
                    </div>
                  </div>
                  {!previewIsActive && (
                    <div className="mt-3 text-xs text-red-700 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Bu üyeliğin bitiş tarihi geçmişte kalıyor — kayıt edildiğinde
                      &quot;süresi dolmuş&quot; olarak işaretlenecek.
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : isEdit ? (
                "Güncelle"
              ) : mode === "existing" ? (
                "Mevcut Üyeyi Kaydet"
              ) : (
                "Yeni Üye Ekle"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
