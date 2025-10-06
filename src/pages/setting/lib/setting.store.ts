import { create } from "zustand";
import {
  getSettings,
  createSetting,
  updateSetting,
  deleteSetting,
  findSettingById,
} from "./setting.actions";
import type { SettingSchemaCreate, SettingSchemaEdit } from "./setting.schema";
import type { SettingResource } from "./setting.interface";

interface SettingStore {
  settingModal: boolean;
  setSettingModal: (settingModal: boolean) => void;
  settingIdEdit: number | null;
  setSettingIdEdit: (settingIdEdit: number | null) => void;

  settings: SettingResource[] | null;
  setting: SettingResource | null;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;

  fetchSettings: () => Promise<void>;
  fetchSetting: (id: number) => Promise<void>;
  createSetting: (data: SettingSchemaCreate) => Promise<void>;
  updateSetting: (id: number, data: SettingSchemaEdit) => Promise<void>;
  deleteSetting: (id: number) => Promise<void>;
}

export const useSettingStore = create<SettingStore>((set) => ({
  settingModal: false,
  setSettingModal: (settingModal: boolean) => set({ settingModal }),
  settingIdEdit: null,
  setSettingIdEdit: (settingIdEdit: number | null) => set({ settingIdEdit }),

  settings: null,
  setting: null,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getSettings();
      set({ settings: data, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar configuraciones", isLoading: false });
    }
  },

  fetchSetting: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findSettingById(id);
      set({ setting: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar la configuración", isFinding: false });
    }
  },

  createSetting: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await createSetting(data);
    } catch (err) {
      set({ error: "Error al crear la configuración" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateSetting: async (id: number, data: SettingSchemaEdit) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateSetting(id, data);
    } catch (err) {
      set({ error: "Error al actualizar la configuración" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  deleteSetting: async (id: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await deleteSetting(id);
    } catch (err) {
      set({ error: "Error al eliminar la configuración" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
