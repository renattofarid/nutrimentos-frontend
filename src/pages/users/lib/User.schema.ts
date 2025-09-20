import { onlyLettersSchema, requiredStringId } from "@/lib/core.schema";
import { z } from "zod";

const typeDocumentSchema = z.enum(["DNI", "RUC", "CE", "PASAPORTE"], {
  message: "Debe seleccionar un tipo de documento válido",
});

const typePersonSchema = z.enum(["NATURAL", "JURIDICA"], {
  message: "Debe seleccionar un tipo de persona válido",
});

export type TypeDocument = z.infer<typeof typeDocumentSchema>;
export type TypePerson = z.infer<typeof typePersonSchema>;

// Función para validar número de documento según tipo
const validateDocumentNumber = (
  number_document: string,
  type_document: string
) => {
  if (!number_document || number_document.trim() === "") {
    return { isValid: false, message: "El número de documento es obligatorio" };
  }

  // Validar solo números para la mayoría de documentos
  if (type_document !== "PASAPORTE" && !/^\d+$/.test(number_document)) {
    return {
      isValid: false,
      message: "El número de documento solo debe contener números",
    };
  }

  // Validaciones específicas por tipo de documento
  switch (type_document) {
    case "DNI":
      if (number_document.length !== 8) {
        return {
          isValid: false,
          message: "El DNI debe tener exactamente 8 dígitos",
        };
      }
      break;
    case "RUC":
      if (number_document.length !== 11) {
        return {
          isValid: false,
          message: "El RUC debe tener exactamente 11 dígitos",
        };
      }
      // Validación adicional: RUC debe empezar con 10 o 20
      if (
        !number_document.startsWith("10") &&
        !number_document.startsWith("20")
      ) {
        return { isValid: false, message: "El RUC debe empezar con 10 o 20" };
      }
      break;
    case "CE":
      if (number_document.length < 8 || number_document.length > 12) {
        return {
          isValid: false,
          message: "El Carnet de Extranjería debe tener entre 8 y 12 dígitos",
        };
      }
      break;
    case "PASAPORTE":
      if (number_document.length < 6 || number_document.length > 9) {
        return {
          isValid: false,
          message: "El Pasaporte debe tener entre 6 y 9 caracteres",
        };
      }
      // Para pasaporte, permitir letras y números
      if (!/^[A-Za-z0-9]+$/.test(number_document)) {
        return {
          isValid: false,
          message: "El Pasaporte solo puede contener letras y números",
        };
      }
      break;
    default:
      return { isValid: false, message: "Tipo de documento no válido" };
  }

  return { isValid: true, message: "" };
};

