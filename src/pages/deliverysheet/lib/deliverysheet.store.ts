import { create } from "zustand";
import type {
  DeliverySheetResource,
  Meta,
  CreateDeliverySheetRequest,
  UpdateDeliverySheetRequest,
  AvailableSale,
  UpdateDeliverySheetStatusRequest,
  CreateSettlementRequest,
  CreateDeliverySheetPaymentRequest,
} from "./deliverysheet.interface";
import {
  getDeliverySheets,
  getAllDeliverySheets,
  findDeliverySheetById,
  storeDeliverySheet,
  updateDeliverySheet,
  deleteDeliverySheet,
  getAvailableSales,
  updateDeliverySheetStatus,
  createSettlement,
  createDeliverySheetPayment,
  type GetDeliverySheetsParams,
  type GetAvailableSalesParams,
} from "./deliverysheet.actions";
import type {
  DeliverySheetSchema,
  DeliverySheetUpdateSchema,
  DeliverySheetStatusSchema,
  SettlementSchema,
  DeliverySheetPaymentSchema,
} from "./deliverysheet.schema";
import {
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
  errorToast,
  successToast,
} from "@/lib/core.function";
import { DELIVERY_SHEET } from "./deliverysheet.interface";

const { MODEL } = DELIVERY_SHEET;

interface DeliverySheetStore {
  // State
  allDeliverySheets: DeliverySheetResource[] | null;
  deliverySheets: DeliverySheetResource[] | null;
  deliverySheet: DeliverySheetResource | null;
  availableSales: AvailableSale[] | null;
  meta: Meta | null;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  isLoadingAvailableSales: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  fetchAllDeliverySheets: () => Promise<void>;
  fetchDeliverySheets: (params?: GetDeliverySheetsParams) => Promise<void>;
  fetchDeliverySheet: (id: number) => Promise<void>;
  fetchAvailableSales: (params: GetAvailableSalesParams) => Promise<void>;
  createDeliverySheet: (data: DeliverySheetSchema) => Promise<void>;
  updateDeliverySheet: (
    id: number,
    data: Partial<DeliverySheetUpdateSchema>
  ) => Promise<void>;
  removeDeliverySheet: (id: number) => Promise<void>;
  updateStatus: (id: number, data: DeliverySheetStatusSchema) => Promise<void>;
  submitSettlement: (id: number, data: SettlementSchema) => Promise<void>;
  submitPayment: (
    id: number,
    data: DeliverySheetPaymentSchema
  ) => Promise<void>;
  resetDeliverySheet: () => void;
}

