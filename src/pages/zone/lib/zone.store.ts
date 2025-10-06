import { create } from "zustand";
import {
  findZoneById,
  getAllZones,
  getZone,
  storeZone,
  updateZone,
} from "./zone.actions";
import type { ZoneSchema } from "./zone.schema";
import type { Meta } from "@/lib/pagination.interface";
import type { ZoneResource } from "./zone.interface";

interface ZoneStore {
  allZones: ZoneResource[] | null;
  zones: ZoneResource[] | null;
  zone: ZoneResource | null;
  meta: Meta | null;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchAllZones: () => Promise<void>;
  fetchZones: (params?: Record<string, any>) => Promise<void>;
  fetchZone: (id: number) => Promise<void>;
  createZone: (data: ZoneSchema) => Promise<void>;
  updateZone: (id: number, data: ZoneSchema) => Promise<void>;
}

export const useZoneStore = create<ZoneStore>((set) => ({
  allZones: null,
  zone: null,
  zones: null,
  meta: null,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchZones: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getZone({ params });
      set({ zones: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar zonas", isLoading: false });
    }
  },

  fetchAllZones: async () => {
    set({ isLoadingAll: true, error: null });
    try {
      const data = await getAllZones();
      set({ allZones: data, isLoadingAll: false });
    } catch (err) {
      set({ error: "Error al cargar zonas", isLoadingAll: false });
    }
  },

  fetchZone: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findZoneById(id);
      set({ zone: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar la zona", isFinding: false });
    }
  },

  createZone: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await storeZone(data);
    } catch (err) {
      set({ error: "Error al crear la Zona" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateZone: async (id: number, data: ZoneSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateZone(id, data);
    } catch (err) {
      set({ error: "Error al actualizar la Zona" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
