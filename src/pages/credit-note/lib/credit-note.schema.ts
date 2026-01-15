import { z } from "zod";
import { requiredNumberId } from "@/lib/core.schema";

export const creditNoteDetailSchema = z.object({
  sale_detail_id: z.number(),
  product_id: z.number(),
  quantity_sacks: z.number().min(0, "La cantidad no puede ser negativa"),
  quantity_kg: z.number().min(0, "La cantidad no puede ser negativa"),
  unit_price: z.number().min(0, "El precio no puede ser negativo"),
  selected: z.boolean().default(false),
});

export const creditNoteSchemaCreate = z.object({
  sale_id: requiredNumberId("La venta es requerida"),
  issue_date: z.string().min(1, "La fecha de emisión es requerida"),
  credit_note_motive_id: requiredNumberId("El motivo es requerido"),
  affects_stock: z.boolean().default(true),
  observations: z
    .string()
    .max(500, "Las observaciones no pueden exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
  details: z
    .array(creditNoteDetailSchema)
    .refine(
      (details) => details.some((d) => d.selected),
      "Debe seleccionar al menos un detalle"
    ),
});

export const creditNoteSchemaUpdate = creditNoteSchemaCreate.partial();

export type CreditNoteSchema = z.infer<typeof creditNoteSchemaCreate>;
export type CreditNoteDetailSchema = z.infer<typeof creditNoteDetailSchema>;
