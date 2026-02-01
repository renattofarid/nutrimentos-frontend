import { create } from "zustand";
import type { Meta } from "@/lib/pagination.interface";
import type {
  PurchaseCreditNoteResource,
  PurchaseCreditNoteTypeResource,
  CreatePurchaseCreditNoteRequest,
  UpdatePurchaseCreditNoteRequest,
} from "./purchase-credit-note.interface";
import {
  getPurchaseCreditNote,
  getAllPurchaseCreditNotes,
  findPurchaseCreditNoteById,
  storePurchaseCreditNote,
  updatePurchaseCreditNote,
  deletePurchaseCreditNote,
  getPurchaseCreditNoteTypes,
} from "./purchase-credit-note.actions";

interface PurchaseCreditNoteStore {
  // Estado
  allPurchaseCreditNotes: PurchaseCreditNoteResource[] | null;
  purchaseCreditNotes: PurchaseCreditNoteResource[] | null;
  purchaseCreditNote: PurchaseCreditNoteResource | null;
  creditNoteTypes: PurchaseCreditNoteTypeResource[] | null;
  meta: Meta | null;

  // Estados de carga
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  isLoadingTypes: boolean;
  error: string | null;

  // Acciones
  fetchAllPurchaseCreditNotes: () => Promise<void>;
  fetchPurchaseCreditNotes: (params?: Record<string, any>) => Promise<void>;
  fetchPurchaseCreditNote: (id: number) => Promise<void>;
  createPurchaseCreditNote: (
    data: CreatePurchaseCreditNoteRequest,
  ) => Promise<void>;
  updatePurchaseCreditNote: (
    id: number,
    data: UpdatePurchaseCreditNoteRequest,
  ) => Promise<void>;
  deletePurchaseCreditNote: (id: number) => Promise<void>;
  fetchCreditNoteTypes: () => Promise<void>;
}

export const usePurchaseCreditNoteStore = create<PurchaseCreditNoteStore>(
  (set) => ({
    // Estado inicial
    allPurchaseCreditNotes: null,
    purchaseCreditNotes: null,
    purchaseCreditNote: null,
    creditNoteTypes: null,
    meta: null,
    isLoadingAll: false,
    isLoading: false,
    isFinding: false,
    isSubmitting: false,
    isLoadingTypes: false,
    error: null,

    // Implementación de acciones
    fetchAllPurchaseCreditNotes: async () => {
      set({ isLoadingAll: true, error: null });
      try {
        const data = await getAllPurchaseCreditNotes();
        set({ allPurchaseCreditNotes: data, isLoadingAll: false });
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Error al cargar notas de crédito de compras";
        set({ error: errorMessage, isLoadingAll: false });
      }
    },

    fetchPurchaseCreditNotes: async (params?: Record<string, any>) => {
      set({ isLoading: true, error: null });
      try {
        const { data, meta } = await getPurchaseCreditNote({ params });
        set({ purchaseCreditNotes: data, meta: meta, isLoading: false });
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Error al cargar notas de crédito de compras";
        set({ error: errorMessage, isLoading: false });
      }
    },

    fetchPurchaseCreditNote: async (id: number) => {
      set({ isFinding: true, error: null });
      try {
        const { data } = await findPurchaseCreditNoteById(id);
        set({ purchaseCreditNote: data, isFinding: false });
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Error al cargar nota de crédito de compra";
        set({ error: errorMessage, isFinding: false });
      }
    },

    createPurchaseCreditNote: async (
      data: CreatePurchaseCreditNoteRequest,
    ) => {
      set({ isSubmitting: true, error: null });
      try {
        await storePurchaseCreditNote(data);
        set({ isSubmitting: false });
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Error desconocido";
        set({ error: errorMessage, isSubmitting: false });
        throw err;
      }
    },

    updatePurchaseCreditNote: async (
      id: number,
      data: UpdatePurchaseCreditNoteRequest,
    ) => {
      set({ isSubmitting: true, error: null });
      try {
        await updatePurchaseCreditNote(id, data);
        set({ isSubmitting: false });
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Error desconocido";
        set({ error: errorMessage, isSubmitting: false });
        throw err;
      }
    },

    deletePurchaseCreditNote: async (id: number) => {
      set({ error: null });
      try {
        await deletePurchaseCreditNote(id);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Error al eliminar nota de crédito de compra";
        set({ error: errorMessage });
        throw err;
      }
    },

    fetchCreditNoteTypes: async () => {
      set({ isLoadingTypes: true, error: null });
      try {
        const data = await getPurchaseCreditNoteTypes();
        set({ creditNoteTypes: data, isLoadingTypes: false });
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Error al cargar tipos de nota de crédito";
        set({ error: errorMessage, isLoadingTypes: false });
      }
    },
  }),
);
