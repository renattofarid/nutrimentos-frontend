import { z } from "zod";
import { requiredStringId } from "@/lib/core.schema";

// Schema principal para crear/actualizar guía
export const guideSchema = z.object({
  branch_id: requiredStringId("Debe seleccionar una tienda"),
  warehouse_id: requiredStringId("Debe seleccionar un almacén"),
  sale_ids: z.array(z.number()).optional(),
  customer_id: requiredStringId("Debe seleccionar un cliente"),
  issue_date: z
    .string()
    .min(1, { message: "La fecha de emisión es requerida" }),
  transfer_date: z
    .string()
    .min(1, { message: "La fecha de traslado es requerida" }),
  modality: z.string().min(1, { message: "La modalidad es requerida" }),
  motive_id: requiredStringId("Debe seleccionar un motivo de traslado"),
  sale_document_number: z.string(),
  // Campos del transportista
  carrier_id: z.string().optional(), // ID interno, no se envía al backend
  carrier_document_type: z
    .string()
    .min(1, { message: "El tipo de documento del transportista es requerido" }),
  carrier_document_number: z.string().min(1, {
    message: "El número de documento del transportista es requerido",
  }),
  carrier_name: z
    .string()
    .min(1, { message: "El nombre del transportista es requerido" }),
  carrier_ruc: z
    .string()
    .min(11, { message: "El RUC debe tener 11 dígitos" })
    .max(11, { message: "El RUC debe tener 11 dígitos" }),
  carrier_mtc_number: z
    .string()
    .min(1, { message: "El número MTC es requerido" }),
  vehicle_plate: z.string().optional(),
  // Campos del conductor
  driver_id: z.string().optional(), // ID interno, no se envía al backend
  driver_document_type: z.string().optional(),
  driver_document_number: z.string().optional(),
  driver_name: z.string().optional(),
  driver_license: z.string().optional(),
  // Direcciones
  origin_address: z
    .string()
    .min(1, { message: "La dirección de origen es requerida" }),
  ubigeo_origin_id: requiredStringId("Debe seleccionar un ubigeo de origen"),
  destination_address: z
    .string()
    .min(1, { message: "La dirección de destino es requerida" }),
  ubigeo_destination_id: requiredStringId(
    "Debe seleccionar un ubigeo de destino",
  ),
  // Información de carga
  unit_measurement: z
    .string()
    .min(1, { message: "La unidad de medida es requerida" }),
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
});

export type GuideSchema = z.infer<typeof guideSchema>;
