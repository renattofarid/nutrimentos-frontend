import { requiredStringId } from "@/lib/core.schema";
import { z } from "zod";

export const boxSchemaCreate = z.object({
  name: z
    .string()
    .max(255, {
      message: "El nombre no puede tener más de 255 caracteres",
    })
    .min(1, {
      message: "El nombre es requerido",
    }),
  serie: z
    .string()
    .max(10, {
      message: "La serie no puede tener más de 10 caracteres",
    })
    .min(3, {
      message: "La serie debe tener al menos 3 caracteres",
    })
    .regex(/^[0-9]+$/, {
      message: "La serie solo debe contener números",
    }),
  branch_id: requiredStringId("La sucursal es requerida"),
});

export const boxSchemaUpdate = boxSchemaCreate.partial();

export type BoxSchema = z.infer<typeof boxSchemaCreate>;
