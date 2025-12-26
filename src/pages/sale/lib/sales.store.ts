import { create } from "zustand";
import type {
  SaleResource,
  CreateSaleRequest,
  UpdateSaleRequest,
} from "./sale.interface";
import {
  getSales,
  getAllSales,
  findSaleById,
  storeSale,
  updateSale,
  deleteSale,
  type GetSalesParams,
} from "./sale.actions";
import type { SaleSchema, SaleUpdateSchema } from "./sale.schema";
import {
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
  errorToast,
  successToast,
} from "@/lib/core.function";
import { SALE } from "./sale.interface";
import type { Meta } from "@/lib/pagination.interface";

const { MODEL } = SALE;

interface SaleStore {
  // State
  allSales: SaleResource[] | null;
  sales: SaleResource[] | null;
  sale: SaleResource | null;
  meta: Meta | null;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  fetchAllSales: () => Promise<void>;
  fetchSales: (params?: GetSalesParams) => Promise<void>;
  fetchSale: (id: number) => Promise<void>;
  createSale: (data: SaleSchema) => Promise<void>;
  updateSale: (id: number, data: Partial<SaleUpdateSchema>) => Promise<void>;
  removeSale: (id: number) => Promise<void>;
  resetSale: () => void;
}

export const useSaleStore = create<SaleStore>((set) => ({
  // Initial state
  allSales: null,
  sales: null,
  sale: null,
  meta: null,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  // Fetch all sales (no pagination)
  fetchAllSales: async () => {
    set({ isLoadingAll: true, error: null });
    try {
      const data = await getAllSales();
      set({ allSales: data, isLoadingAll: false });
    } catch (error) {
      set({ error: "Error al cargar las ventas", isLoadingAll: false });
      errorToast("Error al cargar las ventas");
    }
  },

  // Fetch sales with pagination
  fetchSales: async (params?: GetSalesParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getSales(params);
      const meta = response.meta;
      set({ sales: response.data, meta, isLoading: false });
    } catch (error) {
      set({ error: "Error al cargar las ventas", isLoading: false });
      errorToast("Error al cargar las ventas");
    }
  },

  // Fetch single sale by ID
  fetchSale: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const response = await findSaleById(id);
      set({ sale: response.data, isFinding: false });
    } catch (error) {
      set({ error: "Error al cargar la venta", isFinding: false });
      errorToast("Error al cargar la venta");
    }
  },

  // Create new sale
  createSale: async (data: SaleSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      const request: CreateSaleRequest = {
        branch_id: Number(data.branch_id),
        customer_id: Number(data.customer_id),
        warehouse_id: Number(data.warehouse_id),
        vendedor_id: data.vendedor_id ? Number(data.vendedor_id) : null,
        document_type: data.document_type,
        issue_date: data.issue_date,
        payment_type: data.payment_type,
        total_weight: data.total_weight || 0,
        currency: data.currency,
        observations: data.observations || "",
        details: data.details.map((detail) => ({
          product_id: Number(detail.product_id),
          quantity_sacks: Number(detail.quantity_sacks),
          quantity_kg: Number(detail.quantity_kg),
          unit_price: Number(detail.unit_price),
        })),
        installments:
          data.installments.length > 0
            ? data.installments.map((installment) => ({
                installment_number: Number(installment.installment_number),
                due_days: Number(installment.due_days),
                amount: Number(installment.amount),
              }))
            : undefined,
      };

      await storeSale(request);
      set({ isSubmitting: false });
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "create"), isSubmitting: false });
      throw error;
    }
  },

  // Update sale
  updateSale: async (id: number, data: Partial<SaleUpdateSchema>) => {
    set({ isSubmitting: true, error: null });
    try {
      const request: UpdateSaleRequest = {
        ...(data.branch_id && { branch_id: Number(data.branch_id) }),
        ...(data.customer_id && { customer_id: Number(data.customer_id) }),
        ...(data.warehouse_id && { warehouse_id: Number(data.warehouse_id) }),
        ...(data.vendedor_id !== undefined && {
          vendedor_id: data.vendedor_id ? Number(data.vendedor_id) : null,
        }),
        ...(data.document_type && { document_type: data.document_type }),
        ...(data.issue_date && { issue_date: data.issue_date }),
        ...(data.payment_type && { payment_type: data.payment_type }),
        ...(data.total_weight !== undefined && {
          total_weight: data.total_weight || 0,
        }),
        ...(data.currency && { currency: data.currency }),
        ...(data.observations !== undefined && {
          observations: data.observations,
        }),
        ...(data.details &&
          data.details.length > 0 && {
            details: data.details.map((detail) => ({
              product_id: Number(detail.product_id),
              quantity_sacks: Number(detail.quantity_sacks),
              quantity_kg: Number(detail.quantity_kg),
              unit_price: Number(detail.unit_price),
            })),
          }),
        ...(data.installments &&
          data.installments.length > 0 && {
            installments: data.installments.map((installment) => ({
              installment_number: Number(installment.installment_number),
              due_days: Number(installment.due_days),
              amount: Number(installment.amount),
            })),
          }),
      };

      await updateSale(id, request);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "update"), isSubmitting: false });
      errorToast(ERROR_MESSAGE(MODEL, "update"));
      throw error;
    }
  },

  // Delete sale
  removeSale: async (id: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await deleteSale(id);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "delete"), isSubmitting: false });
      errorToast(ERROR_MESSAGE(MODEL, "delete"));
      throw error;
    }
  },

  // Reset sale state
  resetSale: () => {
    set({ sale: null, error: null });
  },
}));
