import { create } from "zustand";
import { getAllPersons, getPersons } from "@/pages/person/lib/person.actions";
import type {
  PersonResource,
  GetPersonsProps,
} from "@/pages/person/lib/person.interface";
import type { Meta } from "@/lib/pagination.interface";
import { SUPPLIER_ROLE_CODE } from "./supplier.interface";

interface SupplierStore {
  suppliers: PersonResource[] | null;
  allSuppliers: PersonResource[] | null;
  meta: Meta | null;
  isLoading: boolean;
  isLoadingAll: boolean;
  error: string | null;
  fetchSuppliers: ({ params }: GetPersonsProps) => Promise<void>;
  fetchAllSuppliers: ({ params }: GetPersonsProps) => Promise<void>;
  clearState: () => void;
}

export const useSupplierStore = create<SupplierStore>((set) => ({
  suppliers: null,
  allSuppliers: null,
  meta: null,
  isLoading: false,
  isLoadingAll: false,
  error: null,

  fetchSuppliers: async ({ params }: GetPersonsProps) => {
    set({ isLoading: true, error: null });
    try {
      const supplierParams = {
        ...params,
        role_names: [SUPPLIER_ROLE_CODE],
      };
      const { data, meta } = await getPersons({ params: supplierParams });
      set({ suppliers: data, meta: meta, isLoading: false });
    } catch {
      set({ error: "Error al cargar los proveedores", isLoading: false });
    }
  },

  fetchAllSuppliers: async ({ params }: GetPersonsProps) => {
    set({ isLoadingAll: true, error: null });
    try {
      const supplierParams = {
        ...params,
        role_names: [SUPPLIER_ROLE_CODE],
      };
      const data = await getAllPersons({ params: supplierParams });
      set({ allSuppliers: data, isLoadingAll: false });
    } catch {
      set({ error: "Error al cargar todos los proveedores", isLoadingAll: false });
    }
  },

  clearState: () => {
    set({
      suppliers: null,
      allSuppliers: null,
      meta: null,
      error: null,
    });
  },
}));
