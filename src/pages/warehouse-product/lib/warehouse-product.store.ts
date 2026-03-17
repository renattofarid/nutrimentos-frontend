import { create } from "zustand";
import { getWarehouseProduct } from "./warehouse-product.actions";
import type { Meta } from "@/lib/pagination.interface";
import type { WarehouseProductResource } from "./warehouse-product.interface";

interface WarehouseProductStore {
  warehouseProducts: WarehouseProductResource[] | null;
  meta: Meta | null;
  isLoading: boolean;
  error: string | null;
  fetchWarehouseProducts: (params?: Record<string, any>) => Promise<void>;
}

export const useWarehouseProductStore = create<WarehouseProductStore>((set) => ({
  warehouseProducts: null,
  meta: null,
  isLoading: false,
  error: null,

  fetchWarehouseProducts: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getWarehouseProduct({ params });
      set({ warehouseProducts: data, meta, isLoading: false });
    } catch {
      set({ error: "Error al cargar productos en almacén", isLoading: false });
    }
  },
}));
