import { FileText } from "lucide-react";

// Interfaces para Cuentas por Pagar (Purchase Installments)
export interface PurchaseInstallmentResource {
  id: number;
  purchase_id: number;
  purchase_correlativo: string;
  correlativo: string;
  installment_number: number;
  amount: string;
  paid_amount: string;
  pending_amount: string;
  due_date: string;
  status: "PENDIENTE" | "PAGADO" | "VENCIDO" | "PARCIAL";
  currency?: string;
  supplier_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PurchasePaymentResource {
  id: number;
  installment_id: number;
  amount: string;
  payment_date: string;
  payment_method: string;
  reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePurchasePaymentRequest {
  amount: number;
  payment_date: string;
  payment_method: string;
  reference?: string;
  notes?: string;
}

export const ACCOUNTS_PAYABLE = {
  ICON_REACT: FileText,
  ROUTE: "/cuentas-por-pagar",
  MODEL: {
    name: "Cuentas por Pagar",
    singular: "Cuenta por Pagar",
    plural: "Cuentas por Pagar",
  },
};

export const ACCOUNTS_PAYABLE_ENDPOINT = "/purchaseinstallment";
export const ACCOUNTS_PAYABLE_QUERY_KEY = "accounts-payable";

// Resumen de cuentas por pagar
export interface AccountsPayableSummary {
  total_pending: number;
  total_overdue: number;
  total_to_expire_soon: number;
  total_installments: number;
}
