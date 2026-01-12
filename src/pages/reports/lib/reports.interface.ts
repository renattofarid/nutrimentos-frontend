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

export interface CustomerAccountStatementItem {
  customer_id: number;
  customer_name: string;
  document_number: string;
  zone_name?: string;
  total_debt: number;
  pending_amount: number;
  paid_amount: number;
  last_payment_date?: string;
  oldest_debt_date?: string;
}

export interface CustomerAccountStatementResponse {
  data: CustomerAccountStatementItem[];
  meta?: {
    total: number;
    total_debt: number;
    total_pending: number;
    total_paid: number;
  };
}
