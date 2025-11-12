import { create } from "zustand";
import {
  getDocumentTypeById,
  getDocumentTypes,
  getAllDocumentTypes,
  createDocumentType,
  updateDocumentType,
} from "./document-type.actions";
import type { DocumentTypeSchema } from "./document-type.schema";
import type { Meta } from "@/lib/pagination.interface";
import type { DocumentTypeResource } from "./document-type.interface";

interface DocumentTypeStore {
  allDocumentTypes: DocumentTypeResource[] | null;
  documentTypes: DocumentTypeResource[] | null;
  documentType: DocumentTypeResource | null;
  meta: Meta | null;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchAllDocumentTypes: () => Promise<void>;
  fetchDocumentTypes: (params?: Record<string, any>) => Promise<void>;
  fetchDocumentType: (id: number) => Promise<void>;
  createDocumentType: (data: DocumentTypeSchema) => Promise<void>;
  updateDocumentType: (id: number, data: DocumentTypeSchema) => Promise<void>;
}

export const useDocumentTypeStore = create<DocumentTypeStore>((set) => ({
  allDocumentTypes: null,
  documentType: null,
  documentTypes: null,
  meta: null,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchDocumentTypes: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getDocumentTypes({ params });
      set({ documentTypes: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar tipos de documento", isLoading: false });
    }
  },

  fetchAllDocumentTypes: async () => {
    set({ isLoadingAll: true, error: null });
    try {
      const data = await getAllDocumentTypes();
      set({ allDocumentTypes: data, isLoadingAll: false });
    } catch (err) {
      set({ error: "Error al cargar tipos de documento", isLoadingAll: false });
    }
  },

  fetchDocumentType: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await getDocumentTypeById(id);
      set({ documentType: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar el tipo de documento", isFinding: false });
    }
  },

  createDocumentType: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await createDocumentType(data);
    } catch (err) {
      set({ error: "Error al crear el Tipo de Documento" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateDocumentType: async (id: number, data: DocumentTypeSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateDocumentType(id, data);
    } catch (err) {
      set({ error: "Error al actualizar el Tipo de Documento" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));

