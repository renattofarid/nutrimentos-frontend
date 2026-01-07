import { create } from "zustand";
import {
  findVehicleById,
  getAllVehicles,
  getVehicle,
  storeVehicle,
  updateVehicle,
} from "./vehicle.actions";
import type { VehicleSchema } from "./vehicle.schema";
import type { Meta } from "@/lib/pagination.interface";
import type { VehicleResource } from "./vehicle.interface";

interface VehicleStore {
  allVehicles: VehicleResource[] | null;
  vehicles: VehicleResource[] | null;
  vehicle: VehicleResource | null;
  meta: Meta | null;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchAllVehicles: () => Promise<void>;
  fetchVehicles: (params?: Record<string, any>) => Promise<void>;
  fetchVehicle: (id: number) => Promise<void>;
  createVehicle: (data: VehicleSchema) => Promise<void>;
  updateVehicle: (id: number, data: VehicleSchema) => Promise<void>;
}

export const useVehicleStore = create<VehicleStore>((set) => ({
  allVehicles: null,
  vehicle: null,
  vehicles: null,
  meta: null,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchVehicles: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getVehicle({ params });
      set({ vehicles: data, meta: meta, isLoading: false });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error al cargar vehículos";
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchAllVehicles: async () => {
    set({ isLoadingAll: true, error: null });
    try {
      const data = await getAllVehicles();
      set({ allVehicles: data, isLoadingAll: false });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error al cargar vehículos";
      set({ error: errorMessage, isLoadingAll: false });
    }
  },

  fetchVehicle: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findVehicleById(id);
      set({ vehicle: data, isFinding: false });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error al cargar el vehículo";
      set({ error: errorMessage, isFinding: false });
    }
  },

  createVehicle: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await storeVehicle(data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error al crear el Vehículo";
      set({ error: errorMessage });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateVehicle: async (id: number, data: VehicleSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateVehicle(id, data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error al actualizar el Vehículo";
      set({ error: errorMessage });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
