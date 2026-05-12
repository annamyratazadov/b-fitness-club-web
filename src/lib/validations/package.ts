import { z } from "zod";

export const packageSchema = z.object({
  name: z.string().min(2, "Paket adı en az 2 karakter olmalıdır"),
  duration_days: z.number().min(1, "Süre en az 1 gün olmalıdır"),
  price: z.number().min(0, "Fiyat 0'dan büyük olmalıdır"),
  package_type: z.enum(["student", "normal"]),
  is_active: z.boolean().default(true),
});

export type PackageFormValues = z.infer<typeof packageSchema>;
