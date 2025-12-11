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
    warehouse_origin_id: "",
    document_type: "",
    motive: "",
    warehouse_dest_id: "",
    responsible_origin_id: "",
    responsible_dest_id: "",
    movement_date: "",
    purchase_id: "",
    observations: "",
    details: [],
  },
};

// Document Types
export type DocumentType = "INGRESO" | "SALIDA" | "TRASLADO" | "AJUSTE";
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
  | "TRASLADO_INTERNO"
  | "AJUSTE_STOCK"
  | "OTRO"
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
  unit_price: number;
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
  warehouse_destination?: Warehouse;
  responsible_origin: Company;
  responsible_destination?: Company;
  purchase: Purchase;
  status: DocumentStatus;
  observations: string;
  details: Detail[];
  user: User;
  created_at: string;
  updated_at: string;
}

interface Detail {
  id: number;
  product: Product;
  quantity: number;
  unit_price: number;
  subtotal: number;
  tax: number;
  total: number;
}

interface Product {
  id: number;
  name: string;
  codigo: string;
}

interface Purchase {
  id: number;
  document_number: string;
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
  warehouse_origin_id: number;
  document_type: DocumentType;
  motive: DocumentMotive;
  warehouse_dest_id?: number; // Opcional, requerido solo para TRASLADO
  responsible_origin_id: number;
  responsible_dest_id?: number; // Opcional, requerido solo para TRASLADO
  movement_date: string;
  purchase_id?: number; // Opcional
  observations?: string;
  details: {
    product_id: number;
    quantity: number;
    unit_price: number;
    observations?: string;
  }[];
}

export interface UpdateWarehouseDocumentRequest {
  warehouse_origin_id?: number;
  document_type?: DocumentType;
  motive?: DocumentMotive;
  warehouse_dest_id?: number;
  responsible_origin_id?: number;
  responsible_dest_id?: number;
  movement_date?: string;
  purchase_id?: number;
  observations?: string;
  details?: {
    id?: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    observations?: string;
  }[];
}

export interface GetWarehouseDocumentsProps {
  params?: Record<string, unknown>;
}
