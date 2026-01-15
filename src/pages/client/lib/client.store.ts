import { create } from "zustand";
import { getAllPersons, getPersons } from "@/pages/person/lib/person.actions";
import type {
  PersonResource,
  GetPersonsProps,
} from "@/pages/person/lib/person.interface";
import type { Meta } from "@/lib/pagination.interface";
import { CLIENT_ROLE_CODE } from "./client.interface";

interface ClientStore {
  clients: PersonResource[] | null;
  allClients: PersonResource[] | null;
  meta: Meta | null;
  isLoading: boolean;
  isLoadingAll: boolean;
  error: string | null;
  fetchClients: ({ params }: GetPersonsProps) => Promise<void>;
  fetchAllClients: ({ params }: GetPersonsProps) => Promise<void>;
  clearState: () => void;
}

export const useClientStore = create<ClientStore>((set) => ({
  clients: null,
  allClients: null,
  meta: null,
  isLoading: false,
  isLoadingAll: false,
  error: null,

  fetchClients: async ({ params }: GetPersonsProps) => {
    set({ isLoading: true, error: null });
    try {
      const clientParams = {
        ...params,
        role_names: [CLIENT_ROLE_CODE],
      };
      const { data, meta } = await getPersons({ params: clientParams });
      set({ clients: data, meta: meta, isLoading: false });
    } catch {
      set({ error: "Error al cargar los clientes", isLoading: false });
    }
  },

  fetchAllClients: async ({ params }: GetPersonsProps) => {
    set({ isLoadingAll: true, error: null });
    try {
      const clientParams = {
        ...params,
        role_names: [CLIENT_ROLE_CODE],
      };
      const data = await getAllPersons({ params: clientParams });
      set({ allClients: data, isLoadingAll: false });
    } catch {
      set({ error: "Error al cargar todos los clientes", isLoadingAll: false });
    }
  },

  clearState: () => {
    set({
      clients: null,
      allClients: null,
      meta: null,
      error: null,
    });
  },
}));
