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
  type: z.enum(["INGRESO", "EGRESO"], {
    message: "El tipo debe ser INGRESO o EGRESO",
  }),
});

export const warehouseDocReasonSchemaUpdate =
  warehouseDocReasonSchemaCreate.partial();

export type WarehouseDocReasonSchema = z.infer<
  typeof warehouseDocReasonSchemaCreate
>;
