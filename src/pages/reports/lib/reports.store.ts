import { create } from "zustand";
import { getCustomerAccountStatement } from "./reports.actions";
import type {
  CustomerAccountStatementItem,
  CustomerAccountStatementParams,
} from "./reports.interface";

interface ReportsStore {
  customerAccountStatement: CustomerAccountStatementItem[] | null;
  isLoading: boolean;
  error: string | null;
  meta: {
    total: number;
    total_debt: number;
    total_pending: number;
    total_paid: number;
  } | null;
  fetchCustomerAccountStatement: (
    params: CustomerAccountStatementParams
  ) => Promise<void>;
}

export const useReportsStore = create<ReportsStore>((set) => ({
  customerAccountStatement: null,
  isLoading: false,
  error: null,
  meta: null,

  fetchCustomerAccountStatement: async (
    params: CustomerAccountStatementParams
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getCustomerAccountStatement(params);
      set({
        customerAccountStatement: response.data,
        meta: response.meta || null,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: "Error al cargar el reporte de estado de cuenta",
        isLoading: false,
      });
    }
  },
}));
