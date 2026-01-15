// ============================================
// DELIVERY SHEET - Interfaces, Types & Routes
// ============================================

import type { ModelComplete } from "@/lib/core.interface";
import type { DeliverySheetSchema } from "./deliverysheet.schema";
import { FileText } from "lucide-react";

// ===== API RESOURCES =====

export interface Zone {
  id: number;
  code: string;
  name: string;
}

export interface Driver {
  id: number;
  full_name: string;
  document_number: string | null;
}

export interface Customer {
  id: number;
  full_name: string;
  document_number: string | null;
}

export interface User {
  id: number;
  name: string;
}

export interface SaleCustomer {
  id: number;
  full_name: string;
  document_number: string | null;
}

export interface DeliverySheetSale {
  id: number;
  document_type: string;
  full_document_number: string;
  issue_date: string;
  total_amount: string;
  customer: SaleCustomer;
  original_amount: string;
  current_amount: string;
  collected_amount: string;
  delivery_status: "PENDIENTE" | "ENTREGADO" | "NO_ENTREGADO" | "DEVUELTO";
  delivery_notes: string | null;
}

export interface DeliverySheetPayment {
  id: number;
  payment_date: string;
  amount_cash: string;
  amount_card: string;
  amount_yape: string;
  amount_plin: string;
  amount_deposit: string;
  amount_transfer: string;
  amount_other: string;
  total_amount: string;
  observations: string | null;
  user: User;
  created_at: string;
}

