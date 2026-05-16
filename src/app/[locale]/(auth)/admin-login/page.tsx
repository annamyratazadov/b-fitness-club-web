"use client";

import { useState, useTransition } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, AlertCircle, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { adminLogin } from "@/lib/actions/auth";

export default function AdminLoginPage() {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("locale", locale);

    startTransition(async () => {
      const result = await adminLogin(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-2xl mb-4 border border-gray-600">
            <Dumbbell className="w-9 h-9 text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">B-Fitness Club</h1>
          <div className="inline-flex items-center gap-1.5 mt-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-3 py-1">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-orange-400 text-xs font-medium">Admin Paneli</span>
          </div>
        </div>

        <Card className="border-gray-700 bg-gray-800/60 backdrop-blur">
          <CardContent className="pt-6 pb-6">
            <h2 className="text-white text-center text-lg font-semibold mb-6">
              Yönetici Girişi
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-gray-300 text-sm">
                  E-posta
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-1.5 h-11 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="admin-password" className="text-gray-300 text-sm">
                  Şifre
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="admin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="h-11 pr-11 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  "Admin Girişi"
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-gray-600 mt-6">
              Üye misiniz?{" "}
              <Link href={`/${locale}/login`} className="text-gray-400 hover:text-gray-200 underline">
                Üye girişi
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
