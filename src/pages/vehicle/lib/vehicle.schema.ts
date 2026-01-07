import { z } from "zod";
import { requiredNumberId } from "@/lib/core.schema";

export const vehicleSchemaCreate = z.object({
  plate: z
    .string()
    .min(1, {
      message: "La placa es requerida",
    })
    .max(20, {
      message: "La placa no puede tener más de 20 caracteres",
    }),
  brand: z
    .string()
    .min(1, {
      message: "La marca es requerida",
    })
    .max(100, {
      message: "La marca no puede tener más de 100 caracteres",
    }),
  model: z
    .string()
    .min(1, {
      message: "El modelo es requerido",
    })
    .max(100, {
      message: "El modelo no puede tener más de 100 caracteres",
    }),
  year: z.preprocess(
    (val) => {
      const parsed = Number(val);
      return isNaN(parsed) ? val : parsed;
    },
    z
      .number({
        required_error: "El año es requerido",
        invalid_type_error: "El año debe ser un número",
      })
      .min(1900, {
        message: "El año debe ser mayor a 1900",
      })
      .max(new Date().getFullYear() + 1, {
        message: `El año no puede ser mayor a ${new Date().getFullYear() + 1}`,
      })
  ),
  color: z
    .string()
    .min(1, {
      message: "El color es requerido",
    })
    .max(50, {
      message: "El color no puede tener más de 50 caracteres",
    }),
  vehicle_type: z
    .string()
    .min(1, {
      message: "El tipo de vehículo es requerido",
    })
    .max(50, {
      message: "El tipo de vehículo no puede tener más de 50 caracteres",
    }),
  max_weight: z.preprocess(
    (val) => {
      const parsed = Number(val);
      return isNaN(parsed) ? val : parsed;
    },
    z
      .number({
        required_error: "El peso máximo es requerido",
        invalid_type_error: "El peso máximo debe ser un número",
      })
      .min(0, {
        message: "El peso máximo debe ser mayor o igual a 0",
      })
  ),
  owner_id: requiredNumberId("El propietario es requerido"),
  observations: z
    .string()
    .max(500, {
      message: "Las observaciones no pueden tener más de 500 caracteres",
    })
    .optional()
    .or(z.literal("")),
});

export const vehicleSchemaUpdate = vehicleSchemaCreate.partial();

export type VehicleSchema = z.infer<typeof vehicleSchemaCreate>;
