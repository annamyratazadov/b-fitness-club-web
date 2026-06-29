"use client";

import { useState, useTransition, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  Loader2,
  CalendarDays,
  User,
  Info,
  Eye,
  EyeOff,
  ChevronDown,
  Check,
  Phone,
  GraduationCap,
  Lock,
  Wallet,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { createMember, updateMember } from "@/lib/actions/members";
import { cn } from "@/lib/utils";

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
  phone: string | null;
  birth_date: string | null;
  birth_place: string | null;
  occupation: string | null;
  address: string | null;
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

// Shared input styling
const inputCls =
  "mt-1.5 h-11 border-gray-300 bg-white focus:border-orange-500 focus:ring-orange-500";

// ── Text field ──────────────────────────────────────────────────────────
function Field({
  id,
  name,
  label,
  required,
  defaultValue,
  placeholder,
  type = "text",
  hint,
  icon: Icon,
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
  icon?: React.ElementType;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
        {label}
        {required && <span className="text-orange-500">*</span>}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={inputCls}
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

// ── Date field with calendar button ─────────────────────────────────────
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
          className="h-11 pr-10 border-gray-300 bg-white focus:border-orange-500 focus:ring-orange-500"
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

// ── Section header ──────────────────────────────────────────────────────
function SectionTitle({
  step,
  icon: Icon,
  title,
  desc,
  tone = "required",
}: {
  step?: number;
  icon: React.ElementType;
  title: string;
  desc?: string;
  tone?: "required" | "muted";
}) {
  const isReq = tone === "required";
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
          isReq ? "bg-orange-500 text-white shadow-sm shadow-orange-200" : "bg-gray-100 text-gray-500"
        )}
      >
        {step ? <span className="text-sm font-bold">{step}</span> : <Icon className="w-4 h-4" />}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={cn("font-semibold", isReq ? "text-gray-900" : "text-gray-700")}>{title}</h3>
          {isReq ? (
            <span className="text-[10px] font-bold uppercase tracking-wide text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">
              Zorunlu
            </span>
          ) : (
            <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              İsteğe bağlı
            </span>
          )}
        </div>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
    </div>
  );
}