export const userCreateSchema = z
  .object({
    username: z
      .string({ error: "El usuario es obligatorio" })
      .min(4, "El usuario debe tener al menos 4 caracteres")
      .max(20, "El usuario no puede tener más de 20 caracteres")
      .regex(
        /^[a-zA-Z0-9_.-]+$/,
        "El usuario solo puede contener letras, números, guiones y puntos"
      ),

    password: z
      .string({ error: "La contraseña es obligatoria" })
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),

    type_document: typeDocumentSchema,
    type_person: typePersonSchema,

    names: onlyLettersSchema("nombres").optional().or(z.literal("")),
    father_surname: onlyLettersSchema("apellido paterno")
      .optional()
      .or(z.literal("")),
    mother_surname: onlyLettersSchema("apellido materno")
      .optional()
      .or(z.literal("")),

    business_name: z
      .string()
      .max(255, "La razón social no puede exceder 255 caracteres")
      .optional()
      .or(z.literal("")),

    address: z
      .string({ error: "La dirección es obligatoria" })
      .min(5, "Debe ingresar una dirección válida (mínimo 5 caracteres)")
      .max(200, "La dirección no puede exceder 200 caracteres"),

    phone: z
      .string({ error: "El teléfono es obligatorio" })
      .regex(
        /^9\d{8}$/,
        "El teléfono debe empezar con 9 y tener exactamente 9 dígitos"
      ),

    email: z
      .string({ error: "El correo es obligatorio" })
      .email("Debe ingresar un correo válido")
      .max(100, "El correo no puede exceder 100 caracteres"),

    rol_id: requiredStringId("Debe seleccionar un rol válido"),

    number_document: z
      .string({ error: "El número de documento es obligatorio" })
      .min(1, "El número de documento es obligatorio"),
  })
  .superRefine((data, ctx) => {
    // Validación específica del número de documento
    const docValidation = validateDocumentNumber(
      data.number_document,
      data.type_document
    );
    if (!docValidation.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: docValidation.message,
        path: ["number_document"],
      });
    }

    // Validación condicional para campos según tipo de persona
    if (data.type_person === "JURIDICA") {
      if (!data.business_name || data.business_name.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La razón social es obligatoria para personas jurídicas",
          path: ["business_name"],
        });
      }
    }

    if (data.type_person === "NATURAL") {
      if (!data.names || data.names.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Los nombres son obligatorios para personas naturales",
          path: ["names"],
        });
      }

      if (!data.father_surname || data.father_surname.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El apellido paterno es obligatorio para personas naturales",
          path: ["father_surname"],
        });
      }

      if (!data.mother_surname || data.mother_surname.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El apellido materno es obligatorio para personas naturales",
          path: ["mother_surname"],
        });
      }
    }

    // Validación cruzada: RUC solo para jurídicas, pero solo si ambos campos tienen valores
    if (data.type_document && data.type_person) {
      if (data.type_document === "RUC" && data.type_person === "NATURAL") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El RUC solo puede ser usado por personas jurídicas",
          path: ["type_document"],
        });
      }

      if (data.type_person === "JURIDICA" && data.type_document !== "RUC") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Las personas jurídicas deben usar RUC como tipo de documento",
          path: ["type_document"],
        });
      }
    }
  });

export const userUpdateSchema = userCreateSchema
  .partial()
  .extend({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número")
      .optional()
      .or(z.literal("")),

    business_name: z
      .string()
      .max(255, "La razón social no puede exceder 255 caracteres")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    // Aplicar las mismas validaciones del schema de creación si los campos están presentes
    if (data.type_person && data.type_document) {
      // Validación específica del número de documento si está presente
      if (data.number_document) {
        const docValidation = validateDocumentNumber(
          data.number_document,
          data.type_document
        );
        if (!docValidation.isValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: docValidation.message,
            path: ["number_document"],
          });
        }
      }

      // Validaciones condicionales según tipo de persona
      if (data.type_person === "JURIDICA") {
        if (
          data.business_name !== undefined &&
          (!data.business_name || data.business_name.trim() === "")
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La razón social es obligatoria para personas jurídicas",
            path: ["business_name"],
          });
        }
      }

      if (data.type_person === "NATURAL") {
        if (
          data.names !== undefined &&
          (!data.names || data.names.trim() === "")
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Los nombres son obligatorios para personas naturales",
            path: ["names"],
          });
        }

        if (
          data.father_surname !== undefined &&
          (!data.father_surname || data.father_surname.trim() === "")
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "El apellido paterno es obligatorio para personas naturales",
            path: ["father_surname"],
          });
        }

        if (
          data.mother_surname !== undefined &&
          (!data.mother_surname || data.mother_surname.trim() === "")
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "El apellido materno es obligatorio para personas naturales",
            path: ["mother_surname"],
          });
        }
      }

      // Validación cruzada: RUC solo para jurídicas, pero solo si ambos campos tienen valores
      if (data.type_document && data.type_person) {
        if (data.type_document === "RUC" && data.type_person === "NATURAL") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "El RUC solo puede ser usado por personas jurídicas",
            path: ["type_document"],
          });
        }

        if (data.type_person === "JURIDICA" && data.type_document !== "RUC") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Las personas jurídicas deben usar RUC como tipo de documento",
            path: ["type_document"],
          });
        }
      }
    }
  });

export type UserSchema = z.infer<typeof userCreateSchema>;
