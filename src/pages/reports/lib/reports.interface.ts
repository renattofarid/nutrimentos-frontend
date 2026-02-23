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
 * ---------
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
