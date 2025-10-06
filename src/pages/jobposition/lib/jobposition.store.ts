import { create } from "zustand";
import {
  findJobPositionById,
  getAllJobPositions,
  getJobPosition,
  storeJobPosition,
  updateJobPosition,
} from "./jobposition.actions";
import type { JobPositionSchema } from "./jobposition.schema";
import type { Meta } from "@/lib/pagination.interface";
import type { JobPositionResource } from "./jobposition.interface";

interface JobPositionStore {
  allJobPositions: JobPositionResource[] | null;
  jobPositions: JobPositionResource[] | null;
  jobPosition: JobPositionResource | null;
  meta: Meta | null;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchAllJobPositions: () => Promise<void>;
  fetchJobPositions: (params?: Record<string, any>) => Promise<void>;
  fetchJobPosition: (id: number) => Promise<void>;
  createJobPosition: (data: JobPositionSchema) => Promise<void>;
  updateJobPosition: (id: number, data: JobPositionSchema) => Promise<void>;
}

export const useJobPositionStore = create<JobPositionStore>((set) => ({
  allJobPositions: null,
  jobPosition: null,
  jobPositions: null,
  meta: null,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchJobPositions: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getJobPosition({ params });
      set({ jobPositions: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar cargos", isLoading: false });
    }
  },

  fetchAllJobPositions: async () => {
    set({ isLoadingAll: true, error: null });
    try {
      const data = await getAllJobPositions();
      set({ allJobPositions: data, isLoadingAll: false });
    } catch (err) {
      set({ error: "Error al cargar cargos", isLoadingAll: false });
    }
  },

  fetchJobPosition: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findJobPositionById(id);
      set({ jobPosition: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar el cargo", isFinding: false });
    }
  },

  createJobPosition: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await storeJobPosition(data);
    } catch (err) {
      set({ error: "Error al crear el Cargo" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateJobPosition: async (id: number, data: JobPositionSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateJobPosition(id, data);
    } catch (err) {
      set({ error: "Error al actualizar el Cargo" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
