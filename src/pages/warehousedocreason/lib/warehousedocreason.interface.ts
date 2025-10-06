import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { FileText } from "lucide-react";

const ROUTE = "/motivo-documento-almacen";
const NAME = "Motivo Documento Almacén";

export const WAREHOUSEDOCREASON: ModelComplete<WarehouseDocReasonResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de motivos de documentos de almacén.",
    plural: "Motivos de Documentos de Almacén",
    gender: false,
  },
  ICON: "FileText",
  ICON_REACT: FileText,
  ENDPOINT: "/warehousedocreason",
  QUERY_KEY: "warehousedocreasons",
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
    type: "",
    created_at: "",
  },
};

export interface WarehouseDocReasonResponse {
  data: WarehouseDocReasonResource[];
  links: Links;
  meta: Meta;
}

export interface WarehouseDocReasonResource {
  id: number;
  name: string;
  type: string;
  created_at: string;
}

export interface WarehouseDocReasonResourceById {
  data: WarehouseDocReasonResource;
}

export interface getWarehouseDocReasonProps {
  params?: Record<string, any>;
}
