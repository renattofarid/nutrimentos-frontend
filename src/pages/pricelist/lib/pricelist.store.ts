import { create } from "zustand";
import type { Meta } from "@/lib/pagination.interface";
import type { PriceList, GetPriceResponse } from "./pricelist.interface";
import type {
  PriceListSchemaCreate,
  PriceListSchemaUpdate,
  AssignClientSchema,
  GetPriceSchema,
} from "./pricelist.schema";
import * as actions from "./pricelist.actions";

interface PriceListStore {
  // Estado
  priceLists: PriceList[] | null;
  priceList: PriceList | null;
  priceData: GetPriceResponse | null;
  meta: Meta | null;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Acciones
  fetchPriceLists: (params?: Record<string, any>) => Promise<void>;
  fetchPriceList: (id: number) => Promise<void>;
  createPriceList: (data: PriceListSchemaCreate) => Promise<void>;
  updatePriceList: (id: number, data: PriceListSchemaUpdate) => Promise<void>;
  deletePriceList: (id: number) => Promise<void>;
  assignClient: (id: number, data: AssignClientSchema) => Promise<void>;
  getPrice: (data: GetPriceSchema) => Promise<void>;
  clearPriceList: () => void;
  clearPriceData: () => void;
}

export const usePriceListStore = create<PriceListStore>((set) => ({
  // Estado inicial
  priceLists: null,
  priceList: null,
  priceData: null,
  meta: null,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  // Obtener todas las listas de precio
  fetchPriceLists: async (params?) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await actions.getPriceLists({ params });
      set({ priceLists: data, meta, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Error al cargar las listas de precio",
        isLoading: false,
      });
    }
  },

  // Obtener una lista de precio por ID
  fetchPriceList: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await actions.findPriceListById(id);
      set({ priceList: data, isFinding: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Error al cargar la lista de precio",
        isFinding: false,
      });
    }
  },

  // Crear una nueva lista de precio
  createPriceList: async (data: PriceListSchemaCreate) => {
    set({ isSubmitting: true, error: null });
    try {
      await actions.storePriceList(data);
      set({ isSubmitting: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Error al crear la lista de precio",
        isSubmitting: false,
      });
      throw error;
    }
  },

  // Actualizar una lista de precio
  updatePriceList: async (id: number, data: PriceListSchemaUpdate) => {
    set({ isSubmitting: true, error: null });
    try {
      await actions.updatePriceList(id, data);
      set({ isSubmitting: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message || "Error al actualizar la lista de precio",
        isSubmitting: false,
      });
      throw error;
    }
  },

  // Eliminar una lista de precio
  deletePriceList: async (id: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await actions.deletePriceList(id);
      set({ isSubmitting: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Error al eliminar la lista de precio",
        isSubmitting: false,
      });
      throw error;
    }
  },

  // Asignar cliente a una lista de precio
  assignClient: async (id: number, data: AssignClientSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      await actions.assignClientToPriceList(id, data);
      set({ isSubmitting: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message || "Error al asignar cliente a la lista de precio",
        isSubmitting: false,
      });
      throw error;
    }
  },

  // Consultar precio
  getPrice: async (data: GetPriceSchema) => {
    set({ isLoading: true, error: null, priceData: null });
    try {
      const response = await actions.getPrice(data);
      set({ priceData: response, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Error al consultar el precio",
        isLoading: false,
      });
      throw error;
    }
  },

  // Limpiar lista de precio actual
  clearPriceList: () => set({ priceList: null }),

  // Limpiar datos de precio consultado
  clearPriceData: () => set({ priceData: null }),
}));
