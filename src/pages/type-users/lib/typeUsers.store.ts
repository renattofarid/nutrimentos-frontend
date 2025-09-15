// stores/typeUserStore.ts
import { create } from "zustand";
import {
  findTypeUserById,
  getAllTypeUsers,
  getTypeUser,
  storeTypeUser,
  updateTypeUser,
} from "./typeUser.actions";
import type { TypeUserSchema } from "./typeUser.schema";
import type { Meta } from "@/lib/pagination.interface";
import type { TypeUserResource } from "./typeUser.interface";

interface TypeUserStore {
  allTypeUsers: TypeUserResource[] | null;
  typeUsers: TypeUserResource[] | null;
  typeUser: TypeUserResource | null;
  meta: Meta | null;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchAllTypeUsers: () => Promise<void>;
  fetchTypeUsers: (params?: Record<string, any>) => Promise<void>;
  fetchTypeUser: (id: number) => Promise<void>;
  createTypeUser: (data: TypeUserSchema) => Promise<void>;
  updateTypeUser: (id: number, data: TypeUserSchema) => Promise<void>;
}

export const useTypeUserStore = create<TypeUserStore>((set) => ({
  allTypeUsers: null,
  typeUser: null,
  typeUsers: null,
  meta: null,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchTypeUsers: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getTypeUser({ params });
      set({ typeUsers: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar tipos de usuarios", isLoading: false });
    }
  },

  fetchAllTypeUsers: async () => {
    set({ isLoadingAll: true, error: null });
    try {
      const data = await getAllTypeUsers();
      set({ allTypeUsers: data, isLoadingAll: false });
    } catch (err) {
      set({ error: "Error al cargar tipos de usuarios", isLoadingAll: false });
    }
  },

  fetchTypeUser: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findTypeUserById(id);
      set({ typeUser: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar el tipo de usuario", isFinding: false });
    }
  },

  createTypeUser: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await storeTypeUser(data);
    } catch (err) {
      set({ error: "Error al crear el Tipo de Usuario" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateTypeUser: async (id: number, data: TypeUserSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateTypeUser(id, data);
    } catch (err) {
      set({ error: "Error al actualizar el Tipo de Usuario" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
