import { z } from "zod";

export const permissionSchemaCreate = z.object({
  name: z
    .string()
    .max(150, { message: "El nombre no puede tener más de 150 caracteres" })
    .min(1, { message: "El nombre es requerido" }),
  route: z
    .string()
    .max(150, { message: "La ruta no puede tener más de 150 caracteres" })
    .min(1, { message: "La ruta es requerida" }),
  group_menu_id: z
    .number({ message: "Seleccione un grupo de menú" })
    .min(1, { message: "Seleccione un grupo de menú" }),
});

export const permissionSchemaUpdate = permissionSchemaCreate.partial();

export type PermissionSchema = z.infer<typeof permissionSchemaCreate>;
