import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { FileText } from "lucide-react";
import type { WarehouseDocumentSchema } from "./warehouse-document.schema";

const ROUTE = "/documentos-almacen";
const NAME = "Documento de Almacén";

export const WAREHOUSE_DOCUMENT: ModelComplete<WarehouseDocumentSchema> = {
  MODEL: {
    name: NAME,
    description: "Gestión de documentos de entrada y salida de almacén.",
    plural: "Documentos de Almacén",
    gender: false,
  },
  ICON: "FileText",
  ICON_REACT: FileText,
  ENDPOINT: "/warehouse-document",
  QUERY_KEY: "warehouse-documents",
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
    warehouse_id: "",
    document_type: "",
    motive: "",
    document_number: "",
    person_id: "",
    movement_date: "",
    observations: "",
    details: [],
  },
};

// Document Types
export type DocumentType = "INGRESO" | "SALIDA";
// | "ENTRADA_DEVOLUCION"
// | "ENTRADA_AJUSTE"
// | "ENTRADA_TRANSFERENCIA"
// | "ENTRADA_DONACION"
// | "SALIDA_DEVOLUCION"
// | "SALIDA_AJUSTE"
// | "SALIDA_TRANSFERENCIA"
// | "SALIDA_MERMA"
// | "SALIDA_DONACION"
// | "SALIDA_USO_INTERNO";

export type DocumentMotive =
  | "COMPRA"
  | "VENTA"
  | "DEVOLUCION"
  | "AJUSTE"
  | "TRANSFERENCIA"
  | "MERMA"
  | "DONACION"
  | "USO_INTERNO";

export type DocumentStatus = "BORRADOR" | "CONFIRMADO" | "CANCELADO";

// Warehouse Document Detail
export interface WarehouseDocumentDetail {
  id: number;
  warehouse_document_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  observations: string;
}

// Warehouse Document Resource
export interface WarehouseDocumentResource {
  id: number;
  company: Company;
  document_type: DocumentType;
  motive: DocumentMotive;
  document_number: string;
  movement_date: string;
  warehouse_origin: Warehouse;
  warehouse_destination: null;
  responsible_origin: null;
  responsible_destination: null;
  purchase: null;
  status: DocumentStatus;
  observations: string;
  user: User;
  created_at: string;
  updated_at: string;
}

interface Company {
  id: number;
  name: string;
}

interface Warehouse {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
}

// API Responses
export interface WarehouseDocumentResponse {
  data: WarehouseDocumentResource[];
  links: Links;
  meta: Meta;
}

export interface WarehouseDocumentResourceById {
  data: WarehouseDocumentResource;
}

// Request Types
export interface CreateWarehouseDocumentRequest {
  warehouse_id: number;
  document_type: DocumentType;
  motive: DocumentMotive;
  document_number: string;
  person_id: number;
  movement_date: string;
  observations?: string;
  details: {
    product_id: number;
    quantity: number;
    unit_cost: number;
    observations?: string;
  }[];
}

export interface UpdateWarehouseDocumentRequest {
  warehouse_id?: number;
  document_type?: DocumentType;
  motive?: DocumentMotive;
  document_number?: string;
  person_id?: number;
  document_date?: string;
  observations?: string;
  details?: {
    id?: number;
    product_id: number;
    quantity: number;
    unit_cost: number;
    observations?: string;
  }[];
}

export interface GetWarehouseDocumentsProps {
  params?: Record<string, unknown>;
}
