import { z } from "zod";

export const memberSchema = z.object({
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
  package_id: z.string().uuid("Geçerli bir paket seçiniz"),
  start_date: z.string().optional(),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır").optional(),
});

export const memberUpdateSchema = memberSchema.omit({
  package_id: true,
  password: true,
  start_date: true,
});

export type MemberFormValues = z.infer<typeof memberSchema>;
export type MemberUpdateFormValues = z.infer<typeof memberUpdateSchema>;
