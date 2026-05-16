import { z } from "zod";

// Shared profile fields
const profileBase = z.object({
  first_name: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  last_name: z.string().min(2, "Soyad en az 2 karakter olmalıdır"),
  phone: z
    .string()
    .min(10, "Telefon numarası en az 10 karakter olmalıdır")
    .max(15, "Telefon numarası en fazla 15 karakter olmalıdır"),
  birth_date: z.string().min(1, "Doğum tarihi zorunludur"),
  birth_place: z.string().min(2, "Doğum yeri zorunludur"),
  occupation: z.string().min(2, "Meslek zorunludur"),
  address: z.string().min(10, "Adres en az 10 karakter olmalıdır"),
});

// Membership + login fields shared by both new/existing modes
const membershipBase = z.object({
  package_id: z.string().uuid("Geçerli bir paket seçiniz"),
  password: z.string().min(4, "PIN en az 4 karakter olmalıdır"),
  payment_amount: z
    .preprocess(
      (v) => (typeof v === "string" ? parseFloat(v) : v),
      z.number().min(0, "Ödeme tutarı 0 veya daha fazla olmalıdır")
    ),
});

// Yeni Üye Ekle — başlangıç bugün, server'da hesaplanır
export const newMemberSchema = profileBase.merge(membershipBase);

// Mevcut Üye Ekle — geçmiş başlangıç tarihi zorunlu
export const existingMemberSchema = profileBase.merge(membershipBase).extend({
  start_date: z
    .string()
    .min(1, "Başlangıç tarihi zorunludur")
    .refine((s) => {
      const d = new Date(s);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return d <= today;
    }, "Başlangıç tarihi bugünden sonra olamaz"),
});

// Update — only profile fields
export const memberUpdateSchema = profileBase;

// Legacy alias for backward compatibility
export const memberSchema = newMemberSchema;

export type NewMemberFormValues = z.infer<typeof newMemberSchema>;
export type ExistingMemberFormValues = z.infer<typeof existingMemberSchema>;
export type MemberUpdateFormValues = z.infer<typeof memberUpdateSchema>;
export type MemberFormValues = NewMemberFormValues;
