import type { ModelComplete } from "@/lib/core.interface";
import type { Links, Meta } from "@/lib/pagination.interface";
import { FileText } from "lucide-react";

const ROUTE = "/reportes";
const NAME = "Reportes";

export const REPORTS: ModelComplete<any> = {
  MODEL: {
    name: NAME,
    description: "Gestión de reportes.",
    plural: "Reportes",
    gender: false,
  },
  ICON: "FileText",
  ICON_REACT: FileText,
  ENDPOINT: "/reports",
  QUERY_KEY: "reports",
  ROUTE,
  ROUTE_ADD: "",
  ROUTE_UPDATE: "",
  TITLES: {
    create: {
      title: "",
      subtitle: "",
    },
    update: {
      title: "",
      subtitle: "",
    },
    delete: {
      title: "",
      subtitle: "",
    },
  },
  EMPTY: {},
};

// Customer Account Statement Report
export const CUSTOMER_ACCOUNT_STATEMENT_ROUTE = `${ROUTE}/estado-cuenta-clientes`;

// Inventory Report
export const INVENTORY_REPORT_ROUTE = `${ROUTE}/inventario`;

// Kardex Report
export const KARDEX_REPORT_ROUTE = `${ROUTE}/kardex`;

// Sale By Seller Report
export const SALE_BY_SELLER_REPORT_ROUTE = `${ROUTE}/venta-por-vendedor`;

// Delivery Sheet Report
export const DELIVERY_SHEET_REPORT_ROUTE = `${ROUTE}/planilla-reparto`;

// Commissions Report
export const COMMISSIONS_REPORT_ROUTE = `${ROUTE}/comisiones`;

export interface CustomerAccountStatementParams {
  zone_id?: number | null;
  customer_id?: number | null;
  vendedor_id?: number | null;
  payment_type?: "CONTADO" | "CREDITO" | null;
  start_date?: string | null;
  end_date?: string | null;
  query_type?: "solo_deuda" | "todo" | null;
  show_old?: boolean | null;
  export?: "excel" | "pdf" | null;
}

// Estructura de venta individual
export interface Sale1 {
  id: number;
  date: string;
  document_number: string;
  document_type: string;
  payment_type: string;
  total_amount: number;
  paid_amount: number;
  debt_amount: number;
  days_overdue: number;
  reference: string;
}

// Estructura de cliente con sus ventas
export interface Customer {
  customer_id: number;
  customer_name: string;
  customer_zone: string;
  total_debt: number;
  sales: Sale1[];
}

// Estructura de vendedor con sus clientes
export interface Vendor {
  vendedor_id: number;
  vendedor_name: string;
  total_debt: number;
  customers: Customer[];
}

// Estructura de zona con sus vendedores
export interface Zone {
  zone_id: number;
  zone_name: string;
  total_debt: number;
  vendors: Vendor[];
}

// Respuesta completa del backend
export interface CustomerAccountStatementResponse {
  message: string;
  data: Zone[];
  filters: {
    zone_id: number | null;
    customer_id: number | null;
    vendedor_id: number | null;
    payment_type: string | null;
    start_date: string | null;
    end_date: string | null;
    query_type: string;
    show_old: boolean;
  };
}

// ─── Inventory Report ───────────────────────────────────────────────────────

export interface InventoryReportParams {
  product_id?: number | null;
  warehouse_id?: number | null;
  export?: "excel" | null;
}

export interface InventoryItem {
  id: number;
  warehouse_id: number;
  warehouse_name: string;
  product_id: number;
  product_name: string;
  stock: string;
  min_stock: string;
  max_stock: string;
  created_at: string;
}

export interface InventoryReportResponse {
  data: InventoryItem[];
  links: Links;
  meta: Meta;
}

// ─── Kardex Report ──────────────────────────────────────────────────────────
export interface KardexReportResponse {
  data: KardexItem[];
  links: Links;
  meta: Meta;
}

export interface KardexItem {
  id: number;
  movement_type: string;
  document_type: string;
  document_number: string;
  movement_date: string;
  movement_date_formatted: string;
  product_id: number;
  product: Product;
  warehouse_id: number;
  warehouse: Warehouse;
  quantity_in: number;
  unit_cost_in: number;
  total_cost_in: number;
  quantity_out: number;
  unit_cost_out: number;
  total_cost_out: number;
  balance_quantity: number;
  balance_unit_cost: number;
  balance_total_cost: number;
  warehouse_document_id: null | number;
  warehouse_document?: Warehousedocument;
  sale_id: null | number;
  user_id: number;
  user: User;
  observations: null | string;
  created_at: string;
  created_at_formatted: string;
  sale?: Sale;
}

interface Sale {
  id: number;
  serie: string;
  numero: string;
  document_type: string;
  total_amount: number;
}

interface User {
  id: number;
  name: string;
  email: null;
}

interface Warehousedocument {
  id: number;
  document_number: string;
  document_type: string;
  motive: string;
}

interface Warehouse {
  id: number;
  name: string;
  code: null;
}

interface Product {
  id: number;
  name: string;
  code: null;
  sku: null;
  unit: Unit;
}

interface Unit {
  id: number;
  name: string;
  code: string;
  created_at: string;
}

/**
 * --------- KARDEX REPORT PARAMETERS
 */
export interface KardexReportParams {
  product_id?: number | null;
  warehouse_id?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  export?: "excel" | null;
}

