"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateLanguage(language: "tr" | "en") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({ language })
    .eq("id", user.id);

  revalidatePath("/", "layout");
}
