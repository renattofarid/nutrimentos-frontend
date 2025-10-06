import { create } from "zustand";
import {
  findWarehouseDocReasonById,
  getAllWarehouseDocReasons,
  getWarehouseDocReason,
  storeWarehouseDocReason,
  updateWarehouseDocReason,
} from "./warehousedocreason.actions";
import type { WarehouseDocReasonSchema } from "./warehousedocreason.schema";
import type { Meta } from "@/lib/pagination.interface";
import type { WarehouseDocReasonResource } from "./warehousedocreason.interface";

interface WarehouseDocReasonStore {
  allWarehouseDocReasons: WarehouseDocReasonResource[] | null;
  warehouseDocReasons: WarehouseDocReasonResource[] | null;
  warehouseDocReason: WarehouseDocReasonResource | null;
  meta: Meta | null;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchAllWarehouseDocReasons: () => Promise<void>;
  fetchWarehouseDocReasons: (params?: Record<string, any>) => Promise<void>;
  fetchWarehouseDocReason: (id: number) => Promise<void>;
  createWarehouseDocReason: (data: WarehouseDocReasonSchema) => Promise<void>;
  updateWarehouseDocReason: (id: number, data: WarehouseDocReasonSchema) => Promise<void>;
}

export const useWarehouseDocReasonStore = create<WarehouseDocReasonStore>((set) => ({
  allWarehouseDocReasons: null,
  warehouseDocReason: null,
  warehouseDocReasons: null,
  meta: null,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchWarehouseDocReasons: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getWarehouseDocReason({ params });
      set({ warehouseDocReasons: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar motivos", isLoading: false });
    }
  },

  fetchAllWarehouseDocReasons: async () => {
    set({ isLoadingAll: true, error: null });
    try {
      const data = await getAllWarehouseDocReasons();
      set({ allWarehouseDocReasons: data, isLoadingAll: false });
    } catch (err) {
      set({ error: "Error al cargar motivos", isLoadingAll: false });
    }
  },

  fetchWarehouseDocReason: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findWarehouseDocReasonById(id);
      set({ warehouseDocReason: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar el motivo", isFinding: false });
    }
  },

  createWarehouseDocReason: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await storeWarehouseDocReason(data);
    } catch (err) {
      set({ error: "Error al crear el Motivo" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateWarehouseDocReason: async (id: number, data: WarehouseDocReasonSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateWarehouseDocReason(id, data);
    } catch (err) {
      set({ error: "Error al actualizar el Motivo" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
