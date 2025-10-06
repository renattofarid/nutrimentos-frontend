import { create } from "zustand";
import {
  findBusinessTypeById,
  getAllBusinessTypes,
  getBusinessType,
  storeBusinessType,
  updateBusinessType,
} from "./businesstype.actions";
import type { BusinessTypeSchema } from "./businesstype.schema";
import type { Meta } from "@/lib/pagination.interface";
import type { BusinessTypeResource } from "./businesstype.interface";

interface BusinessTypeStore {
  allBusinessTypes: BusinessTypeResource[] | null;
  businessTypes: BusinessTypeResource[] | null;
  businessType: BusinessTypeResource | null;
  meta: Meta | null;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchAllBusinessTypes: () => Promise<void>;
  fetchBusinessTypes: (params?: Record<string, any>) => Promise<void>;
  fetchBusinessType: (id: number) => Promise<void>;
  createBusinessType: (data: BusinessTypeSchema) => Promise<void>;
  updateBusinessType: (id: number, data: BusinessTypeSchema) => Promise<void>;
}

export const useBusinessTypeStore = create<BusinessTypeStore>((set) => ({
  allBusinessTypes: null,
  businessType: null,
  businessTypes: null,
  meta: null,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchBusinessTypes: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getBusinessType({ params });
      set({ businessTypes: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar tipos de negocio", isLoading: false });
    }
  },

  fetchAllBusinessTypes: async () => {
    set({ isLoadingAll: true, error: null });
    try {
      const data = await getAllBusinessTypes();
      set({ allBusinessTypes: data, isLoadingAll: false });
    } catch (err) {
      set({ error: "Error al cargar tipos de negocio", isLoadingAll: false });
    }
  },

  fetchBusinessType: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findBusinessTypeById(id);
      set({ businessType: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar el tipo de negocio", isFinding: false });
    }
  },

  createBusinessType: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await storeBusinessType(data);
    } catch (err) {
      set({ error: "Error al crear el Tipo de Negocio" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateBusinessType: async (id: number, data: BusinessTypeSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateBusinessType(id, data);
    } catch (err) {
      set({ error: "Error al actualizar el Tipo de Negocio" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
