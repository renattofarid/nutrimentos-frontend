import { create } from "zustand";
import { getCustomerAccountStatement } from "./reports.actions";
import type {
  CustomerAccountStatementResponse,
  CustomerAccountStatementParams,
} from "./reports.interface";

interface ReportsStore {
  customerAccountStatement: CustomerAccountStatementResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchCustomerAccountStatement: (
    params: CustomerAccountStatementParams
  ) => Promise<void>;
}

export const useReportsStore = create<ReportsStore>((set) => ({
  customerAccountStatement: null,
  isLoading: false,
  error: null,

  fetchCustomerAccountStatement: async (
    params: CustomerAccountStatementParams
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getCustomerAccountStatement(params);
      set({
        customerAccountStatement: response,
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
