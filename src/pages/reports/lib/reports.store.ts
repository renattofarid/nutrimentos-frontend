import { create } from "zustand";
import {
  getCustomerAccountStatement,
  getInventoryReport,
  getKardexReport,
} from "./reports.actions";
import type {
  CustomerAccountStatementResponse,
  CustomerAccountStatementParams,
  InventoryReportResponse,
  InventoryReportParams,
  KardexReportResponse,
  KardexReportParams,
} from "./reports.interface";

interface ReportsStore {
  // Customer Account Statement
  customerAccountStatement: CustomerAccountStatementResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchCustomerAccountStatement: (
    params: CustomerAccountStatementParams
  ) => Promise<void>;

  // Inventory
  inventoryReport: InventoryReportResponse | null;
  inventoryLoading: boolean;
  inventoryError: string | null;
  fetchInventoryReport: (params: InventoryReportParams) => Promise<void>;

  // Kardex
  kardexReport: KardexReportResponse | null;
  kardexLoading: boolean;
  kardexError: string | null;
  fetchKardexReport: (params: KardexReportParams) => Promise<void>;
}

export const useReportsStore = create<ReportsStore>((set) => ({
  // ─── Customer Account Statement ──────────────────────────────────────────
  customerAccountStatement: null,
  isLoading: false,
  error: null,

  fetchCustomerAccountStatement: async (
    params: CustomerAccountStatementParams
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getCustomerAccountStatement(params);
      set({ customerAccountStatement: response, isLoading: false });
    } catch {
      set({
        error: "Error al cargar el reporte de estado de cuenta",
        isLoading: false,
      });
    }
  },

  // ─── Inventory ───────────────────────────────────────────────────────────
  inventoryReport: null,
  inventoryLoading: false,
  inventoryError: null,

  fetchInventoryReport: async (params: InventoryReportParams) => {
    set({ inventoryLoading: true, inventoryError: null });
    try {
      const response = await getInventoryReport(params);
      set({ inventoryReport: response, inventoryLoading: false });
    } catch {
      set({
        inventoryError: "Error al cargar el reporte de inventario",
        inventoryLoading: false,
      });
    }
  },

  // ─── Kardex ──────────────────────────────────────────────────────────────
  kardexReport: null,
  kardexLoading: false,
  kardexError: null,

  fetchKardexReport: async (params: KardexReportParams) => {
    set({ kardexLoading: true, kardexError: null });
    try {
      const response = await getKardexReport(params);
      set({ kardexReport: response, kardexLoading: false });
    } catch {
      set({
        kardexError: "Error al cargar el reporte de kardex",
        kardexLoading: false,
      });
    }
  },
}));
