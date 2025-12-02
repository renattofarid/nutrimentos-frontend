import { create } from "zustand";
import {
  findPaymentConceptById,
  getAllPaymentConcepts,
  getPaymentConcept,
  storePaymentConcept,
  updatePaymentConcept,
} from "./payment-concept.actions";
import type { PaymentConceptSchema } from "./payment-concept.schema";
import type { Meta } from "@/lib/pagination.interface";
import type { PaymentConceptResource } from "./payment-concept.interface";

interface PaymentConceptStore {
  allPaymentConcepts: PaymentConceptResource[] | null;
  paymentConcepts: PaymentConceptResource[] | null;
  paymentConcept: PaymentConceptResource | null;
  meta: Meta | null;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchAllPaymentConcepts: (params?: Record<string, any>) => Promise<void>;
  fetchPaymentConcepts: (params?: Record<string, any>) => Promise<void>;
  fetchPaymentConcept: (id: number) => Promise<void>;
  createPaymentConcept: (data: PaymentConceptSchema) => Promise<void>;
  updatePaymentConcept: (
    id: number,
    data: PaymentConceptSchema
  ) => Promise<void>;
}

export const usePaymentConceptStore = create<PaymentConceptStore>((set) => ({
  allPaymentConcepts: null,
  paymentConcept: null,
  paymentConcepts: null,
  meta: null,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchPaymentConcepts: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getPaymentConcept({ params });
      set({ paymentConcepts: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar conceptos de pago", isLoading: false });
    }
  },

  fetchAllPaymentConcepts: async (params?: Record<string, any>) => {
    set({ isLoadingAll: true, error: null });
    try {
      const data = await getAllPaymentConcepts({ params });
      set({ allPaymentConcepts: data, isLoadingAll: false });
    } catch (err) {
      set({ error: "Error al cargar conceptos de pago", isLoadingAll: false });
    }
  },

  fetchPaymentConcept: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findPaymentConceptById(id);
      set({ paymentConcept: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar el concepto de pago", isFinding: false });
    }
  },

  createPaymentConcept: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await storePaymentConcept(data);
    } catch (err) {
      set({ error: "Error al crear el Concepto de Pago" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updatePaymentConcept: async (id: number, data: PaymentConceptSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      await updatePaymentConcept(id, data);
    } catch (err) {
      set({ error: "Error al actualizar el Concepto de Pago" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
