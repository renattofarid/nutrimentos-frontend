import { create } from "zustand";

interface SettingStore {
  settingModal: boolean;
  setSettingModal: (settingModal: boolean) => void;
  settingIdEdit: number | null;
  setSettingIdEdit: (settingIdEdit: number | null) => void;
}

export const useSettingStore = create<SettingStore>((set) => ({
  settingModal: false,
  setSettingModal: (settingModal: boolean) => set({ settingModal }),
  settingIdEdit: null,
  setSettingIdEdit: (settingIdEdit: number | null) => set({ settingIdEdit }),
}));
