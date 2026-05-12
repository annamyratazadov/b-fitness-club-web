"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createPackage(formData: FormData) {
  const locale = (formData.get("locale") as string) || "tr";
  const supabase = await createClient();

  const { error } = await supabase.from("membership_packages").insert({
    name: formData.get("name") as string,
    duration_days: parseInt(formData.get("duration_days") as string),
    price: parseFloat(formData.get("price") as string),
    package_type: formData.get("package_type") as string,
    is_active: true,
  });

  if (error) return { error: `Paket oluşturulamadı: ${error.message}` };

  revalidatePath(`/${locale}/admin/packages`);
  return { success: true };
}

export async function updatePackage(id: string, formData: FormData) {
  const locale = (formData.get("locale") as string) || "tr";
  const supabase = await createClient();

  const { error } = await supabase
    .from("membership_packages")
    .update({
      name: formData.get("name") as string,
      duration_days: parseInt(formData.get("duration_days") as string),
      price: parseFloat(formData.get("price") as string),
      package_type: formData.get("package_type") as string,
    })
    .eq("id", id);

  if (error) return { error: `Paket güncellenemedi: ${error.message}` };

  revalidatePath(`/${locale}/admin/packages`);
  return { success: true };
}

export async function togglePackageStatus(id: string, isActive: boolean, locale: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("membership_packages")
    .update({ is_active: !isActive })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/${locale}/admin/packages`);
  return { success: true };
}
