import { z } from "zod";
import { requiredNumberId, dateStringSchema } from "@/lib/core.schema";

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
});

export const creditNoteSchemaUpdate = creditNoteSchemaCreate.partial();

export type CreditNoteSchema = z.infer<typeof creditNoteSchemaCreate>;
