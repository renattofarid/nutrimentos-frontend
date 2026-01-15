import type { ModelComplete } from "@/lib/core.interface";
import { Truck } from "lucide-react";

const ROUTE = "/transportistas";
const NAME = "Transportista";

export const CARRIER: ModelComplete<any> = {
  MODEL: {
    name: NAME,
    description: "Gestión de transportistas del sistema.",
    plural: "Transportistas",
    gender: false,
  },
  ICON: "Truck",
  ICON_REACT: Truck,
  ENDPOINT: "/person",
  QUERY_KEY: "carriers",
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
  EMPTY: {},
};

export const CARRIER_ROLE_CODE = "CARRIER";
export const CARRIER_ROLE_ID = 5;
