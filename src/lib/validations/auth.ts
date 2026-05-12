import { z } from "zod";

export const loginSchema = z.object({
  phone: z
    .string()
    .min(10, "Telefon numarası en az 10 karakter olmalıdır")
    .max(15, "Telefon numarası en fazla 15 karakter olmalıdır"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

export const adminLoginSchema = z.object({
  email: z.string().email("Geçerli bir email adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;
