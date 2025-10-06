import type { ModelComplete } from "@/lib/core.interface";
import { Settings } from "lucide-react";
import type { SettingSchemaCreate } from "./setting.schema";

const ROUTE = "/configuracion";
const NAME = "Configuración";

export const SETTING: ModelComplete<SettingSchemaCreate> = {
  MODEL: {
    name: NAME,
    description: "Gestión de configuraciones del sistema.",
    plural: "Configuraciones",
    gender: false,
  },
  ICON: "Settings",
  ICON_REACT: Settings,
  ENDPOINT: "/setting",
  QUERY_KEY: "settings",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  TITLES: {
    create: {
      title: `Crear ${NAME}`,
      subtitle: `Complete los campos para crear una nueva ${NAME.toLowerCase()}`,
    },
    update: {
      title: `Actualizar ${NAME}`,
      subtitle: `Actualice los campos para modificar la ${NAME.toLowerCase()}`,
    },
    delete: {
      title: `Eliminar ${NAME}`,
      subtitle: `Confirme para eliminar la ${NAME.toLowerCase()}`,
    },
  },
  EMPTY: {
    branch_id: "",
    allow_multiple_prices: false,
    allow_invoice: false,
    allow_negative_stock: false,
    default_currency: "",
    tax_percentage: "",
  },
};

export interface SettingResource {
  id: number;
  branch_id: number;
  branch_name: string;
  allow_multiple_prices: number;
  allow_invoice: number;
  allow_negative_stock: number;
  default_currency: string;
  tax_percentage: string;
  created_at: string;
}
