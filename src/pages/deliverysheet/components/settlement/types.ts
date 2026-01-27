import { z } from "zod";
import type { SheetSale } from "../../lib/deliverysheet.interface";

export type SaleWithIndex = SheetSale & { index: number };

export const saleSettlementSchema = z.object({
  sale_id: z.number(),
  delivery_status: z
    .string()
    .min(1, { message: "Debe seleccionar un estado de entrega" }),
  delivery_notes: z
    .string()
    .max(500, { message: "Las notas no pueden exceder 500 caracteres" })
    .optional(),
  payment_amount: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El monto debe ser un número válido mayor o igual a 0",
    })
    .refine(
      (val) => {
        const num = Number(val);
        return (
          num.toString().split(".")[1]?.length <= 2 ||
          !num.toString().includes(".")
        );
      },
      {
        message: "El monto debe tener máximo 2 decimales",
      },
    )
    .default("0"),
});

export const settlementFormSchema = z.object({
  sales: z
    .array(saleSettlementSchema)
    .min(1, { message: "Debe haber al menos una venta" }),
  payment_date: z
    .string()
    .min(1, { message: "La fecha de pago es requerida" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "La fecha de pago no es válida",
    }),
  observations: z
    .string()
    .max(500, { message: "Las observaciones no pueden exceder 500 caracteres" })
    .optional(),
});

export type SettlementFormSchema = z.infer<typeof settlementFormSchema>;
