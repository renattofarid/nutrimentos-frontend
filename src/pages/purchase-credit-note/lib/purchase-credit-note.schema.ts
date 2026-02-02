import { requiredStringId } from "@/lib/core.schema";
import { z } from "zod";

export const purchaseCreditNoteDetailSchema = z.object({
  purchase_detail_id: z.number().optional().nullable(),
  product_id: z.number(),
  quantity_sacks: z.number().min(0, "La cantidad no puede ser negativa"),
  quantity_kg: z.number().min(0, "La cantidad no puede ser negativa"),
  unit_price: z.number().min(0, "El precio no puede ser negativo"),
  description: z.string().max(500).optional().or(z.literal("")),
  selected: z.boolean(),
});

export const purchaseCreditNoteSchemaCreate = z
  .object({
    is_detailed: z.boolean(),
    purchase_id: z.string().optional().or(z.literal("")),
    supplier_id: requiredStringId("El proveedor es requerido"),
    warehouse_id: z.string().optional().or(z.literal("")),
    document_type: requiredStringId("El tipo de documento es requerido"),
    issue_date: z.string().min(1, "La fecha de emisión es requerida"),
    affected_document_type: requiredStringId(
      "El tipo de documento afectado es requerido",
    ),
    affected_document_number: z
      .string()
      .min(1, "El número de documento afectado es requerido")
      .max(255),
    affected_issue_date: z
      .string()
      .min(1, "La fecha del documento afectado es requerida"),
    credit_note_type_id: requiredStringId("El tipo de nota de crédito es requerido"),
    credit_note_description: z
      .string()
      .max(500, "La descripción no puede exceder 500 caracteres")
      .optional()
      .or(z.literal("")),
    currency: z.string().optional().or(z.literal("")),
    observations: z
      .string()
      .max(1000, "Las observaciones no pueden exceder 1000 caracteres")
      .optional()
      .or(z.literal("")),
    // Campos consolidada
    subtotal: z.number().min(0).optional().nullable(),
    tax_amount: z.number().min(0).optional().nullable(),
    total_amount: z.number().min(0).optional().nullable(),
    // Detalles
    details: z.array(purchaseCreditNoteDetailSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.is_detailed) {
        return (
          data.details &&
          data.details.length > 0 &&
          data.details.some((d) => d.selected)
        );
      }
      return true;
    },
    {
      message: "Debe seleccionar al menos un detalle",
      path: ["details"],
    },
  )
  .refine(
    (data) => {
      if (!data.is_detailed) {
        return (
          data.subtotal != null &&
          data.tax_amount != null &&
          data.total_amount != null &&
          data.total_amount > 0
        );
      }
      return true;
    },
    {
      message: "Debe ingresar los montos para la nota de crédito consolidada",
      path: ["total_amount"],
    },
  );

export const purchaseCreditNoteSchemaUpdate = purchaseCreditNoteSchemaCreate;

export type PurchaseCreditNoteSchema = z.infer<
  typeof purchaseCreditNoteSchemaCreate
>;
export type PurchaseCreditNoteDetailSchema = z.infer<
  typeof purchaseCreditNoteDetailSchema
>;
