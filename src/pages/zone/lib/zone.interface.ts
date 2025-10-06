import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { MapPin } from "lucide-react";

const ROUTE = "/zona";
const NAME = "Zona";

export const ZONE: ModelComplete<ZoneResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de zonas.",
    plural: "Zonas",
    gender: false,
  },
  ICON: "MapPin",
  ICON_REACT: MapPin,
  ENDPOINT: "/zone",
  QUERY_KEY: "zones",
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
    id: 0,
    name: "",
    code: "",
    created_at: "",
  },
};

export interface ZoneResponse {
  data: ZoneResource[];
  links: Links;
  meta: Meta;
}

export interface ZoneResource {
  id: number;
  name: string;
  code: string;
  created_at: string;
}

export interface ZoneResourceById {
  data: ZoneResource;
}

export interface getZoneProps {
  params?: Record<string, any>;
}
