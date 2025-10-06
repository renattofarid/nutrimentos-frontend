import { z } from "zod";

export const zoneSchemaCreate = z.object({
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

export const zoneSchemaUpdate = zoneSchemaCreate.partial();

export type ZoneSchema = z.infer<typeof zoneSchemaCreate>;
