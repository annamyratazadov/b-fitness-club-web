"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

function phoneToEmail(phone: string): string {
  return `${phone.replace(/[\s\-\(\)]/g, "")}@bfitness.local`;
}

export async function createMember(formData: FormData) {
  const locale = (formData.get("locale") as string) || "tr";
  const mode = ((formData.get("mode") as string) || "new") as "new" | "existing";
  const phone = (formData.get("phone") as string).trim();
  const password = formData.get("password") as string;
  const packageId = formData.get("package_id") as string;
  const today = new Date().toISOString().split("T")[0];

  // For "new": always use today. For "existing": use the form-provided start_date.
  let startDate = today;
  if (mode === "existing") {
    const provided = (formData.get("start_date") as string) || "";
    if (!provided) {
      return { error: "Mevcut üye için başlangıç tarihi zorunludur." };
    }
    // Guard: start_date must not be in the future
    if (new Date(provided) > new Date(today)) {
      return { error: "Başlangıç tarihi bugünden sonra olamaz." };
    }
    startDate = provided;
  }

  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  // Check phone uniqueness
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("phone", phone)
    .single();

  if (existing) {
    return { error: "Bu telefon numarası zaten kayıtlı." };
  }

  // Fetch package to calculate end_date
  const { data: pkg } = await supabase
    .from("membership_packages")
    .select("duration_days, price")
    .eq("id", packageId)
    .single();

  if (!pkg) {
    return { error: "Geçersiz paket seçimi." };
  }

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + pkg.duration_days);
  const endDateStr = endDate.toISOString().split("T")[0];

  // is_active: only true if end_date is in the future (i.e., membership not yet expired)
  const isActive = endDate >= new Date(today);

  // Custom payment amount (admin can apply a discount); fallback to package price
  const paymentRaw = formData.get("payment_amount") as string | null;
  const paymentAmount =
    paymentRaw && !isNaN(parseFloat(paymentRaw)) ? parseFloat(paymentRaw) : pkg.price;

  // Create auth user with service role
  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email: phoneToEmail(phone),
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return { error: `Kullanıcı oluşturulamadı: ${authError?.message}` };
  }

  const userId = authData.user.id;

  // Insert profile
  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone,
    birth_date: formData.get("birth_date") as string,
    birth_place: formData.get("birth_place") as string,
    occupation: formData.get("occupation") as string,
    address: formData.get("address") as string,
    role: "member",
    status: "active",
    language: "tr",
  });

  if (profileError) {
    // Rollback auth user
    await adminSupabase.auth.admin.deleteUser(userId);
    return { error: `Profil oluşturulamadı: ${profileError.message}` };
  }

  // Insert membership
  const { error: membershipError } = await supabase.from("memberships").insert({
    member_id: userId,
    package_id: packageId,
    start_date: startDate,
    end_date: endDateStr,
    payment_amount: paymentAmount,
    is_active: isActive,
  });

  if (membershipError) {
    await adminSupabase.auth.admin.deleteUser(userId);
    return { error: `Üyelik oluşturulamadı: ${membershipError.message}` };
  }

  revalidatePath(`/${locale}/admin/members`);
  revalidatePath(`/${locale}/admin/dashboard`);
  redirect(`/${locale}/admin/members/${userId}`);
}

export async function updateMember(id: string, formData: FormData) {
  const locale = (formData.get("locale") as string) || "tr";
  const supabase = await createClient();

  const phone = (formData.get("phone") as string).trim();

  // Check phone uniqueness (exclude current member)
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("phone", phone)
    .neq("id", id)
    .single();

  if (existing) {
    return { error: "Bu telefon numarası başka bir üye tarafından kullanılıyor." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      phone,
      birth_date: formData.get("birth_date") as string,
      birth_place: formData.get("birth_place") as string,
      occupation: formData.get("occupation") as string,
      address: formData.get("address") as string,
    })
    .eq("id", id);

  if (error) {
    return { error: `Güncelleme başarısız: ${error.message}` };
  }

  revalidatePath(`/${locale}/admin/members`);
  revalidatePath(`/${locale}/admin/members/${id}`);
  redirect(`/${locale}/admin/members/${id}`);
}

export async function deleteMember(id: string, locale: string) {
  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  // Get current admin user
  const { data: { user: adminUser } } = await supabase.auth.getUser();
  if (!adminUser) return { error: "Yetkisiz işlem." };

  // Fetch member data for log
  const { data: memberData } = await supabase
    .from("profiles")
    .select(`*, memberships(*, membership_packages(*))`)
    .eq("id", id)
    .single();

  if (!memberData) return { error: "Üye bulunamadı." };

  // Log the deletion
  const { error: logError } = await supabase.from("member_deletion_logs").insert({
    member_id: id,
    deleted_by_admin_id: adminUser.id,
    member_data: memberData,
  });

  if (logError) {
    return { error: `Log kaydı oluşturulamadı: ${logError.message}` };
  }

  // Delete auth user (cascades to profiles)
  const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(id);
  if (deleteError) {
    return { error: `Silme işlemi başarısız: ${deleteError.message}` };
  }

  revalidatePath(`/${locale}/admin/members`);
  redirect(`/${locale}/admin/members`);
}

export async function extendMembership(memberId: string, formData: FormData) {
  const locale = (formData.get("locale") as string) || "tr";
  const packageId = formData.get("package_id") as string;
  const paymentAmount = parseFloat(formData.get("payment_amount") as string);

  const supabase = await createClient();

  // Fetch package details
  const { data: pkg } = await supabase
    .from("membership_packages")
    .select("duration_days, price")
    .eq("id", packageId)
    .single();

  if (!pkg) return { error: "Geçersiz paket." };

  const today = new Date().toISOString().split("T")[0];
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + pkg.duration_days);
  const endDateStr = endDate.toISOString().split("T")[0];

  // Deactivate current active membership
  await supabase
    .from("memberships")
    .update({ is_active: false })
    .eq("member_id", memberId)
    .eq("is_active", true);

  // Create new membership
  const { error } = await supabase.from("memberships").insert({
    member_id: memberId,
    package_id: packageId,
    start_date: today,
    end_date: endDateStr,
    payment_amount: paymentAmount,
    is_active: true,
  });

  if (error) return { error: `Üyelik uzatılamadı: ${error.message}` };

  revalidatePath(`/${locale}/admin/members`);
  revalidatePath(`/${locale}/admin/members/${memberId}`);
  revalidatePath(`/${locale}/admin/dashboard`);

  return { success: true };
}
