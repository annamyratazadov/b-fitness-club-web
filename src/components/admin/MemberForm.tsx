"use client";

import { useState, useTransition, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  Loader2,
  CalendarDays,
  User,
  CreditCard,
  Info,
  Eye,
  EyeOff,
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

// ── Date input with calendar icon button ────────────────────────────────
function DateField({
  id,
  name,
  required,
  defaultValue,
  max,
  value,
  onChange,
  label,
  hint,
}: {
  id: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  max?: string;
  value?: string;
  onChange?: (v: string) => void;
  label: React.ReactNode;
  hint?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div>
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      <div className="relative mt-1.5">
        <Input
          ref={ref}
          id={id}
          name={name}
          type="date"
          required={required}
          defaultValue={defaultValue}
          max={max}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className="pr-10 h-11 border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            ref.current?.focus();
            ref.current?.showPicker?.();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
          aria-label="Takvimi aç"
        >
          <CalendarDays className="w-4 h-4" />
        </button>
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

// ── Styled text input helper ────────────────────────────────────────────
function Field({
  id,
  name,
  label,
  required,
  defaultValue,
  placeholder,
  type = "text",
  hint,
  className,
}: {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-orange-500 ml-0.5">*</span>}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-1.5 h-11 border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

// ── Main Form ────────────────────────────────────────────────────────────
export default function MemberForm({ packages, locale, member, mode: modeProp }: Props) {
  const isEdit = !!member;
  const mode: Mode = isEdit ? "edit" : modeProp ?? "new";

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(true); // PIN visible by default
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

  // Mode banner
  const headerHint =
    mode === "existing" ? (
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <strong>Mevcut üye kaydı.</strong> Başlangıç tarihini girin — bitiş tarihi paket
          süresine göre otomatik hesaplanacaktır.
        </div>
      </div>
    ) : mode === "new" ? (
      <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
        <Info className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
        <div className="text-sm text-orange-900">
          <strong>Yeni üye kaydı.</strong> Üyelik <strong>bugünden</strong> başlar.
          Geçmiş tarihten başlatmak için &quot;Mevcut Üye Ekle&quot; sayfasını kullanın.
        </div>
      </div>
    ) : null;

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="pt-6">
        {headerHint}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ── Personal Info ──────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-5 pb-2 border-b border-gray-100">
              <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Kişisel Bilgiler</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field id="first_name" name="first_name" label="Ad" required defaultValue={member?.first_name} placeholder="Ahmet" />
              <Field id="last_name"  name="last_name"  label="Soyad" required defaultValue={member?.last_name}  placeholder="Yılmaz" />

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Telefon<span className="text-orange-500 ml-0.5">*</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  defaultValue={member?.phone}
                  placeholder="05XX XXX XX XX"
                  className="mt-1.5 h-11 border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                />
                <p className="text-xs text-gray-400 mt-1">Üye bu numara ile giriş yapacak.</p>
              </div>

              <DateField
                id="birth_date"
                name="birth_date"
                label={<>Doğum Tarihi<span className="text-orange-500 ml-0.5">*</span></>}
                required
                defaultValue={member?.birth_date}
                max={today}
              />

              <Field id="birth_place" name="birth_place" label="Doğum Yeri" required defaultValue={member?.birth_place} placeholder="İstanbul" />
              <Field id="occupation"  name="occupation"  label="Meslek"     required defaultValue={member?.occupation}  placeholder="Öğrenci, Mühendis..." />

              <div className="md:col-span-2">
                <Field id="address" name="address" label="Adres" required defaultValue={member?.address} placeholder="Mahalle, Cadde, No, İlçe..." className="" />
              </div>
            </div>
          </section>

          {/* ── Package + Auth — only for create modes ──── */}
          {!isEdit && (
            <section>
              <div className="flex items-center gap-2 mb-5 pb-2 border-b border-gray-100">
                <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
                  <CreditCard className="w-3.5 h-3.5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Üyelik & Giriş Bilgileri</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Package Select */}
                <div className="md:col-span-2">
                  <Label htmlFor="package_id" className="text-sm font-medium text-gray-700">
                    Üyelik Paketi<span className="text-orange-500 ml-0.5">*</span>
                  </Label>
                  <select
                    id="package_id"
                    name="package_id"
                    required
                    value={selectedPkgId}
                    onChange={(e) => handlePackageChange(e.target.value)}
                    className="w-full mt-1.5 h-11 px-3 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                  <DateField
                    id="start_date"
                    name="start_date"
                    label={
                      <span className="flex items-center gap-1">
                        Başlangıç Tarihi<span className="text-orange-500 ml-0.5">*</span>
                      </span>
                    }
                    required
                    max={today}
                    value={startDateInput}
                    onChange={setStartDateInput}
                    hint="Üyenin gerçek başlangıç tarihi (bugünden sonra olamaz)."
                  />
                )}

                {/* Payment amount */}
                <div>
                  <Label htmlFor="payment_amount" className="text-sm font-medium text-gray-700">
                    Ödeme Tutarı (₺)
                  </Label>
                  <Input
                    id="payment_amount"
                    name="payment_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={paymentInput}
                    onChange={(e) => setPaymentInput(e.target.value)}
                    placeholder={selectedPkg ? String(selectedPkg.price) : "0.00"}
                    className="mt-1.5 h-11 border-gray-300 focus:border-orange-500 bg-white"
                  />
                  {selectedPkg && (
                    <p className="text-xs text-gray-400 mt-1">
                      Paket fiyatı: ₺{selectedPkg.price.toLocaleString("tr-TR")} — indirim için değiştirin.
                    </p>
                  )}
                </div>

                {/* PIN field */}
                <div className={mode === "existing" ? "md:col-span-2" : ""}>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Üye Giriş PIN&apos;i<span className="text-orange-500 ml-0.5">*</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="password"
                      name="password"
                      type={showPin ? "text" : "password"}
                      required
                      maxLength={10}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Örn: 1234"
                      className="pr-11 h-11 border-gray-300 focus:border-orange-500 bg-white tracking-widest text-lg font-mono"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPin((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                      aria-label={showPin ? "PIN'i gizle" : "PIN'i göster"}
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Üye telefon numarası + bu PIN ile giriş yapacak.
                  </p>
                </div>
              </div>

              {/* Live Preview */}
              {selectedPkg && (
                <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-orange-600 font-semibold mb-3">
                    Üyelik Özeti
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-gray-500 text-xs mb-0.5">Paket</div>
                      <div className="font-semibold text-gray-900">{selectedPkg.name}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-0.5">Başlangıç</div>
                      <div className="font-semibold text-gray-900">
                        {formatDateTR(new Date(previewStart))}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-0.5">Bitiş</div>
                      <div className="font-semibold text-gray-900">
                        {previewEndDate ? formatDateTR(previewEndDate) : "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-0.5">Durum</div>
                      <div className={`font-semibold ${previewIsActive ? "text-green-700" : "text-red-600"}`}>
                        {previewIsActive ? "Aktif olacak" : "Süresi dolmuş"}
                      </div>
                    </div>
                  </div>
                  {!previewIsActive && (
                    <div className="mt-3 text-xs text-red-700 flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      Bu üyeliğin bitiş tarihi geçmişte kalıyor — kayıt edildiğinde
                      &quot;süresi dolmuş&quot; olarak işaretlenecek.
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
              className="px-6"
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 px-6"
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
