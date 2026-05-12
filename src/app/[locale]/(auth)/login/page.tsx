"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, AlertCircle, Loader2 } from "lucide-react";
import { adminLogin, memberLogin } from "@/lib/actions/auth";

export default function LoginPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [adminError, setAdminError] = useState<string | null>(null);
  const [memberError, setMemberError] = useState<string | null>(null);

  function handleAdminSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAdminError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("locale", locale);

    startTransition(async () => {
      const result = await adminLogin(formData);
      if (result?.error) setAdminError(result.error);
    });
  }

  function handleMemberSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMemberError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("locale", locale);

    startTransition(async () => {
      const result = await memberLogin(formData);
      if (result?.error) setMemberError(result.error);
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4">
            <Dumbbell className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">B-Fitness Club</h1>
          <p className="text-gray-400 mt-1">Kavacık</p>
        </div>

        <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-center text-lg">
              {t("auth.login")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-700">
                <TabsTrigger
                  value="admin"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-gray-300"
                >
                  Admin
                </TabsTrigger>
                <TabsTrigger
                  value="member"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-gray-300"
                >
                  Üye
                </TabsTrigger>
              </TabsList>

              {/* ADMIN LOGIN */}
              <TabsContent value="admin">
                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-gray-300">
                      {t("auth.email")}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="admin@bfitness.com"
                      required
                      autoComplete="email"
                      className="mt-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-password" className="text-gray-300">
                      {t("auth.password")}
                    </Label>
                    <Input
                      id="admin-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="mt-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500"
                    />
                  </div>

                  {adminError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-md p-3">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {adminError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t("common.loading")}
                      </>
                    ) : (
                      t("auth.login")
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* MEMBER LOGIN */}
              <TabsContent value="member">
                <form onSubmit={handleMemberSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="phone" className="text-gray-300">
                      {t("auth.phone")}
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="05XX XXX XX XX"
                      required
                      autoComplete="tel"
                      className="mt-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="member-password" className="text-gray-300">
                      {t("auth.password")}
                    </Label>
                    <Input
                      id="member-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="mt-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500"
                    />
                  </div>

                  {memberError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-md p-3">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {memberError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t("common.loading")}
                      </>
                    ) : (
                      t("auth.login")
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
