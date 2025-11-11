import { z } from "zod";

// Schema para Weight Range
export const weightRangeSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "Máximo 100 caracteres"),
  min_weight: z.coerce
    .number({ error: "Debe ser un número" })
    .min(0, "El peso mínimo no puede ser negativo"),
  max_weight: z.coerce
    .number({ error: "Debe ser un número" })
    .nullable()
    .refine((val) => val === null || val >= 0, {
      message: "El peso máximo no puede ser negativo",
    }),
  order: z.coerce
    .number({ error: "Debe ser un número" })
    .int("Debe ser un número entero")
    .min(1, "El orden debe ser mayor a 0"),
});

// Schema para Product Price
export const productPriceSchema = z.object({
  product_id: z.coerce
    .number({ error: "Debe seleccionar un producto" })
    .int("Debe ser un número entero")
    .min(1, "Debe seleccionar un producto"),
  weight_range_index: z.coerce
    .number({ error: "Debe ser un número" })
    .int("Debe ser un número entero")
    .min(0, "El índice no puede ser negativo"),
  price: z.coerce
    .number({ error: "Debe ser un número" })
    .min(0, "El precio no puede ser negativo"),
  currency: z.string().min(1, "La moneda es requerida").default("PEN"),
});

// Schema principal para crear lista de precio
export const priceListSchemaCreate = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(255, "Máximo 255 caracteres"),
  code: z.string().max(50, "Máximo 50 caracteres").optional().default(""),
  description: z.string().max(500, "Máximo 500 caracteres").default(""),
  is_active: z.boolean().default(true),
  weight_ranges: z
    .array(weightRangeSchema)
    .min(1, "Debe agregar al menos un rango de peso")
    .refine(
      (ranges) => {
        // Validar que no haya rangos con orden duplicado
        const orders = ranges.map((r) => r.order);
        return orders.length === new Set(orders).size;
      },
      {
        message: "No puede haber rangos con el mismo orden",
      }
    )
    .refine(
      (ranges) => {
        // Validar que max_weight sea mayor que min_weight
        return ranges.every(
          (r) => r.max_weight === null || r.max_weight > r.min_weight
        );
      },
      {
        message: "El peso máximo debe ser mayor que el peso mínimo",
      }
    ),
  product_prices: z.array(productPriceSchema).optional().default([]),
});

// Schema para actualizar (todos los campos opcionales excepto weight_ranges)
export const priceListSchemaUpdate = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(255, "Máximo 255 caracteres")
    .optional(),
  description: z.string().max(500, "Máximo 500 caracteres").optional(),
  is_active: z.boolean().optional(),
  weight_ranges: z
    .array(weightRangeSchema)
    .min(1, "Debe agregar al menos un rango de peso")
    .refine(
      (ranges) => {
        const orders = ranges.map((r) => r.order);
        return orders.length === new Set(orders).size;
      },
      {
        message: "No puede haber rangos con el mismo orden",
      }
    )
    .refine(
      (ranges) => {
        return ranges.every(
          (r) => r.max_weight === null || r.max_weight > r.min_weight
        );
      },
      {
        message: "El peso máximo debe ser mayor que el peso mínimo",
      }
    )
    .optional(),
  product_prices: z.array(productPriceSchema).optional(),
});

// Schema para asignar cliente
export const assignClientSchema = z.object({
  person_id: z
    .number({ error: "Debe seleccionar un cliente" })
    .int("Debe ser un número entero")
    .min(1, "Debe seleccionar un cliente"),
});

// Schema para consultar precio
export const getPriceSchema = z.object({
  person_id: z.coerce
    .number({ error: "Debe seleccionar un cliente" })
    .int("Debe ser un número entero")
    .min(1, "Debe seleccionar un cliente"),
  product_id: z.coerce
    .number({ error: "Debe seleccionar un producto" })
    .int("Debe ser un número entero")
    .min(1, "Debe seleccionar un producto"),
  weight: z.coerce
    .number({ error: "Debe ingresar un peso" })
    .min(0, "El peso no puede ser negativo"),
});

// Tipos inferidos
export type PriceListSchemaCreate = z.infer<typeof priceListSchemaCreate>;
export type PriceListSchemaUpdate = z.infer<typeof priceListSchemaUpdate>;
export type WeightRangeSchema = z.infer<typeof weightRangeSchema>;
export type ProductPriceSchema = z.infer<typeof productPriceSchema>;
export type AssignClientSchema = z.infer<typeof assignClientSchema>;
export type GetPriceSchema = z.infer<typeof getPriceSchema>;