// ── Main Form ───────────────────────────────────────────────────────────
export default function MemberForm({ packages, locale, member, mode: modeProp }: Props) {
  const isEdit = !!member;
  const mode: Mode = isEdit ? "edit" : modeProp ?? "new";

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(true);
  const [showOptional, setShowOptional] = useState(false);
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  const studentPackages = useMemo(
    () => packages.filter((p) => p.package_type === "student"),
    [packages]
  );
  const normalPackages = useMemo(
    () => packages.filter((p) => p.package_type === "normal"),
    [packages]
  );

  const [pkgTab, setPkgTab] = useState<"student" | "normal">(
    studentPackages.length > 0 ? "student" : "normal"
  );
  const [selectedPkgId, setSelectedPkgId] = useState("");
  const [startDateInput, setStartDateInput] = useState(today);
  const [paymentInput, setPaymentInput] = useState("");

  const selectedPkg = useMemo(
    () => packages.find((p) => p.id === selectedPkgId) ?? null,
    [packages, selectedPkgId]
  );

  const previewStart = mode === "existing" ? startDateInput : today;
  const previewEndDate = selectedPkg
    ? addDays(new Date(previewStart), selectedPkg.duration_days)
    : null;
  const previewIsActive = previewEndDate ? previewEndDate >= new Date(today) : true;

  function handlePackageChange(id: string) {
    setSelectedPkgId(id);
    const pkg = packages.find((p) => p.id === id);
    if (pkg) setPaymentInput(String(pkg.price));
    setError(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("locale", locale);

    if (!isEdit) {
      formData.set("mode", mode);
      formData.set("package_id", selectedPkgId);
      formData.set("payment_amount", paymentInput);
      if (mode === "existing") formData.set("start_date", startDateInput);

      // Client-side guards (server re-validates)
      if (!selectedPkgId) {
        setError("Lütfen bir üyelik paketi seçin.");
        return;
      }
    }

    const phone = ((formData.get("phone") as string) || "").trim();
    const pin = ((formData.get("password") as string) || "").trim();
    if (phone && !pin) {
      setShowOptional(true);
      setError("Telefon girildiğinde giriş PIN'i de zorunludur.");
      return;
    }

    startTransition(async () => {
      const result = isEdit
        ? await updateMember(member!.id, formData)
        : await createMember(formData);
      if (result?.error) setError(result.error);
    });
  }

  const submitLabel = isEdit
    ? "Değişiklikleri Kaydet"
    : mode === "existing"
    ? "Mevcut Üyeyi Kaydet"
    : "Yeni Üyeyi Kaydet";

  // ── Optional personal fields (shared by all modes) ───────────────────
  const personalFields = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DateField
        id="birth_date"
        name="birth_date"
        label="Doğum Tarihi"
        defaultValue={member?.birth_date ?? undefined}
        max={today}
      />
      <Field
        id="birth_place"
        name="birth_place"
        label="Doğum Yeri"
        defaultValue={member?.birth_place ?? undefined}
        placeholder="İstanbul"
      />
      <Field
        id="occupation"
        name="occupation"
        label="Meslek"
        defaultValue={member?.occupation ?? undefined}
        placeholder="Öğrenci, Mühendis..."
      />
      <Field
        id="address"
        name="address"
        label="Adres"
        defaultValue={member?.address ?? undefined}
        placeholder="Mahalle, Cadde, No, İlçe..."
      />
    </div>
  );

  // ── Optional login fields (only for create modes) ────────────────────
  const loginFields = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
          <Phone className="w-3.5 h-3.5 text-gray-400" />
          Telefon
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={member?.phone ?? ""}
          placeholder="05XX XXX XX XX"
          className={inputCls}
        />
        <p className="text-xs text-gray-400 mt-1">
          Girilirse üye telefon + PIN ile giriş yapabilir.
        </p>
      </div>
      <div>
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          <Lock className="w-3.5 h-3.5 text-gray-400" />
          Giriş PIN&apos;i
        </Label>
        <div className="relative mt-1.5">
          <Input
            id="password"
            name="password"
            type={showPin ? "text" : "password"}
            maxLength={10}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Örn: 1234"
            className="h-11 pr-11 border-gray-300 bg-white focus:border-orange-500 focus:ring-orange-500 tracking-widest font-mono"
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
        <p className="text-xs text-gray-400 mt-1">Sadece telefon girildiyse gerekli.</p>
      </div>
    </div>
  );

  // ── Collapsible optional block ───────────────────────────────────────
  const optionalBlock = (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/60">
      <button
        type="button"
        onClick={() => setShowOptional((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <SectionTitle
          icon={Info}
          title="İsteğe bağlı bilgiler"
          desc={
            isEdit
              ? "Telefon ve kişisel detaylar"
              : "Üye girişi ve kişisel detaylar — boş bırakabilirsiniz"
          }
          tone="muted"
        />
        <ChevronDown
          className={cn(
            "w-5 h-5 text-gray-400 transition-transform shrink-0",
            showOptional && "rotate-180"
          )}
        />
      </button>
      {showOptional && (
        <div className="px-5 pb-5 space-y-6">
          {!isEdit && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Üye Girişi
                </span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              {loginFields}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Kişisel Detaylar
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            {personalFields}
          </div>
        </div>
      )}
    </div>
  );

  // ── EDIT MODE: single column ─────────────────────────────────────────
  if (isEdit) {
    return (
      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
        <div className="rounded-2xl border border-orange-200 bg-white shadow-sm overflow-hidden">
          <div className="border-l-4 border-orange-500 px-5 py-4 border-b border-gray-100">
            <SectionTitle icon={User} title="Üye Bilgileri" desc="Ad ve soyad zorunludur" />
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field id="first_name" name="first_name" label="Ad" required defaultValue={member?.first_name} placeholder="Ahmet" />
            <Field id="last_name" name="last_name" label="Soyad" required defaultValue={member?.last_name} placeholder="Yılmaz" />
            <div className="md:col-span-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                Telefon
              </Label>
              <Input id="phone" name="phone" type="tel" defaultValue={member?.phone ?? ""} placeholder="05XX XXX XX XX" className={inputCls} />
              <p className="text-xs text-gray-400 mt-1">Üye bu numara ile giriş yapar (opsiyonel).</p>
            </div>
          </div>
        </div>

        {optionalBlock}

        {error && <ErrorBox>{error}</ErrorBox>}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending} className="h-11 px-6">
            İptal
          </Button>
          <Button type="submit" disabled={isPending} className="h-11 px-6 bg-orange-500 hover:bg-orange-600 text-white">
            {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Kaydediliyor...</> : submitLabel}
          </Button>
        </div>
      </form>
    );
  }

  // ── CREATE MODES: two-column with sticky summary ─────────────────────
  const activePackages = pkgTab === "student" ? studentPackages : normalPackages;

  return (
    <form onSubmit={handleSubmit}>
      {/* Mode banner */}
      {mode === "existing" ? (
        <Banner tone="blue">
          <strong>Mevcut üye kaydı.</strong> Başlangıç tarihini girin — bitiş tarihi paket
          süresine göre otomatik hesaplanır.
        </Banner>
      ) : (
        <Banner tone="orange">
          <strong>Yeni üye kaydı.</strong> Üyelik <strong>bugünden</strong> başlar. Geçmiş
          tarihli kayıt için &quot;Mevcut Üye Ekle&quot;yi kullanın.
        </Banner>
      )}

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* LEFT — form */}
        <div className="lg:col-span-2 space-y-5">
          {/* REQUIRED card */}
          <div className="rounded-2xl border border-orange-200 bg-white shadow-sm overflow-hidden">
            <div className="border-l-4 border-orange-500 px-5 py-4 border-b border-gray-100">
              <SectionTitle step={1} icon={User} title="Üye & Üyelik" desc="Bu alanlar zorunludur" />
            </div>

            <div className="p-5 space-y-6">
              {/* Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field id="first_name" name="first_name" label="Ad" required placeholder="Ahmet" />
                <Field id="last_name" name="last_name" label="Soyad" required placeholder="Yılmaz" />
              </div>

              {/* Package picker */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">
                  <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                  Üyelik Paketi<span className="text-orange-500">*</span>
                </Label>

                {/* Segmented tabs */}
                <div className="inline-flex p-1 bg-gray-100 rounded-xl mb-3">
                  {studentPackages.length > 0 && (
                    <TabButton active={pkgTab === "student"} onClick={() => setPkgTab("student")}>
                      Öğrenci
                    </TabButton>
                  )}
                  {normalPackages.length > 0 && (
                    <TabButton active={pkgTab === "normal"} onClick={() => setPkgTab("normal")}>
                      Normal
                    </TabButton>
                  )}
                </div>

                {/* Package cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {activePackages.map((p) => {
                    const active = selectedPkgId === p.id;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => handlePackageChange(p.id)}
                        className={cn(
                          "relative text-left rounded-xl border-2 p-3.5 transition-all",
                          active
                            ? "border-orange-500 bg-orange-50 shadow-sm"
                            : "border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/30"
                        )}
                      >
                        {active && (
                          <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </span>
                        )}
                        <div className="text-xs text-gray-500 mb-1">{p.duration_days} gün</div>
                        <div className="font-semibold text-gray-900 text-sm leading-tight">
                          {p.name.replace(/ (Öğrenci|Normal)$/, "")}
                        </div>
                        <div className="mt-2 text-orange-600 font-bold">
                          ₺{p.price.toLocaleString("tr-TR")}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start date — existing only */}
              {mode === "existing" && (
                <DateField
                  id="start_date"
                  name="start_date"
                  label={
                    <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                      Başlangıç Tarihi<span className="text-orange-500">*</span>
                    </span>
                  }
                  required
                  max={today}
                  value={startDateInput}
                  onChange={setStartDateInput}
                  hint="Üyenin gerçek başlangıç tarihi (bugünden sonra olamaz)."
                />
              )}
            </div>
          </div>

          {/* OPTIONAL block — visually below & de-emphasized */}
          {optionalBlock}
        </div>

        {/* RIGHT — sticky summary */}
        <div className="lg:col-span-1 lg:sticky lg:top-6 space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="font-semibold">Üyelik Özeti</span>
              </div>
            </div>

            {!selectedPkg ? (
              <div className="px-5 py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">
                  Özeti görmek için bir <span className="font-medium text-gray-600">paket seçin</span>.
                </p>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <SummaryRow label="Paket" value={selectedPkg.name} />
                <SummaryRow label="Başlangıç" value={formatDateTR(new Date(previewStart))} />
                <SummaryRow
                  label="Bitiş"
                  value={previewEndDate ? formatDateTR(previewEndDate) : "-"}
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Durum</span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
                      previewIsActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    )}
                  >
                    {previewIsActive ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {previewIsActive ? "Aktif olacak" : "Süresi dolmuş"}
                  </span>
                </div>

                {/* Editable payment */}
                <div className="pt-3 border-t border-gray-100">
                  <Label htmlFor="payment_amount" className="text-sm font-medium text-gray-700">
                    <Wallet className="w-3.5 h-3.5 text-gray-400" />
                    Ödeme Tutarı
                  </Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₺</span>
                    <Input
                      id="payment_amount"
                      name="payment_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={paymentInput}
                      onChange={(e) => setPaymentInput(e.target.value)}
                      placeholder={String(selectedPkg.price)}
                      className="h-11 pl-7 border-gray-300 bg-white focus:border-orange-500 focus:ring-orange-500 font-semibold"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Paket fiyatı ₺{selectedPkg.price.toLocaleString("tr-TR")} — indirim için değiştirin.
                  </p>
                </div>

                {!previewIsActive && (
                  <div className="text-xs text-red-700 flex items-start gap-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    Bitiş tarihi geçmişte — kayıt &quot;süresi dolmuş&quot; olarak işaretlenecek.
                  </div>
                )}
              </div>
            )}
          </div>

          {error && <ErrorBox>{error}</ErrorBox>}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              disabled={isPending}
              className="h-11 w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Kaydediliyor...</>
              ) : (
                submitLabel
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={isPending}
              className="h-10 w-full text-gray-500"
            >
              İptal
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

// ── Small presentational helpers ────────────────────────────────────────
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 h-8 rounded-lg text-sm font-medium transition-all",
        active ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
      )}
    >
      {children}
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-gray-900 text-right">{value}</span>
    </div>
  );
}

function Banner({ tone, children }: { tone: "blue" | "orange"; children: React.ReactNode }) {
  const styles =
    tone === "blue"
      ? "bg-blue-50 border-blue-200 text-blue-900"
      : "bg-orange-50 border-orange-200 text-orange-900";
  return (
    <div className={cn("flex items-start gap-3 border rounded-xl p-4 mb-6", styles)}>
      <Info className={cn("w-5 h-5 shrink-0 mt-0.5", tone === "blue" ? "text-blue-600" : "text-orange-600")} />
      <div className="text-sm">{children}</div>
    </div>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
      <AlertCircle className="w-4 h-4 shrink-0" />
      {children}
    </div>
  );
}
