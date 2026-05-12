"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2, Calendar } from "lucide-react";
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

interface Props {
  packages: Package[];
  locale: string;
  member?: Profile;
}

export default function MemberForm({ packages, locale, member }: Props) {
  const isEdit = !!member;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [manualDate, setManualDate] = useState(false);
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  const studentPackages = packages.filter((p) => p.package_type === "student");
  const normalPackages = packages.filter((p) => p.package_type === "normal");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("locale", locale);

    if (!manualDate) {
      formData.set("start_date", today);
    }

    startTransition(async () => {
      const result = isEdit
        ? await updateMember(member!.id, formData)
        : await createMember(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b">Kişisel Bilgiler</h3>
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
              </div>
              <div>
                <Label htmlFor="birth_date">Doğum Tarihi *</Label>
                <Input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  required
                  defaultValue={member?.birth_date}
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
          </div>

          {/* Package & Password — only for new members */}
          {!isEdit && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b">Üyelik & Giriş Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="package_id">Üyelik Paketi *</Label>
                  <select
                    id="package_id"
                    name="package_id"
                    required
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
                  <Label htmlFor="password">Üye Giriş Şifresi *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required={!isEdit}
                    placeholder="En az 6 karakter"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Üye bu şifreyle telefon numarasıyla giriş yapacak.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="manual_date"
                      checked={manualDate}
                      onChange={(e) => setManualDate(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="manual_date" className="cursor-pointer flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Geçmiş tarihten başlat
                    </Label>
                  </div>
                  {manualDate && (
                    <Input
                      name="start_date"
                      type="date"
                      defaultValue={today}
                      max={today}
                      required={manualDate}
                    />
                  )}
                  {!manualDate && (
                    <p className="text-xs text-gray-400">Başlangıç tarihi: Bugün ({new Date().toLocaleDateString("tr-TR")})</p>
                  )}
                </div>
              </div>
            </div>
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
              ) : (
                "Üye Ekle"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
