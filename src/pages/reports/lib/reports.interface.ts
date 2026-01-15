import type { ModelComplete } from "@/lib/core.interface";
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
export interface Sale {
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
  sales: Sale[];
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
