import { z } from "zod";
import { requiredStringId } from "@/lib/form-utils";

export const settingSchemaCreate = z.object({
  branch_id: requiredStringId("La sucursal es requerida"),
  allow_multiple_prices: z.boolean(),
  allow_invoice: z.boolean(),
  allow_negative_stock: z.boolean(),
  default_currency: z.string().max(10).min(1, "La moneda es requerida"),
  tax_percentage: z.string().min(1, "El porcentaje de impuesto es requerido"),
});

export const settingSchemaEdit = settingSchemaCreate;

export type SettingSchemaCreate = z.infer<typeof settingSchemaCreate>;
export type SettingSchemaEdit = z.infer<typeof settingSchemaEdit>;