export interface SheetSaleDetail {
  id: number;
  delivery_sheet_id: number;
  sale_id: number;
  original_amount: string;
  current_amount: string;
  collected_amount: string;
  delivery_status: "PENDIENTE" | "ENTREGADO" | "NO_ENTREGADO" | "DEVUELTO";
  delivery_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SheetSale {
  id: number;
  sale_id: number;
  original_amount: string;
  original_amount_raw: string;
  current_amount: string;
  current_amount_raw: string;
  collected_amount: string;
  collected_amount_raw: string;
  delivery_status: "PENDIENTE" | "ENTREGADO" | "NO_ENTREGADO" | "DEVUELTO";
  delivery_notes: string | null;
  sale: SheetSaleDetail;
}

export interface DeliverySheetResource {
  id: number;
  sheet_number: string;
  type: "CONTADO" | "CREDITO";
  status: "PENDIENTE" | "EN_REPARTO" | "COMPLETADO" | "CANCELADO";
  issue_date: string;
  delivery_date: string;
  total_amount: string;
  total_amount_raw: string;
  collected_amount: string;
  collected_amount_raw: string;
  pending_amount: string;
  pending_amount_raw: string;
  zone?: Zone;
  driver?: Driver;
  customer: Customer;
  user: User;
  sales: DeliverySheetSale[];
  sheet_sales?: SheetSale[];
  payments: DeliverySheetPayment[];
  total_paid: string;
  sales_count: number;
  observations: string | null;
  created_at: string;
  updated_at: string;
}



// ===== API RESPONSES =====

export interface Meta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface Link {
  url: string | null;
  label: string;
  active: boolean;
}

export interface DeliverySheetResponse {
  data: DeliverySheetResource[];
  meta: Meta;
  links: Link[];
}

export interface DeliverySheetResourceById {
  data: DeliverySheetResource;
}

// ===== CREATE/UPDATE REQUESTS =====

export interface CreateDeliverySheetRequest {
  branch_id: number;
  zone_id?: number;
  customer_id?: number;
  type: "CONTADO" | "CREDITO";
  issue_date: string;
  delivery_date: string;
  sale_ids: number[];
  observations?: string;
}

export interface UpdateDeliverySheetRequest {
  zone_id?: number;
  customer_id?: number;
  type?: "CONTADO" | "CREDITO";
  issue_date?: string;
  delivery_date?: string;
  sale_ids?: number[];
  observations?: string;
}

// ===== AVAILABLE SALES =====

export interface AvailableSaleProduct {
  id: number;
  company_id: number;
  codigo: string;
  name: string;
  category_id: number;
  product_type_id: number;
  brand_id: number;
  unit_id: number;
  is_taxed: number;
  is_kg: number;
  price_per_kg: string | null;
  weight: string | null;
  supplier_id: number;
  comment: string | null;
  nationality_id: number;
  created_at: string;
}

export interface AvailableSaleDetail {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: string;
  unit_price: string;
  purchase_price: string;
  discount: string;
  discount_percentage: string;
  subtotal: string;
  tax: string;
  total: string;
  created_at: string;
  product: AvailableSaleProduct;
}

export interface AvailableSaleZone {
  id: number;
  name: string;
  code: string;
  created_at: string;
}

export interface AvailableSaleCustomer {
  id: number;
  number_document: string;
  type_person: string;
  names: string;
  father_surname: string;
  mother_surname: string;
  gender: string;
  birth_date: string;
  phone: string;
  email: string;
  address: string;
  business_name: string | null;
  commercial_name: string | null;
  occupation: string | null;
  job_position_id: number | null;
  business_type_id: number;
  zone_id: number;
  created_at: string;
  document_type_id: number;
  zone: AvailableSaleZone;
}

export interface AvailableSale {
  id: number;
  company_id: number;
  branch_id: number;
  warehouse_id: number;
  customer_id: number;
  vendedor_id: number | null;
  user_id: number;
  document_type: string;
  serie: string;
  numero: string;
  issue_date: string;
  payment_type: string;
  subtotal: string;
  discount_global: string;
  tax_amount: string;
  total_amount: string;
  total_weight: string;
  current_amount: string;
  amount_cash: string;
  amount_card: string;
  amount_yape: string;
  amount_plin: string;
  amount_deposit: string;
  amount_transfer: string;
  amount_other: string;
  currency: string;
  status: string;
  electronic_invoice_id: number | null;
  is_electronic: number;
  observations: string | null;
  created_at: string;
  customer: AvailableSaleCustomer;
  details: AvailableSaleDetail[];
}

export interface AvailableSalesResponse {
  message: string;
  data: AvailableSale[];
}

// ===== STATUS UPDATE =====

export interface UpdateDeliverySheetStatusRequest {
  status: "EN_REPARTO" | "PENDIENTE";
  delivery_date?: string;
  observations?: string;
}

// ===== SETTLEMENT =====

export interface SettlementSaleRequest {
  sale_id: number;
  delivery_status: "ENTREGADO" | "NO_ENTREGADO" | "DEVUELTO";
  delivery_notes?: string;
}

export interface CreateSettlementRequest {
  sales: SettlementSaleRequest[];
}

// ===== PAYMENT =====

export interface CreateDeliverySheetPaymentRequest {
  payment_date: string;
  amount_cash: number;
  amount_card: number;
  amount_yape: number;
  amount_plin: number;
  amount_deposit: number;
  amount_transfer: number;
  amount_other: number;
  observations?: string;
}

// ===== CONSTANTS =====

export const DELIVERY_SHEET_ENDPOINT = "/delivery-sheet";
export const DELIVERY_SHEET_QUERY_KEY = "delivery-sheets";

// ===== ROUTES =====

export const DeliverySheetRoute = "/planillas";
export const DeliverySheetAddRoute = "/planillas/agregar";
export const DeliverySheetEditRoute = "/planillas/actualizar/:id";

// ===== STATUS & TYPE OPTIONS =====

export const DELIVERY_SHEET_TYPES = [
  { value: "CONTADO", label: "Contado" },
  { value: "CREDITO", label: "Crédito" },
] as const;

export const DELIVERY_SHEET_STATUSES = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_REPARTO", label: "En Reparto" },
  { value: "COMPLETADO", label: "Completado" },
  { value: "CANCELADO", label: "Cancelado" },
] as const;

export const DELIVERY_STATUSES = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "ENTREGADO", label: "Entregado" },
  { value: "NO_ENTREGADO", label: "No Entregado" },
  { value: "DEVUELTO", label: "Devuelto" },
] as const;

// ===== MODEL COMPLETE =====

const NAME = "Planilla de Reparto";

export const DELIVERY_SHEET: ModelComplete<DeliverySheetSchema> = {
  MODEL: {
    name: NAME,
    description: "Gestión de planillas de reparto del sistema.",
    plural: "Planillas de Reparto",
    gender: false,
  },
  ICON: "FileText",
  ICON_REACT: FileText,
  ENDPOINT: DELIVERY_SHEET_ENDPOINT,
  QUERY_KEY: DELIVERY_SHEET_QUERY_KEY,
  ROUTE: DeliverySheetRoute,
  ROUTE_ADD: DeliverySheetAddRoute,
  ROUTE_UPDATE: DeliverySheetEditRoute,
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
