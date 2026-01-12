import { create } from "zustand";
import type { Meta } from "@/lib/pagination.interface";
import type { CreditNoteMotiveResource } from "./credit-note-motive.interface";
import {
  getCreditNoteMotive,
  getAllCreditNoteMotives,
  findCreditNoteMotiveById,
} from "./credit-note-motive.actions";

interface CreditNoteMotiveStore {
  // Estado
  allCreditNoteMotives: CreditNoteMotiveResource[] | null;
  creditNoteMotives: CreditNoteMotiveResource[] | null;
  creditNoteMotive: CreditNoteMotiveResource | null;
  meta: Meta | null;

  // Estados de carga
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;

  // Acciones
  fetchAllCreditNoteMotives: () => Promise<void>;
  fetchCreditNoteMotives: (params?: Record<string, any>) => Promise<void>;
  fetchCreditNoteMotive: (id: number) => Promise<void>;
}

export const useCreditNoteMotiveStore = create<CreditNoteMotiveStore>(
  (set) => ({
    // Estado inicial
    allCreditNoteMotives: null,
    creditNoteMotives: null,
    creditNoteMotive: null,
    meta: null,
    isLoadingAll: false,
    isLoading: false,
    isFinding: false,
    error: null,

    // Implementación de acciones
    fetchAllCreditNoteMotives: async () => {
      set({ isLoadingAll: true, error: null });
      try {
        const data = await getAllCreditNoteMotives();
        set({ allCreditNoteMotives: data, isLoadingAll: false });
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Error al cargar motivos de nota de crédito";
        set({ error: errorMessage, isLoadingAll: false });
      }
    },

    fetchCreditNoteMotives: async (params?: Record<string, any>) => {
      set({ isLoading: true, error: null });
      try {
        const { data, meta } = await getCreditNoteMotive({ params });
        set({ creditNoteMotives: data, meta: meta, isLoading: false });
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Error al cargar motivos de nota de crédito";
        set({ error: errorMessage, isLoading: false });
      }
    },

    fetchCreditNoteMotive: async (id: number) => {
      set({ isFinding: true, error: null });
      try {
        const { data } = await findCreditNoteMotiveById(id);
        set({ creditNoteMotive: data, isFinding: false });
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Error al cargar motivo de nota de crédito";
        set({ error: errorMessage, isFinding: false });
      }
    },
  })
);
