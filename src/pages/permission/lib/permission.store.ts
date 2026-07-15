import { create } from "zustand";
import {
  deletePermission,
  getAllPermissions,
  storePermission,
  updatePermission,
} from "./permission.actions";
import type { PermissionSchema } from "./permission.schema";
import type {
  PermissionMutationResponse,
  PermissionResource,
} from "./permission.interface";

interface PermissionStore {
  permissions: PermissionResource[] | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchPermissions: () => Promise<void>;
  createPermission: (
    data: PermissionSchema
  ) => Promise<PermissionMutationResponse>;
  updatePermission: (
    id: number,
    data: PermissionSchema
  ) => Promise<PermissionMutationResponse>;
  deletePermission: (id: number) => Promise<void>;
}

export const usePermissionCrudStore = create<PermissionStore>((set) => ({
  permissions: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchPermissions: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getAllPermissions({});
      set({ permissions: data, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar los permisos", isLoading: false });
    }
  },

  createPermission: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      return await storePermission(data);
    } catch (err) {
      set({ error: "Error al crear el permiso" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updatePermission: async (id, data) => {
    set({ isSubmitting: true, error: null });
    try {
      return await updatePermission(id, data);
    } catch (err) {
      set({ error: "Error al actualizar el permiso" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  deletePermission: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      await deletePermission(id);
    } catch (err) {
      set({ error: "Error al eliminar el permiso" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
