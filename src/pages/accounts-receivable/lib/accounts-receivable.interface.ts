import { DollarSign } from "lucide-react";

// Reutilizamos las interfaces de sale para installments y payments
export type {
  SaleInstallmentResource,
  SalePaymentResource,
} from "@/pages/sale/lib/sale.interface";

export const ACCOUNTS_RECEIVABLE_ENDPOINT = "/installments";
export const ACCOUNTS_RECEIVABLE_QUERY_KEY = "accounts-receivable";

export const AccountsReceivableRoute = "/cuentas-por-cobrar";

export const ACCOUNTS_RECEIVABLE = {
  ICON_REACT: DollarSign,
  ROUTE: "/cuentas-por-cobrar",
  MODEL: {
    name: "Cuentas por Cobrar",
    singular: "Cuenta por Cobrar",
    plural: "Cuentas por Cobrar",
  },
};

// Resumen de cuentas por cobrar
export interface AccountsReceivableSummary {
  total_pending: number;
  total_overdue: number;
  total_to_expire_soon: number;
  total_installments: number;
}
