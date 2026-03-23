import { create } from "zustand";
import {
  getAnnualSalesReport,
  getCarLoadReport,
  getCommissionsReport,
  getCustomerAccountStatement,
  getDeliverySheetReport,
  getDetailedSalesReport,
  getInventoryReport,
  getKardexReport,
  getSaleBySellerReport,
  getSalesByProductReport,
} from "./reports.actions";
import type {
  AnnualSalesReportParams,
  AnnualSalesReportResponse,
  CarLoadReportParams,
  CarLoadReportResponse,
  CommissionsReportParams,
  CommissionsReportResponse,
  CustomerAccountStatementResponse,
  CustomerAccountStatementParams,
  DeliverySheetReportParams,
  DeliverySheetReportResponse,
  DetailedSalesReportParams,
  DetailedSalesReportResponse,
  InventoryReportResponse,
  InventoryReportParams,
  KardexReportResponse,
  KardexReportParams,
  SaleBySellerReportParams,
  SaleBySellerReportResponse,
  SalesByProductReportParams,
  SalesByProductReportResponse,
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

  // Car Load
  carLoadReport: CarLoadReportResponse | null;
  carLoadLoading: boolean;
  carLoadError: string | null;
  fetchCarLoadReport: (params: CarLoadReportParams) => Promise<void>;

  // Detailed Sales
  detailedSalesReport: DetailedSalesReportResponse | null;
  detailedSalesLoading: boolean;
  detailedSalesError: string | null;
  fetchDetailedSalesReport: (params: DetailedSalesReportParams) => Promise<void>;

  // Sales By Product
  salesByProductReport: SalesByProductReportResponse | null;
  salesByProductLoading: boolean;
  salesByProductError: string | null;
  fetchSalesByProductReport: (params: SalesByProductReportParams) => Promise<void>;

  // Annual Sales
  annualSalesReport: AnnualSalesReportResponse | null;
  annualSalesLoading: boolean;
  annualSalesError: string | null;
  fetchAnnualSalesReport: (params: AnnualSalesReportParams) => Promise<void>;
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

  // ─── Car Load ────────────────────────────────────────────────────────────
  carLoadReport: null,
  carLoadLoading: false,
  carLoadError: null,

  fetchCarLoadReport: async (params: CarLoadReportParams) => {
    set({ carLoadLoading: true, carLoadError: null });
    try {
      const response = await getCarLoadReport(params);
      set({ carLoadReport: response, carLoadLoading: false });
    } catch {
      set({
        carLoadError: "Error al cargar el reporte de llenado de carros",
        carLoadLoading: false,
      });
    }
  },

  // ─── Detailed Sales ──────────────────────────────────────────────────────
  detailedSalesReport: null,
  detailedSalesLoading: false,
  detailedSalesError: null,

  fetchDetailedSalesReport: async (params: DetailedSalesReportParams) => {
    set({ detailedSalesLoading: true, detailedSalesError: null });
    try {
      const response = await getDetailedSalesReport(params);
      set({ detailedSalesReport: response, detailedSalesLoading: false });
    } catch {
      set({
        detailedSalesError: "Error al cargar el reporte de ventas detallado",
        detailedSalesLoading: false,
      });
    }
  },

  // ─── Sales By Product ────────────────────────────────────────────────────
  salesByProductReport: null,
  salesByProductLoading: false,
  salesByProductError: null,

  fetchSalesByProductReport: async (params: SalesByProductReportParams) => {
    set({ salesByProductLoading: true, salesByProductError: null });
    try {
      const response = await getSalesByProductReport(params);
      set({ salesByProductReport: response, salesByProductLoading: false });
    } catch {
      set({
        salesByProductError: "Error al cargar el reporte de ventas por producto",
        salesByProductLoading: false,
      });
    }
  },

  // ─── Annual Sales ────────────────────────────────────────────────────────
  annualSalesReport: null,
  annualSalesLoading: false,
  annualSalesError: null,

  fetchAnnualSalesReport: async (params: AnnualSalesReportParams) => {
    set({ annualSalesLoading: true, annualSalesError: null });
    try {
      const response = await getAnnualSalesReport(params);
      set({ annualSalesReport: response, annualSalesLoading: false });
    } catch {
      set({
        annualSalesError: "Error al cargar el reporte de ventas anuales",
        annualSalesLoading: false,
      });
    }
  },
}));
