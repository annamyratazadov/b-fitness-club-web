"use client";

import { useState, useTransition } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { AlertCircle, Loader2, Eye, EyeOff, Phone } from "lucide-react";
import { memberLogin } from "@/lib/actions/auth";

export default function MemberLoginPage() {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("locale", locale);

    startTransition(async () => {
      const result = await memberLogin(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <Image
              src="/logo.png"
              alt="B-Fitness Club"
              width={80}
              height={80}
              className="rounded-2xl"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-white">B-Fitness Club</h1>
          <p className="text-gray-400 mt-1">Kavacık</p>
        </div>

        <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
          <CardContent className="pt-6 pb-6">
            <h2 className="text-white text-center text-lg font-semibold mb-6">
              Üye Girişi
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="text-gray-300 text-sm">
                  Telefon Numarası
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="05XX XXX XX XX"
                    required
                    autoComplete="tel"
                    className="h-11 pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500"
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
              </div>

              {/* PIN */}
              <div>
                <Label htmlFor="password" className="text-gray-300 text-sm">
                  PIN Kodu
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    name="password"
                    type={showPin ? "text" : "password"}
                    placeholder="••••"
                    required
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    autoComplete="current-password"
                    className="h-11 pr-11 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500 tracking-widest font-mono text-lg"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPin((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    aria-label={showPin ? "PIN'i gizle" : "PIN'i göster"}
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-semibold mt-2"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  "Giriş Yap"
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-gray-600 mt-6">
              Admin misiniz?{" "}
              <Link href={`/${locale}/admin-login`} className="text-gray-400 hover:text-gray-200 underline">
                Admin girişi
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-600 mt-4">
          <Link href={`/${locale}`} className="hover:text-gray-400 transition-colors">
            ← Ana sayfaya dön
          </Link>
        </p>
      </div>
    </div>
  );
}
