import { z } from "zod";

export const warehouseDocReasonSchemaCreate = z.object({
  name: z
    .string()
    .max(255, {
      message: "El nombre no puede tener más de 255 caracteres",
    })
    .min(1, {
      message: "El nombre es requerido",
    }),
  type: z
    .string()
    .min(1, {
      message: "El tipo es requerido",
    })
    .refine((val) => val === "ingreso" || val === "egreso", {
      message: "El tipo debe ser 'ingreso' o 'egreso'",
    }),
});

export const warehouseDocReasonSchemaUpdate = warehouseDocReasonSchemaCreate.partial();

export type WarehouseDocReasonSchema = z.infer<typeof warehouseDocReasonSchemaCreate>;
