import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { ShoppingCart } from "lucide-react";

const ROUTE = "/compra";
const NAME = "Compra";

export const PURCHASE: ModelComplete<PurchaseResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de compras a proveedores.",
    plural: "Compras",
    gender: false,
  },
  ICON: "ShoppingCart",
  ICON_REACT: ShoppingCart,
  ENDPOINT: "/purchase",
  QUERY_KEY: "purchases",
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
    correlativo: "",
    supplier_id: 0,
    supplier_fullname: "",
    warehouse_id: 0,
    warehouse_name: "",
    user_id: 0,
    user_name: "",
    purchase_order_id: null,
    document_type: "BOLETA",
    document_number: "",
    issue_date: "",
    payment_type: "CONTADO",
    total_amount: "0.00",
    current_amount: "0.00",
    currency: "PEN",
    status: "PENDIENTE",
    observations: null,
    details: [],
    installments: [],
    created_at: "",
  },
};

export interface PurchaseResponse {
  data: PurchaseResource[];
  links: Links;
  meta: Meta;
}

export interface PurchaseResource {
  id: number;
  correlativo: string;
  supplier_id: number;
  supplier_fullname: string;
  warehouse_id: number;
  warehouse_name: string;
  user_id: number;
  user_name: string;
  purchase_order_id: number | null;
  document_type: string;
  document_number: string;
  issue_date: string;
  payment_type: string;
  total_amount: string;
  current_amount: string;
  currency: string;
  status: string;
  observations: string | null;
  details: PurchaseDetail[];
  installments: PurchaseInstallment[];
  created_at: string;
}

export interface PurchaseDetail {
  id: number;
  product: {
    id: number;
    name: string;
    codigo: string;
  };
  quantity: number;
  unit_price: number;
  subtotal: number;
  tax: number;
  total: number;
}

export interface PurchaseInstallment {
  id: number;
  correlativo: string;
  purchase_id: number;
  purchase_correlativo: string;
  installment_number: number;
  due_days: number;
  due_date: string;
  amount: string;
  pending_amount: string;
  status: string;
  created_at: string;
}

export interface PurchaseResourceById {
  data: PurchaseResource;
}

export interface getPurchaseProps {
  params?: Record<string, any>;
}

export interface CreatePurchaseRequest {
  company_id: number;
  warehouse_id: number;
  supplier_id: number;
  issue_date: string;
  reception_date: string;
  due_date: string;
  document_type: string;
  document_number: string;
  payment_type: string;
  include_igv: boolean;
  currency: string;
  details: {
    product_id: number;
    quantity: number;
    unit_price: number;
  }[];
  installments?: {
    due_days: number;
    amount: number;
  }[];
}

export interface CreatePurchaseResponse {
  message: string;
  data: PurchaseResource;
}

export type DocumentType = "BOLETA" | "FACTURA";
export type PaymentType = "CONTADO" | "CREDITO";
export type Currency = "PEN" | "USD";
export type PurchaseStatus = "PENDIENTE" | "APROBADA" | "RECHAZADA" | "CANCELADA";
