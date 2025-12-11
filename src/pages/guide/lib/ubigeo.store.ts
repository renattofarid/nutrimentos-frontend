import { create } from "zustand";
import { searchUbigeos as searchUbigeosAction } from "./ubigeo.actions";
import type { UbigeoResource } from "./ubigeo.interface";

interface UbigeoStore {
  ubigeos: UbigeoResource[];
  isSearching: boolean;
  searchUbigeos: (cadena?: string) => Promise<void>;
}

export const useUbigeoStore = create<UbigeoStore>((set) => ({
  ubigeos: [],
  isSearching: false,
  searchUbigeos: async (cadena?: string) => {
    set({ isSearching: true });
    try {
      const response = await searchUbigeosAction(cadena);
      set({ ubigeos: response.data, isSearching: false });
    } catch (error) {
      console.error("Error searching ubigeos:", error);
      set({ ubigeos: [], isSearching: false });
    }
  },
}));
