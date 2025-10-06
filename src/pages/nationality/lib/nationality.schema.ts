import { z } from "zod";

export const nationalitySchemaCreate = z.object({
  name: z
    .string()
    .min(1, { message: "El nombre es requerido" })
    .max(100, { message: "El nombre no puede exceder 100 caracteres" }),
  code: z
    .string()
    .min(1, { message: "El código es requerido" })
    .max(10, { message: "El código no puede exceder 10 caracteres" })
    .refine((val) => /^[A-Z]+$/.test(val), {
      message: "El código solo puede contener letras mayúsculas",
    }),
});

export const nationalitySchemaUpdate = nationalitySchemaCreate.partial();

export type NationalitySchema = z.infer<typeof nationalitySchemaCreate>;
