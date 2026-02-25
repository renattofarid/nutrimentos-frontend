import { create } from "zustand";
import {
  getCommissionsReport,
  getCustomerAccountStatement,
  getDeliverySheetReport,
  getInventoryReport,
  getKardexReport,
  getSaleBySellerReport,
} from "./reports.actions";
import type {
  CommissionsReportParams,
  CommissionsReportResponse,
  CustomerAccountStatementResponse,
  CustomerAccountStatementParams,
  DeliverySheetReportParams,
  DeliverySheetReportResponse,
  InventoryReportResponse,
  InventoryReportParams,
  KardexReportResponse,
  KardexReportParams,
  SaleBySellerReportParams,
  SaleBySellerReportResponse,
} from "./reports.interface";

interface ReportsStore {
  // Customer Account Statement
  customerAccountStatement: CustomerAccountStatementResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchCustomerAccountStatement: (
    params: CustomerAccountStatementParams,
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

  // Sale By Seller
  saleBySellerReport: SaleBySellerReportResponse | null;
  saleBySellerLoading: boolean;
  saleBySellerError: string | null;
  fetchSaleBySellerReport: (params: SaleBySellerReportParams) => Promise<void>;

  // Delivery Sheet
  deliverySheetReport: DeliverySheetReportResponse | null;
  deliverySheetLoading: boolean;
  deliverySheetError: string | null;
  fetchDeliverySheetReport: (params: DeliverySheetReportParams) => Promise<void>;

  // Commissions
  commissionsReport: CommissionsReportResponse | null;
  commissionsLoading: boolean;
  commissionsError: string | null;
  fetchCommissionsReport: (params: CommissionsReportParams) => Promise<void>;
}

export const useReportsStore = create<ReportsStore>((set) => ({
  // ─── Customer Account Statement ──────────────────────────────────────────
  customerAccountStatement: null,
  isLoading: false,
  error: null,

  fetchCustomerAccountStatement: async (
    params: CustomerAccountStatementParams,
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

  // ─── Sale By Seller ─────────────────────────────────────────────────────
  saleBySellerReport: null,
  saleBySellerLoading: false,
  saleBySellerError: null,

  fetchSaleBySellerReport: async (params: SaleBySellerReportParams) => {
    set({ saleBySellerLoading: true, saleBySellerError: null });
    try {
      const response = await getSaleBySellerReport(params);
      set({ saleBySellerReport: response, saleBySellerLoading: false });
    } catch (error) {
      set({
        saleBySellerError: "Error al cargar el reporte de ventas por vendedor",
        saleBySellerLoading: false,
      });
    }
  },

  // ─── Delivery Sheet ──────────────────────────────────────────────────────
  deliverySheetReport: null,
  deliverySheetLoading: false,
  deliverySheetError: null,

  fetchDeliverySheetReport: async (params: DeliverySheetReportParams) => {
    set({ deliverySheetLoading: true, deliverySheetError: null });
    try {
      const response = await getDeliverySheetReport(params);
      set({ deliverySheetReport: response, deliverySheetLoading: false });
    } catch {
      set({
        deliverySheetError: "Error al cargar el reporte de planilla de reparto",
        deliverySheetLoading: false,
      });
    }
  },

  // ─── Commissions ─────────────────────────────────────────────────────────
  commissionsReport: null,
  commissionsLoading: false,
  commissionsError: null,

  fetchCommissionsReport: async (params: CommissionsReportParams) => {
    set({ commissionsLoading: true, commissionsError: null });
    try {
      const response = await getCommissionsReport(params);
      set({ commissionsReport: response, commissionsLoading: false });
    } catch {
      set({
        commissionsError: "Error al cargar el reporte de comisiones",
        commissionsLoading: false,
      });
    }
  },
}));
