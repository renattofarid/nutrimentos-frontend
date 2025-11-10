import { create } from "zustand";
import {
  findPurchaseInstallmentById,
  getPurchaseInstallment,
  getExpiringAlerts,
} from "./purchaseinstallment.actions";
import type { Meta } from "@/lib/pagination.interface";
import type { PurchaseInstallmentResource } from "./purchaseinstallment.interface";

interface PurchaseInstallmentStore {
  installments: PurchaseInstallmentResource[] | null;
  installment: PurchaseInstallmentResource | null;
  expiringAlerts: PurchaseInstallmentResource[] | null;
  meta: Meta | null;
  isLoading: boolean;
  isFinding: boolean;
  isLoadingAlerts: boolean;
  error: string | null;
  fetchInstallments: (params?: Record<string, any>) => Promise<void>;
  fetchInstallment: (id: number) => Promise<void>;
  fetchExpiringAlerts: () => Promise<void>;
}

export const usePurchaseInstallmentStore = create<PurchaseInstallmentStore>(
  (set) => ({
    installments: null,
    installment: null,
    expiringAlerts: null,
    meta: null,
    isLoading: false,
    isFinding: false,
    isLoadingAlerts: false,
    error: null,

    fetchInstallments: async (params?: Record<string, any>) => {
      set({ isLoading: true, error: null });
      try {
        const { data, meta } = await getPurchaseInstallment({ params });
        set({ installments: data, meta: meta, isLoading: false });
      } catch (err) {
        set({ error: "Error al cargar cuotas", isLoading: false });
      }
    },

    fetchInstallment: async (id: number) => {
      set({ isFinding: true, error: null });
      try {
        const { data } = await findPurchaseInstallmentById(id);
        set({ installment: data, isFinding: false });
      } catch (err) {
        set({ error: "Error al cargar la cuota", isFinding: false });
      }
    },

    fetchExpiringAlerts: async () => {
      set({ isLoadingAlerts: true, error: null });
      try {
        const { data } = await getExpiringAlerts();
        set({ expiringAlerts: data, isLoadingAlerts: false });
      } catch (err) {
        set({ error: "Error al cargar alertas", isLoadingAlerts: false });
      }
    },
  })
);
