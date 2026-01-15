import { create } from "zustand";
import type { Meta } from "@/lib/pagination.interface";
import type {
  CreditNoteResource,
  CreateCreditNoteRequest,
  UpdateCreditNoteRequest,
} from "./credit-note.interface";
import {
  getCreditNote,
  getAllCreditNotes,
  findCreditNoteById,
  storeCreditNote,
  updateCreditNote,
  deleteCreditNote,
} from "./credit-note.actions";

interface CreditNoteStore {
  // Estado
  allCreditNotes: CreditNoteResource[] | null;
  creditNotes: CreditNoteResource[] | null;
  creditNote: CreditNoteResource | null;
  meta: Meta | null;

  // Estados de carga
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Acciones
  fetchAllCreditNotes: () => Promise<void>;
  fetchCreditNotes: (params?: Record<string, any>) => Promise<void>;
  fetchCreditNote: (id: number) => Promise<void>;
  createCreditNote: (data: CreateCreditNoteRequest) => Promise<void>;
  updateCreditNote: (
    id: number,
    data: UpdateCreditNoteRequest
  ) => Promise<void>;
  deleteCreditNote: (id: number) => Promise<void>;
}

export const useCreditNoteStore = create<CreditNoteStore>((set) => ({
  // Estado inicial
  allCreditNotes: null,
  creditNotes: null,
  creditNote: null,
  meta: null,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  // Implementación de acciones
  fetchAllCreditNotes: async () => {
    set({ isLoadingAll: true, error: null });
    try {
      const data = await getAllCreditNotes();
      set({ allCreditNotes: data, isLoadingAll: false });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error al cargar notas de crédito";
      set({ error: errorMessage, isLoadingAll: false });
    }
  },

  fetchCreditNotes: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getCreditNote({ params });
      set({ creditNotes: data, meta: meta, isLoading: false });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error al cargar notas de crédito";
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchCreditNote: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findCreditNoteById(id);
      set({ creditNote: data, isFinding: false });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error al cargar nota de crédito";
      set({ error: errorMessage, isFinding: false });
    }
  },

  createCreditNote: async (data: CreateCreditNoteRequest) => {
    set({ isSubmitting: true, error: null });
    try {
      await storeCreditNote(data);
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

  updateCreditNote: async (
    id: number,
    data: UpdateCreditNoteRequest
  ) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateCreditNote(id, data);
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

  deleteCreditNote: async (id: number) => {
    set({ error: null });
    try {
      await deleteCreditNote(id);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error al eliminar nota de crédito";
      set({ error: errorMessage });
      throw err;
    }
  },
}));
