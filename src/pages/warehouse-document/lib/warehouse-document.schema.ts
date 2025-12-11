import { z } from "zod";
import { requiredStringId } from "@/lib/core.schema";

// Schema para los detalles del documento
export const warehouseDocumentDetailSchema = z.object({
  id: z.number().optional(),
  product_id: requiredStringId("Debe seleccionar un producto"),
  quantity: z
    .number({ message: "La cantidad es requerida" })
    .positive("La cantidad debe ser mayor a 0"),
  unit_price: z
    .number({ message: "El precio unitario es requerido" })
    .nonnegative("El precio unitario no puede ser negativo"),
  observations: z
    .string()
    .max(500, "Las observaciones no pueden exceder 500 caracteres")
    .optional(),
});

// Schema principal para crear documento
export const warehouseDocumentSchemaCreate = z
  .object({
    warehouse_origin_id: requiredStringId("Debe seleccionar un almacén de origen"),
    document_type: z
      .string()
      .min(1, { message: "Debe seleccionar un tipo de documento" }),
    motive: z.string().min(1, { message: "Debe seleccionar un motivo" }),
    warehouse_dest_id: z.string().optional(),
    responsible_origin_id: z.string(),
    responsible_dest_id: z.string().optional(),
    movement_date: z
      .string()
      .min(1, { message: "La fecha del movimiento es requerida" })
      .refine(
        (date) => {
          const selectedDate = new Date(date);
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          return selectedDate <= today;
        },
        { message: "La fecha no puede ser posterior a hoy" }
      ),
    purchase_id: z.string().optional(),
    observations: z
      .string()
      .max(1000, {
        message: "Las observaciones no pueden exceder 1000 caracteres",
      })
      .default(""),
    details: z
      .array(warehouseDocumentDetailSchema)
      .min(1, { message: "Debe agregar al menos un detalle" }),
  })
  .refine(
    (data) => {
      if (data.document_type === "TRASLADO") {
        return !!data.warehouse_dest_id;
      }
      return true;
    },
    {
      message: "Debe seleccionar un almacén de destino para traslados",
      path: ["warehouse_dest_id"],
    }
  )
  .refine(
    (data) => {
      if (data.document_type === "TRASLADO") {
        return !!data.responsible_origin_id;
      }
      return true;
    },
    {
      message: "Debe seleccionar un responsable de origen para traslados",
      path: ["responsible_origin_id"],
    }
  )
  .refine(
    (data) => {
      if (data.document_type === "TRASLADO") {
        return !!data.responsible_dest_id;
      }
      return true;
    },
    {
      message: "Debe seleccionar un responsable de destino para traslados",
      path: ["responsible_dest_id"],
    }
  );

export const warehouseDocumentSchemaUpdate =
  warehouseDocumentSchemaCreate.partial();

export type WarehouseDocumentSchema = z.infer<
  typeof warehouseDocumentSchemaCreate
>;
export type WarehouseDocumentDetailSchema = z.infer<
  typeof warehouseDocumentDetailSchema
>;
