import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { IdCard } from "lucide-react";

const ROUTE = "/tipo-documento";
const NAME = "Tipo de Documento";

export const DOCUMENT_TYPE: ModelComplete<DocumentTypeResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de tipos de documento del sistema.",
    plural: "Tipos de Documento",
    gender: false,
  },
  ICON: "IdCard",
  ICON_REACT: IdCard,
  ENDPOINT: "/document-type",
  QUERY_KEY: "document-types",
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
    created_at: "",
  },
};

export interface DocumentTypeResponse {
  data: DocumentTypeResource[];
  links: Links;
  meta: Meta;
}

export interface DocumentTypeResource {
  id: number;
  name: string;
  created_at: string;
}

export interface DocumentTypeResourceById {
  data: DocumentTypeResource;
}

export interface getDocumentTypeProps {
  params?: Record<string, any>;
}

