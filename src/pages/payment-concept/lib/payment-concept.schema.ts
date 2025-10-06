import { z } from "zod";

export const paymentConceptSchemaCreate = z.object({
  name: z
    .string()
    .min(1, { message: "El nombre es requerido" })
    .max(100, { message: "El nombre no puede exceder 100 caracteres" }),
  type: z
    .string()
    .min(1, { message: "El tipo es requerido" })
    .refine((val) => val === "INGRESO" || val === "EGRESO", {
      message: "El tipo debe ser INGRESO o EGRESO",
    }),
});

export const paymentConceptSchemaUpdate = paymentConceptSchemaCreate.partial();

export type PaymentConceptSchema = z.infer<typeof paymentConceptSchemaCreate>;
