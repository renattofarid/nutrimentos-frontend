import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Globe } from "lucide-react";
import type { NationalitySchema } from "./nationality.schema";

const ROUTE = "/nacionalidades";
const NAME = "Nacionalidad";

export const NATIONALITY: ModelComplete<NationalitySchema> = {
  MODEL: {
    name: NAME,
    description: "Gestión de nacionalidades del sistema.",
    plural: "Nacionalidades",
    gender: false,
  },
  ICON: "Globe",
  ICON_REACT: Globe,
  ENDPOINT: "/nationality",
  QUERY_KEY: "nationalities",
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
    name: "",
    code: "",
  },
};

export interface NationalityResponse {
  data: NationalityResource[];
  links: Links;
  meta: Meta;
}

export interface NationalityResource {
  id: number;
  name: string;
  code: string;
  created_at: string;
}

export interface NationalityResourceById {
  data: NationalityResource;
}

export interface getNationalityProps {
  params?: Record<string, unknown>;
}
