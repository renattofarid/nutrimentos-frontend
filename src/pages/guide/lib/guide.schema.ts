import { z } from "zod";
import { requiredStringId } from "@/lib/core.schema";

// Schema principal para crear/actualizar guía
export const guideSchema = z
  .object({
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
    carrier_document_type: z.string().optional(),
    carrier_document_number: z.string().optional(),
    carrier_name: z.string().optional(),
    carrier_ruc: z.string().optional(),
    carrier_mtc_number: z.string().optional(),
    vehicle_id: z.string().optional(),
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
  })
  .superRefine((data, ctx) => {
    // Validaciones condicionales cuando la modalidad es PUBLICO
    if (data.modality === "PUBLICO") {
      // Validar campos del transportista
      if (!data.carrier_document_number || data.carrier_document_number.length !== 11) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El RUC del transportista debe tener 11 dígitos (requerido para transporte público)",
          path: ["carrier_document_number"],
        });
      }

      if (!data.carrier_name || data.carrier_name.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El nombre del transportista es requerido para transporte público",
          path: ["carrier_name"],
        });
      }

      if (!data.carrier_mtc_number || data.carrier_mtc_number.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El número MTC es requerido para transporte público",
          path: ["carrier_mtc_number"],
        });
      }

      // Validar campos del vehículo
      if (!data.vehicle_id || data.vehicle_id.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El vehículo es requerido para transporte público",
          path: ["vehicle_id"],
        });
      }

      // Validar campos del conductor
      if (!data.driver_document_type || data.driver_document_type.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El tipo de documento del conductor es requerido para transporte público",
          path: ["driver_document_type"],
        });
      }

      if (!data.driver_document_number || data.driver_document_number.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El número de documento del conductor es requerido para transporte público",
          path: ["driver_document_number"],
        });
      }

      if (!data.driver_name || data.driver_name.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El nombre del conductor es requerido para transporte público",
          path: ["driver_name"],
        });
      }

      if (!data.driver_license || data.driver_license.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La licencia del conductor es requerida para transporte público",
          path: ["driver_license"],
        });
      }
    }
  });

export type GuideSchema = z.infer<typeof guideSchema>;
