import { z } from "zod";
import { requiredStringId } from "@/lib/core.schema";

export const productSchemaCreate = z.object({
  codigo: z
    .string()
    .min(1, { message: "El código es requerido" })
    .max(50, { message: "El código no puede exceder 50 caracteres" }),
  name: z
    .string()
    .min(1, { message: "El nombre es requerido" })
    .max(255, { message: "El nombre no puede exceder 255 caracteres" }),
  company_id: requiredStringId("Debe seleccionar una empresa"),
  category_id: requiredStringId("Debe seleccionar una categoría"),
  product_type_id: requiredStringId("Debe seleccionar un tipo de producto"),
  brand_id: requiredStringId("Debe seleccionar una marca"),
  unit_id: requiredStringId("Debe seleccionar una unidad"),
  purchase_price: z
    .string()
    .optional()
    .default("")
    .refine((val) => val === "" || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: "Debe ser un número válido mayor o igual a 0",
    }),
  sale_price: z
    .string()
    .optional()
    .default("")
    .refine((val) => val === "" || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: "Debe ser un número válido mayor o igual a 0",
    }),
  is_taxed: z.number().min(0).max(1).default(1),
  supplier_id: requiredStringId("Debe seleccionar un proveedor"),
  nationality_id: z.string().optional().default(""),
  comment: z.string().optional().default(""),
  weight: z
    .string()
    .optional()
    .default("")
    .refine((val) => val === "" || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: "Debe ser un número válido mayor o igual a 0",
    }),
  price_per_kg: z
    .string()
    .optional()
    .default("")
    .refine((val) => val === "" || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: "Debe ser un número válido mayor o igual a 0",
    }),
  commission_percentage: z
    .string()
    .optional()
    .default("")
    .refine((val) => val === "" || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: "Debe ser un número válido mayor o igual a 0",
    }),
  accounting_cost: z
    .string()
    .optional()
    .default("")
    .refine((val) => val === "" || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: "Debe ser un número válido mayor o igual a 0",
    }),
  inventory_cost: z
    .string()
    .optional()
    .default("")
    .refine((val) => val === "" || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: "Debe ser un número válido mayor o igual a 0",
    }),
});

export const productSchemaUpdate = productSchemaCreate.partial();

export type ProductSchema = z.infer<typeof productSchemaCreate>;
