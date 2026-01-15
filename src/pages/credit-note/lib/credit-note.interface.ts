// ============================================
// CREDIT NOTE - Interfaces, Types & Routes
// ============================================

import type { Links, Meta } from "@/lib/pagination.interface";
import type { ModelComplete } from "@/lib/core.interface";
import { FileText } from "lucide-react";

// ===== API RESOURCES =====

export interface CreditNoteDetailResource {
  id: number;
  sale_detail_id: number;
  product_id: number;
  product_name: string;
  product_code: string;
  quantity: string;
  unit_price: string;
  subtotal: string;
  tax: string;
  total: string;
}

export interface CreditNoteMotiveResource {
  id: number;
  code: string;
  name: string;
  active: number;
}

export interface CreditNoteWarehouseResource {
  id: number;
  name: string;
  address: string;
}

export interface CreditNoteCustomerResource {
  id: number;
  full_name: string;
  business_name: string;
  document_number: string;
}

export interface CreditNoteUserResource {
  id: number;
  name: string;
  email: string;
}

export interface CreditNoteSaleResource {
  id: number;
  serie: string;
  numero: string;
  document_type: string;
  total_amount: string;
  issue_date: string;
  customer: CreditNoteCustomerResource;
}

export interface CreditNoteResource {
  id: number;
  document_series: string;
  document_number: string;
  full_document_number: string;
  issue_date: string;
  credit_note_type: string;
  reason: string;
  currency: string;
  subtotal: string;
  tax: string;
  total_amount: string;
  affects_stock: boolean;
  status: string;
  observations: string;
  sale: CreditNoteSaleResource;
  warehouse: CreditNoteWarehouseResource;
  customer: CreditNoteCustomerResource;
  user: CreditNoteUserResource;
  credit_note_motive_id: number;
  motive: CreditNoteMotiveResource;
  details: CreditNoteDetailResource[];
  created_at: string;
  updated_at: string;
}

export interface CreditNoteResourceById {
  data: CreditNoteResource;
}

// ===== API RESPONSES =====

export interface CreditNoteResponse {
  data: CreditNoteResource[];
  meta: Meta;
  links: Links;
}

// ===== CREATE/UPDATE REQUESTS =====

export interface CreateCreditNoteDetailRequest {
  sale_detail_id: number;
  product_id: number;
  quantity_sacks: number;
  quantity_kg: number;
  unit_price: number;
}

export interface CreateCreditNoteRequest {
  sale_id: number;
  issue_date: string;
  credit_note_motive_id: number;
  affects_stock: boolean;
  observations: string;
  details: CreateCreditNoteDetailRequest[];
}

export interface UpdateCreditNoteRequest {
  sale_id?: number;
  issue_date?: string;
  credit_note_motive_id?: number;
  affects_stock?: boolean;
  observations?: string;
  details?: CreateCreditNoteDetailRequest[];
}

// ===== QUERY PROPS =====

export interface getCreditNoteProps {
  params?: Record<string, any>;
}

// ===== CONSTANTS =====

export const CREDIT_NOTE_ENDPOINT = "/credit-notes";
export const CREDIT_NOTE_QUERY_KEY = "credit-notes";

// ===== ROUTES =====

const ROUTE = "/notas-credito";

export const CreditNoteRoute = ROUTE;
export const CreditNoteAddRoute = `${ROUTE}/agregar`;
export const CreditNoteEditRoute = `${ROUTE}/actualizar/:id`;

// ===== STATUS & TYPE OPTIONS =====

export const CREDIT_NOTE_STATUSES = [
  { value: "REGISTRADO", label: "Registrado" },
  { value: "ANULADO", label: "Anulado" },
] as const;

// ===== MODEL COMPLETE =====

const NAME = "Nota de Crédito";

export const CREDIT_NOTE: ModelComplete<CreditNoteResource> = {
  MODEL: {
    name: NAME,
    description: "Gestión de notas de crédito del sistema.",
    plural: "Notas de Crédito",
    gender: false,
  },
  ICON: "FileText",
  ICON_REACT: FileText,
  ENDPOINT: CREDIT_NOTE_ENDPOINT,
  QUERY_KEY: CREDIT_NOTE_QUERY_KEY,
  ROUTE: CreditNoteRoute,
  ROUTE_ADD: CreditNoteAddRoute,
  ROUTE_UPDATE: CreditNoteEditRoute,
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
