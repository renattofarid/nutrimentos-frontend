import { create } from "zustand";
import {
  findPurchaseById,
  getAllPurchases,
  getPurchase,
  storePurchase,
  updatePurchase,
} from "./purchase.actions";
import type { Meta } from "@/lib/pagination.interface";
import type { PurchaseResource, CreatePurchaseRequest } from "./purchase.interface";

interface PurchaseStore {
  allPurchases: PurchaseResource[] | null;
  purchases: PurchaseResource[] | null;
  purchase: PurchaseResource | null;
  meta: Meta | null;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchAllPurchases: () => Promise<void>;
  fetchPurchases: (params?: Record<string, any>) => Promise<void>;
  fetchPurchase: (id: number) => Promise<void>;
  createPurchase: (data: CreatePurchaseRequest) => Promise<void>;
  updatePurchase: (id: number, data: CreatePurchaseRequest) => Promise<void>;
}

export const usePurchaseStore = create<PurchaseStore>((set) => ({
  allPurchases: null,
  purchase: null,
  purchases: null,
  meta: null,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchPurchases: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getPurchase({ params });
      set({ purchases: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar compras", isLoading: false });
    }
  },

  fetchAllPurchases: async () => {
    set({ isLoadingAll: true, error: null });
    try {
      const data = await getAllPurchases();
      set({ allPurchases: data, isLoadingAll: false });
    } catch (err) {
      set({ error: "Error al cargar compras", isLoadingAll: false });
    }
  },

  fetchPurchase: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findPurchaseById(id);
      set({ purchase: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar la compra", isFinding: false });
    }
  },

  createPurchase: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await storePurchase(data);
    } catch (err) {
      set({ error: "Error al crear la Compra" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updatePurchase: async (id: number, data: CreatePurchaseRequest) => {
    set({ isSubmitting: true, error: null });
    try {
      await updatePurchase(id, data);
    } catch (err) {
      set({ error: "Error al actualizar la Compra" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
