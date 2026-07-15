import { z } from "zod";

export const menuGroupSchemaCreate = z.object({
  name: z
    .string()
    .max(150, { message: "El nombre no puede tener más de 150 caracteres" })
    .min(1, { message: "El nombre es requerido" }),
  icon: z
    .string()
    .max(100, { message: "El ícono no puede tener más de 100 caracteres" })
    .min(1, { message: "El ícono es requerido" }),
  group_menu_id: z.number().nullable().optional(),
});

export const menuGroupSchemaUpdate = menuGroupSchemaCreate.partial();

export type MenuGroupSchema = z.infer<typeof menuGroupSchemaCreate>;
