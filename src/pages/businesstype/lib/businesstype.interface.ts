import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Briefcase } from "lucide-react";

const ROUTE = "/tipo-negocio";
const NAME = "Tipo de Negocio";

export const BUSINESSTYPE: ModelComplete<BusinessTypeResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de tipos de negocio.",
    plural: "Tipos de Negocio",
    gender: false,
  },
  ICON: "Briefcase",
  ICON_REACT: Briefcase,
  ENDPOINT: "/businesstype",
  QUERY_KEY: "businesstypes",
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
    id: 0,
    name: "",
    code: "",
    created_at: "",
  },
};

export interface BusinessTypeResponse {
  data: BusinessTypeResource[];
  links: Links;
  meta: Meta;
}

export interface BusinessTypeResource {
  id: number;
  name: string;
  code: string;
  created_at: string;
}

export interface BusinessTypeResourceById {
  data: BusinessTypeResource;
}

export interface getBusinessTypeProps {
  params?: Record<string, any>;
}
