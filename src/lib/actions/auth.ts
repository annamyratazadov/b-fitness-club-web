"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function phoneToEmail(phone: string): string {
  const normalized = phone.replace(/[\s\-\(\)]/g, "");
  return `${normalized}@bfitness.local`;
}

export async function adminLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const locale = (formData.get("locale") as string) || "tr";

  if (!email || !password) {
    return { error: "Email ve şifre zorunludur." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: "Giriş başarısız. Email veya şifrenizi kontrol edin." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    await supabase.auth.signOut();
    return { error: "Bu hesabın admin yetkisi bulunmuyor." };
  }

  revalidatePath("/", "layout");
  redirect(`/${locale}/admin/dashboard`);
}

export async function memberLogin(formData: FormData) {
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  const locale = (formData.get("locale") as string) || "tr";

  if (!phone || !password) {
    return { error: "Telefon numarası ve şifre zorunludur." };
  }

  const supabase = await createClient();
  const email = phoneToEmail(phone);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: "Giriş başarısız. Telefon numarası veya şifrenizi kontrol edin." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (!profile || profile.role !== "member") {
    await supabase.auth.signOut();
    return { error: "Bu hesap üye olarak bulunamadı." };
  }

  revalidatePath("/", "layout");
  redirect(`/${locale}/member/dashboard`);
}

export async function logout(locale: string) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(`/${locale}/login`);
}
