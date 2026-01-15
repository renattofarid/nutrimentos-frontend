import { requiredStringId } from "@/lib/core.schema";
import { z } from "zod";

// ===== MAIN DELIVERY SHEET SCHEMA =====

export const deliverySheetSchemaCreate = z
  .object({
    branch_id: requiredStringId("Debe seleccionar una tienda"),
    zone_id: z.string().optional(),
    customer_id: z.string().optional(),
    type: z.string().min(1, { message: "Debe seleccionar un tipo" }),
    issue_date: z
      .string()
      .min(1, { message: "La fecha de emisión es requerida" })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "La fecha de emisión no es válida",
      }),
    delivery_date: z
      .string()
      .min(1, { message: "La fecha de entrega es requerida" })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "La fecha de entrega no es válida",
      }),
    sale_ids: z
      .array(z.number())
      .min(1, { message: "Debe seleccionar al menos una venta" }),
    observations: z.string().max(500).optional(),
    for_single_customer: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // Si es para un cliente único, customer_id es requerido
      if (data.for_single_customer) {
        return data.customer_id && data.customer_id.trim().length > 0;
      }
      // Si es multi-cliente, zone_id es requerido
      return data.zone_id && data.zone_id.trim().length > 0;
    },
    {
      message: "Debe seleccionar una zona o un cliente según el tipo de planilla",
      path: ["zone_id"], // El error se mostrará en zone_id por defecto
    }
  );

export type DeliverySheetSchema = z.infer<typeof deliverySheetSchemaCreate>;

// ===== UPDATE SCHEMA =====

export const deliverySheetSchemaUpdate = deliverySheetSchemaCreate.partial();

export type DeliverySheetUpdateSchema = z.infer<
  typeof deliverySheetSchemaUpdate
>;

// ===== STATUS UPDATE SCHEMA =====

export const deliverySheetStatusSchema = z.object({
  status: z
    .string()
    .min(1, { message: "Debe seleccionar un estado" })
    .refine((val) => val === "EN_REPARTO" || val === "PENDIENTE", {
      message: "El estado debe ser EN_REPARTO o PENDIENTE",
    }),
  delivery_date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "La fecha de entrega no es válida",
    })
    .optional(),
  observations: z.string().max(500).optional(),
});

export type DeliverySheetStatusSchema = z.infer<
  typeof deliverySheetStatusSchema
>;

// ===== SETTLEMENT SCHEMA =====

export const settlementSaleSchema = z.object({
  sale_id: z.number(),
  delivery_status: z
    .string()
    .min(1, { message: "Debe seleccionar un estado de entrega" })
    .refine(
      (val) =>
        val === "ENTREGADO" || val === "NO_ENTREGADO" || val === "DEVUELTO",
      {
        message: "El estado debe ser ENTREGADO, NO_ENTREGADO o DEVUELTO",
      }
    ),
  delivery_notes: z.string().max(500).optional(),
});

export type SettlementSaleSchema = z.infer<typeof settlementSaleSchema>;

export const settlementSchema = z.object({
  sales: z
    .array(settlementSaleSchema)
    .min(1, { message: "Debe incluir al menos una venta" }),
});

export type SettlementSchema = z.infer<typeof settlementSchema>;

// ===== PAYMENT SCHEMA =====

export const deliverySheetPaymentSchema = z.object({
  payment_date: z
    .string()
    .min(1, { message: "La fecha de pago es requerida" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "La fecha de pago no es válida",
    }),
  amount_cash: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El monto en efectivo debe ser un número válido",
    })
    .default("0"),
  amount_card: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El monto con tarjeta debe ser un número válido",
    })
    .default("0"),
  amount_yape: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El monto Yape debe ser un número válido",
    })
    .default("0"),
  amount_plin: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El monto Plin debe ser un número válido",
    })
    .default("0"),
  amount_deposit: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El monto de depósito debe ser un número válido",
    })
    .default("0"),
  amount_transfer: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El monto de transferencia debe ser un número válido",
    })
    .default("0"),
  amount_other: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "El monto de otro método debe ser un número válido",
    })
    .default("0"),
  observations: z.string().max(500).optional(),
});

export type DeliverySheetPaymentSchema = z.infer<
  typeof deliverySheetPaymentSchema
>;