// Item plano para la tabla con información de jerarquía
export interface CustomerAccountStatementTableItem {
  id: string;
  type: "zone" | "vendor" | "customer" | "sale";
  level: number;
  zone_id?: number;
  zone_name?: string;
  vendedor_id?: number;
  vendedor_name?: string;
  customer_id?: number;
  customer_name?: string;
  customer_zone?: string;
  sale_id?: number;
  date?: string;
  document_number?: string;
  document_type?: string;
  payment_type?: string;
  total_amount?: number;
  paid_amount?: number;
  debt_amount?: number;
  days_overdue?: number;
  reference?: string;
  total_debt: number;
  parentId?: string;
  hasChildren: boolean;
}

/**
 * SALE BY WORKER REPORT
 */

export interface SaleBySellerReportParams {
  document_type?: string;
  start_date?: string | null;
  end_date?: string | null;
  format?: "excel" | "pdf" | null;
  status?: string | null;
  user_id?: number | null;
  warehouse_id?: number | null;
}

export interface SaleBySellerReportResponse {
  summary: Summary;
  by_seller: Byseller[];
  data: SaleWorkerReportResource[];
}

export interface SaleWorkerReportResource {
  sale_id: number;
  issue_date: string;
  document_type: string;
  document_number: string;
  seller: Seller;
  customer: Seller;
  warehouse: Seller;
  payment_type: string;
  products: Product[];
  subtotal: string;
  tax_amount: string;
  total_amount: string;
  cost_total: number;
  profit: number;
  margin: number;
  status: string;
}

interface Product {
  id: number;
  name: string;
  quantity: null;
  price: string;
  total: string;
}

interface Byseller {
  seller: Seller;
  total_sales: number;
  total_amount: number;
  total_cost: number;
  total_profit: number;
  avg_margin: number;
}

interface Seller {
  id: number;
  name: string;
}

interface Summary {
  total_sales: number;
  total_amount: number;
  total_cost: number;
  total_profit: number;
}

/**
 * DELIVERY SHEET REPORT
 */

export interface DeliverySheetReportParams {
  customer_id?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  format?: "excel" | "pdf" | null;
  modality?: "PUBLICO" | "PRIVADO" | null;
  status?:
    | "REGISTRADA"
    | "ENVIADA"
    | "ACEPTADA"
    | "RECHAZADA"
    | "EN_TRANSITO"
    | "ENTREGADA"
    | "ANULADA"
    | null;
  transfer_date?: string | null;
  vehicle_id?: number | null;
  warehouse_id?: number | null;
}

export interface DeliverySheetReportResponse {
  summary: DeliverySheetSummary;
  data: DeliverySheetDatum[];
}

export interface DeliverySheetSummary {
  total_guides: number;
  total_weight: number;
  total_packages: number;
  by_vehicle: DeliverySheetByVehicle[];
}

export interface DeliverySheetByVehicle {
  plate: string;
  total_guides: number;
  total_weight: number;
  total_packages: number;
}

export interface DeliverySheetDatum {
  guide_id: number;
  guide_number: string;
  issue_date: string;
  transfer_date: string;
  modality: string;
  motive: string;
  status: string;
  vehicle: DeliverySheetVehicle;
  driver: DeliverySheetDriver | null;
  carrier: DeliverySheetCarrier | null;
  origin: DeliverySheetOrigin;
  destination: DeliverySheetDestination;
  customer: DeliverySheetNamedEntity;
  sale_document_number: string;
  total_weight: string;
  total_packages: number;
  unit_measurement: string;
  registered_by: string;
  details: DeliverySheetDetail[];
}

export interface DeliverySheetDetail {
  product: DeliverySheetNamedEntity;
  quantity_sacks: string;
  quantity_kg: string;
  unit_code: string;
  description: string;
}

export interface DeliverySheetNamedEntity {
  id: number;
  name: string;
}

export interface DeliverySheetDestination {
  address: string;
  ubigeo: string;
}

export interface DeliverySheetOrigin {
  warehouse: string;
  address: string;
  ubigeo: string;
}

export interface DeliverySheetCarrier {
  name: string;
  document_number: string;
  mtc_number: string;
}

export interface DeliverySheetDriver {
  name: string;
  document_number: string;
  license: string;
}

export interface DeliverySheetVehicle {
  id: number | null;
  plate: string | null;
}

/**
 * COMMISSIONS REPORT
 */

export interface CommissionsReportParams {
  document_type?: "FACTURA" | "BOLETA" | "TICKET" | null;
  end_date?: string | null;
  format?: "excel" | "pdf" | null;
  payment_type?: "CONTADO" | "CREDITO" | null;
  start_date?: string | null;
  user_id?: number | null;
  warehouse_id?: number | null;
}

export interface CommissionsReportResponse {
  summary: CommissionSummary;
  by_seller: CommissionBySeller[];
  data: CommissionDatum[];
}

export interface CommissionSummary {
  total_sales: number;
  total_amount: number;
  total_cost: number;
  total_profit: number;
  total_commissions: number;
}

export interface CommissionBySeller {
  seller: CommissionSeller;
  total_sales: number;
  total_amount: number;
  total_profit: number;
  total_commissions: number;
}

export interface CommissionDatum {
  sale_id: number;
  issue_date: string;
  document_type: string;
  document_number: string;
  seller: CommissionSeller;
  customer: CommissionSeller;
  warehouse: CommissionSeller;
  payment_type: string;
  subtotal: string;
  tax_amount: string;
  total_amount: string;
  cost_total: number;
  gross_profit: number;
  commission_rate: string;
  commission: number;
  status: string;
}

export interface CommissionSeller {
  id: number;
  name: string;
}
