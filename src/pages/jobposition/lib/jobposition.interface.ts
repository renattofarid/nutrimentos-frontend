import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { Briefcase } from "lucide-react";

const ROUTE = "/cargo-trabajador";
const NAME = "Cargo Trabajador";

export const JOBPOSITION: ModelComplete<JobPositionResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de cargos de trabajadores.",
    plural: "Cargos de Trabajadores",
    gender: false,
  },
  ICON: "Briefcase",
  ICON_REACT: Briefcase,
  ENDPOINT: "/jobposition",
  QUERY_KEY: "jobpositions",
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

export interface JobPositionResponse {
  data: JobPositionResource[];
  links: Links;
  meta: Meta;
}

export interface JobPositionResource {
  id: number;
  name: string;
  code: string;
  created_at: string;
}

export interface JobPositionResourceById {
  data: JobPositionResource;
}

export interface getJobPositionProps {
  params?: Record<string, any>;
}
