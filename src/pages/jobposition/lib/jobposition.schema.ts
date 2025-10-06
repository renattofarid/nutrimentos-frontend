import { z } from "zod";

export const jobPositionSchemaCreate = z.object({
  name: z
    .string()
    .max(255, {
      message: "El nombre no puede tener más de 255 caracteres",
    })
    .min(1, {
      message: "El nombre es requerido",
    }),
  code: z
    .string()
    .max(10, {
      message: "El código no puede tener más de 10 caracteres",
    })
    .min(1, {
      message: "El código es requerido",
    }),
});

export const jobPositionSchemaUpdate = jobPositionSchemaCreate.partial();

export type JobPositionSchema = z.infer<typeof jobPositionSchemaCreate>;
