import { z } from "zod";

// Boş string'i undefined'a çevir (opsiyonel alanlar için)
const optionalText = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().optional()
);

// Shared profile fields.
// Zorunlu: ad, soyad. Diğerleri opsiyonel (defter kullanımına göre).
const profileBase = z.object({
  first_name: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  last_name: z.string().min(2, "Soyad en az 2 karakter olmalıdır"),
  phone: optionalText,
  birth_date: optionalText,
  birth_place: optionalText,
  occupation: optionalText,
  address: optionalText,
});

// Membership + login fields shared by both new/existing modes.
// Zorunlu: paket. PIN her zaman opsiyonel (giriş özelliği sonraki aşamada).
const membershipBase = z.object({
  package_id: z.string().uuid("Geçerli bir paket seçiniz"),
  password: optionalText,
  payment_amount: z
    .preprocess(
      (v) => (typeof v === "string" && v.trim() !== "" ? parseFloat(v) : undefined),
      z.number().min(0, "Ödeme tutarı 0 veya daha fazla olmalıdır").optional()
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