export const useDeliverySheetStore = create<DeliverySheetStore>((set) => ({
  // Initial state
  allDeliverySheets: null,
  deliverySheets: null,
  deliverySheet: null,
  availableSales: null,
  meta: null,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isLoadingAvailableSales: false,
  isSubmitting: false,
  error: null,

  // Fetch all delivery sheets (no pagination)
  fetchAllDeliverySheets: async () => {
    set({ isLoadingAll: true, error: null });
    try {
      const data = await getAllDeliverySheets();
      set({ allDeliverySheets: data, isLoadingAll: false });
    } catch (error) {
      set({
        error: "Error al cargar las planillas de reparto",
        isLoadingAll: false,
      });
      errorToast("Error al cargar las planillas de reparto");
    }
  },

  // Fetch delivery sheets with pagination
  fetchDeliverySheets: async (params?: GetDeliverySheetsParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getDeliverySheets(params);
      const meta: Meta = {
        current_page: response.meta.current_page,
        from: response.meta.from,
        last_page: response.meta.last_page,
        per_page: response.meta.per_page,
        to: response.meta.to,
        total: response.meta.total,
      };
      set({ deliverySheets: response.data, meta, isLoading: false });
    } catch (error) {
      set({
        error: "Error al cargar las planillas de reparto",
        isLoading: false,
      });
      errorToast("Error al cargar las planillas de reparto");
    }
  },

  // Fetch single delivery sheet by ID
  fetchDeliverySheet: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const response = await findDeliverySheetById(id);
      set({ deliverySheet: response.data, isFinding: false });
    } catch (error) {
      set({
        error: "Error al cargar la planilla de reparto",
        isFinding: false,
      });
      errorToast("Error al cargar la planilla de reparto");
    }
  },

  // Fetch available sales
  fetchAvailableSales: async (params: GetAvailableSalesParams) => {
    set({ isLoadingAvailableSales: true, error: null });
    try {
      const response = await getAvailableSales(params);
      set({ availableSales: response.data, isLoadingAvailableSales: false });
    } catch (error) {
      set({
        error: "Error al cargar las ventas disponibles",
        isLoadingAvailableSales: false,
      });
      errorToast("Error al cargar las ventas disponibles");
    }
  },

  // Create new delivery sheet
  createDeliverySheet: async (data: DeliverySheetSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      const request: CreateDeliverySheetRequest = {
        branch_id: Number(data.branch_id),
        zone_id: Number(data.zone_id),
        driver_id: Number(data.driver_id),
        customer_id: data.customer_id ? Number(data.customer_id) : undefined,
        type: data.type as "CONTADO" | "CREDITO",
        issue_date: data.issue_date,
        delivery_date: data.delivery_date,
        sale_ids: data.sale_ids,
        observations: data.observations,
      };

      await storeDeliverySheet(request);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "create"), isSubmitting: false });
      throw error;
    }
  },

  // Update delivery sheet
  updateDeliverySheet: async (
    id: number,
    data: Partial<DeliverySheetUpdateSchema>
  ) => {
    set({ isSubmitting: true, error: null });
    try {
      const request: UpdateDeliverySheetRequest = {
        ...(data.zone_id && { zone_id: Number(data.zone_id) }),
        ...(data.driver_id && { driver_id: Number(data.driver_id) }),
        ...(data.customer_id && { customer_id: Number(data.customer_id) }),
        ...(data.type && { type: data.type as "CONTADO" | "CREDITO" }),
        ...(data.issue_date && { issue_date: data.issue_date }),
        ...(data.delivery_date && { delivery_date: data.delivery_date }),
        ...(data.sale_ids && { sale_ids: data.sale_ids }),
        ...(data.observations !== undefined && {
          observations: data.observations,
        }),
      };

      await updateDeliverySheet(id, request);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "update"), isSubmitting: false });
      errorToast(ERROR_MESSAGE(MODEL, "update"));
      throw error;
    }
  },

  // Delete delivery sheet
  removeDeliverySheet: async (id: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await deleteDeliverySheet(id);
      set({ isSubmitting: false });
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "delete"), isSubmitting: false });
      errorToast(ERROR_MESSAGE(MODEL, "delete"));
      throw error;
    }
  },

  // Update status
  updateStatus: async (id: number, data: DeliverySheetStatusSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      const request: UpdateDeliverySheetStatusRequest = {
        status: data.status as "EN_REPARTO" | "PENDIENTE",
        delivery_date: data.delivery_date,
        observations: data.observations,
      };

      await updateDeliverySheetStatus(id, request);
      set({ isSubmitting: false });
      successToast("Estado actualizado exitosamente");
    } catch (error) {
      set({ error: "Error al actualizar el estado", isSubmitting: false });
      errorToast("Error al actualizar el estado");
      throw error;
    }
  },

  // Submit settlement
  submitSettlement: async (id: number, data: SettlementSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      const request: CreateSettlementRequest = {
        sales: data.sales.map((sale) => ({
          sale_id: sale.sale_id,
          delivery_status: sale.delivery_status as
            | "ENTREGADO"
            | "NO_ENTREGADO"
            | "DEVUELTO",
          delivery_notes: sale.delivery_notes,
        })),
      };

      await createSettlement(id, request);
      set({ isSubmitting: false });
      successToast("Rendición registrada exitosamente");
    } catch (error: any) {
      set({ error: "Error al registrar la rendición", isSubmitting: false });
      errorToast(
        error.response.data.message ??
          error.response.data.error ??
          "Error al registrar la rendición"
      );
      throw error;
    }
  },

  // Submit payment
  submitPayment: async (id: number, data: DeliverySheetPaymentSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      const request: CreateDeliverySheetPaymentRequest = {
        payment_date: data.payment_date,
        amount_cash: Number(data.amount_cash) || 0,
        amount_card: Number(data.amount_card) || 0,
        amount_yape: Number(data.amount_yape) || 0,
        amount_plin: Number(data.amount_plin) || 0,
        amount_deposit: Number(data.amount_deposit) || 0,
        amount_transfer: Number(data.amount_transfer) || 0,
        amount_other: Number(data.amount_other) || 0,
        observations: data.observations,
      };

      await createDeliverySheetPayment(id, request);
      set({ isSubmitting: false });
      successToast("Pago registrado exitosamente");
    } catch (error: any) {
      set({ error: "Error al registrar el pago", isSubmitting: false });
      errorToast(
        error.response.data.error ??
          error.response.data.message ??
          "Error al registrar el pago"
      );
      throw error;
    }
  },

  // Reset delivery sheet state
  resetDeliverySheet: () => {
    set({ deliverySheet: null, error: null });
  },
}));
