import { z } from "zod";

export const documentTypeSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(255, "El nombre debe tener máximo 255 caracteres"),
});

export type DocumentTypeSchema = z.infer<typeof documentTypeSchema>;

