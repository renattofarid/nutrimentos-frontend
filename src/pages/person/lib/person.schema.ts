import { onlyLettersSchema, requiredStringId } from "@/lib/core.schema";
import { z } from "zod";

const typeDocumentSchema = z.enum(["DNI", "RUC", "CE", "PASAPORTE"], {
  error: "Debe seleccionar un tipo de documento",
});

const typePersonSchema = z.enum(["NATURAL", "JURIDICA"], {
  error: "Debe seleccionar un tipo de persona",
});

const genderSchema = z.enum(["M", "F", "O"], {
  error: "Debe seleccionar un género",
});

export type TypeDocument = z.infer<typeof typeDocumentSchema>;
export type TypePerson = z.infer<typeof typePersonSchema>;
export type Gender = z.infer<typeof genderSchema>;

// Base schema - number_document is optional initially
const basePersonSchema = z.object({
  type_document: typeDocumentSchema,
  document_type_id: requiredStringId(
    "Debe seleccionar un tipo de documento válido"
  ),
  type_person: typePersonSchema,
  number_document: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]+$/.test(val),
      "El número de documento solo puede contener números"
    )
    .refine(
      (val) => !val || (val.length >= 8 && val.length <= 11),
      "El número de documento debe tener entre 8 y 11 dígitos"
    ),

  names: z
    .string()
    .max(255, "El nombre no puede exceder 255 caracteres")
    .optional()
    .or(z.literal("")),
  gender: genderSchema.optional(),
  birth_date: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Ingrese una fecha válida"
    ),
  father_surname: onlyLettersSchema("apellido paterno"),
  mother_surname: onlyLettersSchema("apellido materno"),

  business_name: z
    .string()
    .min(1, "La razón social es obligatoria")
    .max(255, "La razón social no puede exceder 255 caracteres")
    .refine(
      (val) => !val || val.trim().length > 0,
      "La razón social no puede estar vacía"
    )
    .optional()
    .or(z.literal("")),

  commercial_name: z
    .string()
    .min(1, "El nombre comercial es obligatorio")
    .max(255, "El nombre comercial no puede exceder 255 caracteres")
    .refine(
      (val) => !val || val.trim().length > 0,
      "El nombre comercial no puede estar vacío"
    )
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(200, "La dirección no puede exceder 200 caracteres")
    .optional()
    .or(z.literal("")),

  phone: z
    .string()
    .min(1, "El teléfono es obligatorio")
    .regex(/^[0-9]{9}$/, "El teléfono debe tener exactamente 9 dígitos"),

  email: z
    .email("Ingrese un correo electrónico válido")
    .max(255, "El correo no puede exceder 255 caracteres"),

  // Optional fields for specific contexts
  job_position_id: z.string().optional().or(z.literal("")),
  business_type_id: z.string().optional().or(z.literal("")),
  zone_id: z.string().optional().or(z.literal("")),
  client_category_id: z.string().optional().or(z.literal("")),

  // ocupation: z
  //   .string()
  //   .max(100, "La ocupación no puede exceder 100 caracteres")
  //   .optional()
  //   .or(z.literal("")),

  role_id: requiredStringId("Debe seleccionar un rol válido"),
});

