import { create } from "zustand";
import { getAllPersons } from "@/pages/person/lib/person.actions";
import type {
  PersonResource,
  GetPersonsProps,
} from "@/pages/person/lib/person.interface";
import { CARRIER_ROLE_CODE } from "./carrier.interface";

interface CarrierStore {
  allCarriers: PersonResource[] | null;
  isLoading: boolean;
  error?: string;
  fetchAllCarriers: (params?: Record<string, unknown>) => Promise<void>;
  clearCarriers: () => void;
}

export const useCarrierStore = create<CarrierStore>((set) => ({
  allCarriers: null,
  isLoading: false,
  error: undefined,

  fetchAllCarriers: async (params?: Record<string, unknown>) => {
    set({ isLoading: true, error: undefined });
    try {
      const carrierParams: GetPersonsProps = {
        params: {
          ...params,
          role_names: [CARRIER_ROLE_CODE],
        },
      };
      const data = await getAllPersons(carrierParams);
      set({ allCarriers: data, isLoading: false });
    } catch {
      set({ error: "Error al cargar los transportistas", isLoading: false });
    }
  },

  clearCarriers: () => {
    set({
      allCarriers: null,
      error: undefined,
    });
  },
}));
