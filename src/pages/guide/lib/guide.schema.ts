import { z } from "zod";
import { requiredStringId } from "@/lib/core.schema";

// Schema para los detalles de la guía
export const guideDetailSchema = z.object({
  product_id: requiredStringId("Debe seleccionar un producto"),
  quantity: z
    .string()
    .min(1, { message: "La cantidad es requerida" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "La cantidad debe ser un número mayor a 0",
    }),
  unit_code: z.string().min(1, { message: "El código de unidad es requerido" }),
  description: z.string().min(1, { message: "La descripción es requerida" }),
});

// Schema principal para crear/actualizar guía
export const guideSchema = z.object({
  company_id: requiredStringId("Debe seleccionar una empresa"),
  branch_id: requiredStringId("Debe seleccionar una tienda"),
  warehouse_id: requiredStringId("Debe seleccionar un almacén"),
  sale_id: z.string().optional(),
  customer_id: requiredStringId("Debe seleccionar un cliente"),
  issue_date: z.string().min(1, { message: "La fecha de emisión es requerida" }),
  transfer_date: z.string().min(1, { message: "La fecha de traslado es requerida" }),
  modality: z.string().min(1, { message: "La modalidad es requerida" }),
  motive_id: requiredStringId("Debe seleccionar un motivo de traslado"),
  sale_document_number: z.string().min(1, { message: "El número de documento de venta es requerido" }),
  carrier_document_type: z.string().min(1, { message: "El tipo de documento del transportista es requerido" }),
  carrier_document_number: z.string().min(1, { message: "El número de documento del transportista es requerido" }),
  carrier_name: z.string().min(1, { message: "El nombre del transportista es requerido" }),
  carrier_ruc: z.string().min(11, { message: "El RUC debe tener 11 dígitos" }).max(11, { message: "El RUC debe tener 11 dígitos" }),
  carrier_mtc_number: z.string().min(1, { message: "El número MTC es requerido" }),
  vehicle_plate: z.string().optional(),
  driver_document_type: z.string().optional(),
  driver_document_number: z.string().optional(),
  driver_name: z.string().optional(),
  driver_license: z.string().optional(),
  origin_address: z.string().min(1, { message: "La dirección de origen es requerida" }),
  origin_ubigeo: z.string().min(6, { message: "El ubigeo debe tener 6 dígitos" }).max(6, { message: "El ubigeo debe tener 6 dígitos" }),
  destination_address: z.string().min(1, { message: "La dirección de destino es requerida" }),
  destination_ubigeo: z.string().min(6, { message: "El ubigeo debe tener 6 dígitos" }).max(6, { message: "El ubigeo debe tener 6 dígitos" }),
  unit_measurement: z.string().min(1, { message: "La unidad de medida es requerida" }),
  total_weight: z
    .string()
    .or(z.number())
    .transform((val) => (typeof val === "string" ? Number(val) : val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "El peso total debe ser mayor a 0",
    }),
  total_packages: z
    .string()
    .or(z.number())
    .transform((val) => (typeof val === "string" ? Number(val) : val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "El total de bultos debe ser mayor a 0",
    }),
  observations: z.string().optional(),
  details: z.array(guideDetailSchema).min(1, { message: "Debe agregar al menos un detalle" }),
});

export type GuideSchema = z.infer<typeof guideSchema>;
export type GuideDetailSchema = z.infer<typeof guideDetailSchema>;
