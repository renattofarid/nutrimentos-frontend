import { requiredStringId } from "@/lib/core.schema";
import { z } from "zod";

export const creditNoteDetailSchema = z.object({
  sale_detail_id: z.number().min(0, "El detalle de venta no puede ser negativo"),
  product_id: z.number().min(0, "El producto no puede ser negativo"),
  product_code: z.string().max(100).optional().or(z.literal("")),
  product_name: z.string().max(255).optional().or(z.literal("")),
  product_weight: z.number().min(0, "El peso no puede ser negativo"),
  original_quantity_sacks: z
    .number()
    .min(0, "La cantidad original no puede ser negativa"),
  original_quantity_kg: z
    .number()
    .min(0, "La cantidad original no puede ser negativa"),
  quantity_sacks: z.number().min(0, "La cantidad no puede ser negativa"),
  quantity_kg: z.number().min(0, "La cantidad no puede ser negativa"),
  unit_price: z.number().min(0, "El precio no puede ser negativo"),
}).superRefine((detail, ctx) => {
  const hasProduct = detail.product_id > 0;
  const hasQuantity = detail.quantity_sacks > 0 || detail.quantity_kg > 0;
  const hasPrice = detail.unit_price > 0;
  const usesSacks = detail.original_quantity_sacks > 0;
  const usesKg = detail.original_quantity_kg > 0;
  const isBlank =
    !hasProduct &&
    !hasQuantity &&
    !hasPrice &&
    !detail.product_code &&
    !detail.product_name;

  if (isBlank) {
    return;
  }

  if (!hasProduct) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Debe seleccionar un producto",
      path: ["product_id"],
    });
  }

  if (!hasQuantity) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Debe ingresar cantidad en sacos o kg",
      path: ["quantity_sacks"],
    });
  }

  if (!hasPrice) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El precio debe ser mayor a cero",
      path: ["unit_price"],
    });
  }

  if (!usesSacks && !usesKg) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El detalle original de la venta no está disponible",
      path: ["sale_detail_id"],
    });
  }

  if (usesSacks && detail.quantity_sacks > detail.original_quantity_sacks) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La cantidad en sacos no puede ser mayor a la de la venta",
      path: ["quantity_sacks"],
    });
  }

  if (usesKg && detail.quantity_kg > detail.original_quantity_kg) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La cantidad en kg no puede ser mayor a la de la venta",
      path: ["quantity_kg"],
    });
  }
});

export const creditNoteSchemaCreate = z.object({
  sale_id: requiredStringId("La venta es requerida"),
  issue_date: z.string().min(1, "La fecha de emisión es requerida"),
  credit_note_motive_id: requiredStringId("El motivo es requerido"),
  affects_stock: z.boolean(),
  observations: z
    .string()
    .max(500, "Las observaciones no pueden exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
  details: z.array(creditNoteDetailSchema).superRefine((details, ctx) => {
    const hasValidDetail = details.some((detail) => {
      return (
        detail.product_id > 0 &&
        (detail.quantity_sacks > 0 || detail.quantity_kg > 0) &&
        detail.unit_price > 0
      );
    });

    if (!hasValidDetail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe incluir al menos un detalle completo",
        path: [],
      });
    }
  }),
});

export const creditNoteSchemaUpdate = creditNoteSchemaCreate.partial();

export type CreditNoteSchema = z.infer<typeof creditNoteSchemaCreate>;
export type CreditNoteDetailSchema = z.infer<typeof creditNoteDetailSchema>;