// Factory function to create person schema with optional number_document for clients
export const createPersonSchema = (
  isClient: boolean = false,
  isWorker: boolean = false
) => {
  return basePersonSchema
    .extend({
      names: z
        .string()
        .max(255, "El nombre no puede exceder 255 caracteres")
        .optional()
        .or(z.literal("")),
      gender: genderSchema.optional(),
      birth_date: z
        .string()
        .optional()
        .refine(
          (val) => !val || !isNaN(Date.parse(val)),
          "Ingrese una fecha válida"
        ),
      father_surname: onlyLettersSchema("apellido paterno"),
      mother_surname: onlyLettersSchema("apellido materno"),

      business_name: z
        .string()
        .min(1, "La razón social es obligatoria")
        .max(255, "La razón social no puede exceder 255 caracteres")
        .refine(
          (val) => !val || val.trim().length > 0,
          "La razón social no puede estar vacía"
        )
        .optional()
        .or(z.literal("")),

      commercial_name: z
        .string()
        .min(1, "El nombre comercial es obligatorio")
        .max(255, "El nombre comercial no puede exceder 255 caracteres")
        .refine(
          (val) => !val || val.trim().length > 0,
          "El nombre comercial no puede estar vacío"
        )
        .optional()
        .or(z.literal("")),

      address: z
        .string()
        .min(5, "La dirección debe tener al menos 5 caracteres")
        .max(200, "La dirección no puede exceder 200 caracteres")
        .optional()
        .or(z.literal("")),

      phone: z
        .string()
        .min(1, "El teléfono es obligatorio")
        .regex(/^[0-9]{9}$/, "El teléfono debe tener exactamente 9 dígitos"),

      email: z
        .email("Ingrese un correo electrónico válido")
        .max(255, "El correo no puede exceder 255 caracteres"),

      // Optional fields for specific contexts
      job_position_id: z.string().optional().or(z.literal("")),
      business_type_id: z.string().optional().or(z.literal("")),
      zone_id: z.string().optional().or(z.literal("")),
      client_category_id: z.string().optional().or(z.literal("")),

      role_id: requiredStringId("Debe seleccionar un rol válido"),
    })
    .superRefine((data, ctx) => {
      // Validación condicional para number_document
      // Si NO es Cliente, el número de documento es obligatorio
      if (!isClient) {
        if (!data.number_document || data.number_document.trim() === "") {
          ctx.addIssue({
            code: "invalid_type",
            expected: "string",
            message: "El número de documento es obligatorio",
            path: ["number_document"],
          });
        }
      }

      if (isWorker) {
        // Si es trabajador, job_position_id es obligatorio
        if (!data.job_position_id || data.job_position_id.trim() === "") {
          ctx.addIssue({
            code: "invalid_type",
            expected: "string",
            message:
              "El cargo (job_position_id) es obligatorio para trabajadores",
            path: ["job_position_id"],
          });
        }

        // Si es trabajador, zone_id es obligatorio
        if (!data.zone_id || data.zone_id.trim() === "") {
          ctx.addIssue({
            code: "invalid_type",
            expected: "string",
            message: "La zona (zone_id) es obligatoria para trabajadores",
            path: ["zone_id"],
          });
        }
      }

      // Validación condicional para business_name
      if (data.type_person === "JURIDICA") {
        if (!data.business_name || data.business_name.trim() === "") {
          ctx.addIssue({
            code: "invalid_type",
            expected: "string",
            message: "La razón social es obligatoria para personas jurídicas",
            path: ["business_name"],
          });
        }
        if (!data.commercial_name || data.commercial_name.trim() === "") {
          ctx.addIssue({
            code: "invalid_type",
            expected: "string",
            message:
              "El nombre comercial es obligatorio para personas jurídicas",
            path: ["commercial_name"],
          });
        }
      }
      if (data.type_person === "NATURAL") {
        if (!data.names || data.names.trim() === "") {
          ctx.addIssue({
            code: "invalid_type",
            expected: "string",
            message: "El nombre es obligatorio para personas naturales",
            path: ["names"],
          });
        }

        // Validar que solo contenga letras y espacios para personas naturales
        if (data.names && !/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(data.names)) {
          ctx.addIssue({
            code: "custom",
            message: "El nombre solo puede contener letras y espacios",
            path: ["names"],
          });
        }

        if (!data.father_surname || data.father_surname.trim() === "") {
          ctx.addIssue({
            code: "invalid_type",
            expected: "string",
            message:
              "El apellido paterno es obligatorio para personas naturales",
            path: ["father_surname"],
          });
        }
        if (!data.mother_surname || data.mother_surname.trim() === "") {
          ctx.addIssue({
            code: "invalid_type",
            expected: "string",
            message:
              "El apellido materno es obligatorio para personas naturales",
            path: ["mother_surname"],
          });
        }

        if (!data.gender) {
          ctx.addIssue({
            code: "invalid_type",
            expected: "string",
            message: "El género es obligatorio para personas naturales",
            path: ["gender"],
          });
        }

        if (!data.birth_date || data.birth_date.trim() === "") {
          ctx.addIssue({
            code: "invalid_type",
            expected: "string",
            message:
              "La fecha de nacimiento es obligatoria para personas naturales",
            path: ["birth_date"],
          });
        }

        // if (!data.ocupation || data.ocupation.trim() === "") {
        //   ctx.addIssue({
        //      code: "invalid_type",
        //      expected: "string",
        //      message: "La ocupación es obligatoria para personas naturales",
        //      path: ["ocupation"],
        //   });
        // }
      }

      // Validaciones específicas por tipo de documento
      // Solo validar si number_document está presente (no vacío)
      if (data.number_document && data.number_document.trim() !== "") {
        if (data.type_document === "DNI" && data.number_document.length !== 8) {
          ctx.addIssue({
            code: "invalid_type",
            expected: "string",
            message: "El DNI debe tener exactamente 8 dígitos",
            path: ["number_document"],
          });
        }

        // Si es cliente y el tipo de documento es RUC, no validar la longitud del RUC
        if (!(isClient && data.type_document === "RUC")) {
          if (
            data.type_document === "RUC" &&
            data.number_document.length !== 11
          ) {
            ctx.addIssue({
              code: "invalid_type",
              expected: "string",
              message: "El RUC debe tener exactamente 11 dígitos",
              path: ["number_document"],
            });
          }
        }

        if (
          data.type_document === "CE" &&
          (data.number_document.length < 8 || data.number_document.length > 9)
        ) {
          ctx.addIssue({
            code: "invalid_type",
            expected: "string",
            message: "El Carnet de Extranjería debe tener entre 8 y 9 dígitos",
            path: ["number_document"],
          });
        }

        if (
          data.type_document === "PASAPORTE" &&
          (data.number_document.length < 8 || data.number_document.length > 11)
        ) {
          ctx.addIssue({
            code: "invalid_type",
            expected: "string",
            message: "El Pasaporte debe tener entre 8 y 11 caracteres",
            path: ["number_document"],
          });
        }
      }
    });
};

// Default schema (for Worker, Supplier) - number_document is required
export const personCreateSchema = createPersonSchema(false);

// Schema for Client - number_document is optional
export const personCreateSchemaClient = createPersonSchema(true);

export const personCreateSchemaWorker = createPersonSchema(false, true);

export const personUpdateSchema = personCreateSchema.partial().extend({
  business_name: personCreateSchema.shape.business_name
    .optional()
    .or(z.literal("")),
});

export const personUpdateSchemaClient = personCreateSchemaClient
  .partial()
  .extend({
    business_name: personCreateSchemaClient.shape.business_name
      .optional()
      .or(z.literal("")),
  });

export type PersonSchema = z.infer<typeof personCreateSchema>;
export type PersonSchemaClient = z.infer<typeof personCreateSchemaClient>;
