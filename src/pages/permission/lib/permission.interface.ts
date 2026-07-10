import type { ModelComplete } from "@/lib/core.interface";
import { KeyRound } from "lucide-react";
import type { PermissionSchema } from "./permission.schema";

const ROUTE = "/permisos";
const NAME = "Permiso";

export const PERMISSION: ModelComplete<PermissionSchema> = {
  MODEL: {
    name: NAME,
    description:
      "Gestión de los permisos del sistema y su asociación a los grupos de menú.",
    plural: "Permisos",
    gender: false,
  },
  ICON: "KeyRound",
  ICON_REACT: KeyRound,
  ENDPOINT: "/permission",
  QUERY_KEY: "permissions",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  TITLES: {
    create: {
      title: `Crear ${NAME}`,
      subtitle: `Complete los campos para crear un nuevo ${NAME.toLowerCase()}`,
    },
    update: {
      title: `Actualizar ${NAME}`,
      subtitle: `Actualice los campos para modificar el ${NAME.toLowerCase()}`,
    },
    delete: {
      title: `Eliminar ${NAME}`,
      subtitle: `Confirme para eliminar el ${NAME.toLowerCase()}`,
    },
  },
  EMPTY: {
    name: "",
    route: "",
    group_menu_id: 0,
  },
};

export interface PermissionResource {
  id: number;
  name: string;
  action: string;
  route: string;
  type: string | null;
  status: string;
  group_menu_id: number;
  group_menu_name: string;
  created_at: string;
}

export interface PermissionMutationResponse {
  message: string;
  data: PermissionResource;
}

export interface getPermissionProps {
  params?: Record<string, any>;
}
