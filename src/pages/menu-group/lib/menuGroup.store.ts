import { create } from "zustand";
import {
  deleteMenuGroup,
  getAllMenuGroups,
  storeMenuGroup,
  updateMenuGroup,
} from "./menuGroup.actions";
import type { MenuGroupSchema } from "./menuGroup.schema";
import type { MenuGroupResource } from "./menuGroup.interface";

interface MenuGroupStore {
  menuGroups: MenuGroupResource[] | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchMenuGroups: () => Promise<void>;
  createMenuGroup: (data: MenuGroupSchema) => Promise<void>;
  updateMenuGroup: (id: number, data: MenuGroupSchema) => Promise<void>;
  deleteMenuGroup: (id: number) => Promise<void>;
}

export const useMenuGroupStore = create<MenuGroupStore>((set) => ({
  menuGroups: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchMenuGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getAllMenuGroups({});
      set({ menuGroups: data, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar los grupos de menú", isLoading: false });
    }
  },

  createMenuGroup: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await storeMenuGroup(data);
    } catch (err) {
      set({ error: "Error al crear el grupo de menú" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateMenuGroup: async (id, data) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateMenuGroup(id, data);
    } catch (err) {
      set({ error: "Error al actualizar el grupo de menú" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  deleteMenuGroup: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      await deleteMenuGroup(id);
    } catch (err) {
      set({ error: "Error al eliminar el grupo de menú" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
