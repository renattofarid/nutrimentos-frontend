import { create } from "zustand";
import {
  findNationalityById,
  getAllNationalities,
  getNationality,
  storeNationality,
  updateNationality,
} from "./nationality.actions";
import type { NationalitySchema } from "./nationality.schema";
import type { Meta } from "@/lib/pagination.interface";
import type { NationalityResource } from "./nationality.interface";

interface NationalityStore {
  allNationalities: NationalityResource[] | null;
  nationalities: NationalityResource[] | null;
  nationality: NationalityResource | null;
  meta: Meta | null;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchAllNationalities: () => Promise<void>;
  fetchNationalities: (params?: Record<string, any>) => Promise<void>;
  fetchNationality: (id: number) => Promise<void>;
  createNationality: (data: NationalitySchema) => Promise<void>;
  updateNationality: (id: number, data: NationalitySchema) => Promise<void>;
}

export const useNationalityStore = create<NationalityStore>((set) => ({
  allNationalities: null,
  nationality: null,
  nationalities: null,
  meta: null,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchNationalities: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getNationality({ params });
      set({ nationalities: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar nacionalidades", isLoading: false });
    }
  },

  fetchAllNationalities: async () => {
    set({ isLoadingAll: true, error: null });
    try {
      const data = await getAllNationalities();
      set({ allNationalities: data, isLoadingAll: false });
    } catch (err) {
      set({ error: "Error al cargar nacionalidades", isLoadingAll: false });
    }
  },

  fetchNationality: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findNationalityById(id);
      set({ nationality: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar la nacionalidad", isFinding: false });
    }
  },

  createNationality: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await storeNationality(data);
    } catch (err) {
      set({ error: "Error al crear la Nacionalidad" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateNationality: async (id: number, data: NationalitySchema) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateNationality(id, data);
    } catch (err) {
      set({ error: "Error al actualizar la Nacionalidad" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
