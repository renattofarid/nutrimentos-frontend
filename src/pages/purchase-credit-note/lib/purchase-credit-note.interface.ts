// ============================================
// PURCHASE CREDIT NOTE - Interfaces, Types & Routes
// ============================================

import type { Links, Meta } from "@/lib/pagination.interface";
import type { ModelComplete } from "@/lib/core.interface";
import { FileText } from "lucide-react";

// ===== API RESOURCES =====

export interface PurchaseCreditNoteDetailResource {
  id: number;
  purchase_credit_note_id: number;
  purchase_detail_id: number;
  product_id: number;
  product_name: string;
  product_code: string;
  quantity_sacks: number;
  quantity_kg: number;
  total_kg: string;
  unit_price: string;
  subtotal: string;
  tax: string;
  total: string;
  description: string;
  created_at: string;
}

export interface PurchaseCreditNoteTypeResource {
  id: number;
  code: string;
  name: string;
}

export interface PurchaseCreditNoteResource {
  id: number;
  company_id: number;
  company_name: string;
  warehouse_id: number;
  warehouse_name: string;
  purchase_id: number | null;
  purchase_document_number: string | null;
  supplier_id: number;
  supplier_fullname: string;
  user_id: number;
  user_name: string;
  document_type: string;
  document_number: string;
  full_document_number: string;
  issue_date: string;
  affected_document_type: string;
  affected_document_number: string;
  affected_issue_date: string;
  credit_note_type_id: number;
  credit_note_type_name: string;
  credit_note_type_code: string;
  credit_note_description: string;
  is_detailed: boolean;
  is_consolidated: boolean;
  affects_stock: boolean;
  affects_previous_month: boolean;
  subtotal: string;
  tax_amount: string;
  total_amount: string;
  currency: string;
  status: string;
  observations: string;
  details: PurchaseCreditNoteDetailResource[];
  created_at: string;
  updated_at: string;
}

export interface PurchaseCreditNoteResourceById {
  data: PurchaseCreditNoteResource;
}

// ===== API RESPONSES =====

export interface PurchaseCreditNoteResponse {
  data: PurchaseCreditNoteResource[];
  meta: Meta;
  links: Links;
}

// ===== CREATE/UPDATE REQUESTS =====

export interface CreatePurchaseCreditNoteDetailRequest {
  purchase_detail_id?: number | null;
  product_id: number;
  quantity_sacks: number;
  quantity_kg: number;
  unit_price: number;
  description?: string | null;
}

export interface CreatePurchaseCreditNoteRequest {
  purchase_id?: number | null;
  supplier_id: number;
  warehouse_id?: number | null;
  document_type: string;
  issue_date: string;
  affected_document_type: string;
  affected_document_number: string;
  affected_issue_date: string;
  credit_note_type_id: number;
  credit_note_description?: string | null;
  currency?: string | null;
  observations?: string | null;
  subtotal?: number | null;
  tax_amount?: number | null;
  total_amount?: number | null;
  details?: CreatePurchaseCreditNoteDetailRequest[] | null;
}

export interface UpdatePurchaseCreditNoteRequest {
  purchase_id?: number | null;
  supplier_id?: number;
  warehouse_id?: number | null;
  document_type?: string;
  issue_date?: string;
  affected_document_type?: string;
  affected_document_number?: string;
  affected_issue_date?: string;
  credit_note_type_id?: number;
  credit_note_description?: string | null;
  currency?: string;
  observations?: string | null;
  subtotal?: number;
  tax_amount?: number;
  total_amount?: number;
  details?: (CreatePurchaseCreditNoteDetailRequest & { id?: number | null })[];
}

// ===== QUERY PROPS =====

export interface getPurchaseCreditNoteProps {
  params?: Record<string, any>;
}

// ===== CONSTANTS =====

export const PURCHASE_CREDIT_NOTE_ENDPOINT = "/purchase-credit-note";
export const PURCHASE_CREDIT_NOTE_TYPES_ENDPOINT = "/purchase-credit-note-types";
export const PURCHASE_CREDIT_NOTE_QUERY_KEY = "purchase-credit-notes";

// ===== ROUTES =====

const ROUTE = "/notas-credito-compra";

export const PurchaseCreditNoteRoute = ROUTE;
export const PurchaseCreditNoteAddRoute = `${ROUTE}/agregar`;
export const PurchaseCreditNoteEditRoute = `${ROUTE}/actualizar/:id`;

// ===== STATUS & TYPE OPTIONS =====

export const PURCHASE_CREDIT_NOTE_STATUSES = [
  { value: "REGISTRADO", label: "Registrado" },
  { value: "ANULADO", label: "Anulado" },
] as const;

export const NC_DOCUMENT_TYPES = [
  { value: "FACTURA", label: "Factura" },
  { value: "BOLETA", label: "Boleta" },
  { value: "OTRO", label: "Otro" },
] as const;

export const NC_CURRENCIES = [
  { value: "PEN", label: "S/. Soles" },
  { value: "USD", label: "$ Dólares" },
  { value: "EUR", label: "€ Euros" },
] as const;

// ===== MODEL COMPLETE =====

const NAME = "Nota de Crédito de Compra";

export const PURCHASE_CREDIT_NOTE: ModelComplete<PurchaseCreditNoteResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de notas de crédito de compras.",
    plural: "Notas de Crédito de Compras",
    gender: false,
  },
  ICON: "FileText",
  ICON_REACT: FileText,
  ENDPOINT: PURCHASE_CREDIT_NOTE_ENDPOINT,
  QUERY_KEY: PURCHASE_CREDIT_NOTE_QUERY_KEY,
  ROUTE: PurchaseCreditNoteRoute,
  ROUTE_ADD: PurchaseCreditNoteAddRoute,
  ROUTE_UPDATE: PurchaseCreditNoteEditRoute,
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
  EMPTY: {} as any,
};
