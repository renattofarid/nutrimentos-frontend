import { create } from "zustand";
import type {
  GuideResource,
  GuideMotiveResource,
  CreateGuideRequest,
  UpdateGuideRequest,
} from "./guide.interface";
import {
  getGuides,
  getAllGuides,
  findGuideById,
  storeGuide,
  updateGuide,
  deleteGuide,
  getGuideMotives,
  type GetGuidesParams,
} from "./guide.actions";
import type { GuideSchema } from "./guide.schema";
import { ERROR_MESSAGE, errorToast } from "@/lib/core.function";
import { GUIDE } from "./guide.interface";
import type { Meta } from "@/lib/pagination.interface";

const { MODEL } = GUIDE;

interface GuideStore {
  // State
  allGuides: GuideResource[] | null;
  guides: GuideResource[] | null;
  guide: GuideResource | null;
  motives: GuideMotiveResource[] | null;
  meta: Meta | null;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  isLoadingMotives: boolean;
  error: string | null;

  // Actions
  fetchAllGuides: () => Promise<void>;
  fetchGuides: (params?: GetGuidesParams) => Promise<void>;
  fetchGuide: (id: number) => Promise<void>;
  fetchMotives: () => Promise<void>;
  createGuide: (data: GuideSchema) => Promise<void>;
  updateGuide: (id: number, data: Partial<GuideSchema>) => Promise<void>;
  removeGuide: (id: number) => Promise<void>;
  resetGuide: () => void;
}

export const useGuideStore = create<GuideStore>((set) => ({
  // Initial state
  allGuides: null,
  guides: null,
  guide: null,
  motives: null,
  meta: null,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  isLoadingMotives: false,
  error: null,

  // Fetch all guides (no pagination)
  fetchAllGuides: async () => {
    set({ isLoadingAll: true, error: null });
    try {
      const data = await getAllGuides();
      set({ allGuides: data, isLoadingAll: false });
    } catch (error) {
      set({ error: "Error al cargar las guías", isLoadingAll: false });
      errorToast("Error al cargar las guías");
    }
  },

  // Fetch guides with pagination
  fetchGuides: async (params?: GetGuidesParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getGuides(params);
      const meta = response.meta;
      set({ guides: response.data, meta, isLoading: false });
    } catch (error) {
      set({ error: "Error al cargar las guías", isLoading: false });
      errorToast("Error al cargar las guías");
    }
  },

  // Fetch single guide by ID
  fetchGuide: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const response = await findGuideById(id);
      set({ guide: response.data, isFinding: false });
    } catch (error) {
      set({ error: "Error al cargar la guía", isFinding: false });
      errorToast("Error al cargar la guía");
    }
  },

  // Fetch guide motives
  fetchMotives: async () => {
    set({ isLoadingMotives: true, error: null });
    try {
      const response = await getGuideMotives();
      set({ motives: response, isLoadingMotives: false });
    } catch (error) {
      set({
        error: "Error al cargar los motivos de traslado",
        isLoadingMotives: false,
      });
      errorToast("Error al cargar los motivos de traslado");
    }
  },

  // Create new guide
  createGuide: async (data: GuideSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      const request: CreateGuideRequest = {
        branch_id: Number(data.branch_id),
        warehouse_id: Number(data.warehouse_id),
        sale_ids: data.sale_ids || [],
        customer_id: Number(data.customer_id),
        issue_date: data.issue_date,
        transfer_date: data.transfer_date,
        modality: data.modality,
        motive_id: Number(data.motive_id),
        sale_document_number: data.sale_document_number,
        carrier_document_type: data.carrier_document_type,
        carrier_document_number: data.carrier_document_number,
        carrier_name: data.carrier_name,
        carrier_ruc: data.carrier_ruc || "",
        carrier_mtc_number: data.carrier_mtc_number,
        vehicle_id: data.vehicle_id ? Number(data.vehicle_id) : null,
        driver_document_type: data.driver_document_type || null,
        driver_document_number: data.driver_document_number || null,
        driver_name: data.driver_name || null,
        driver_license: data.driver_license || null,
        origin_address: data.origin_address,
        ubigeo_origin_id: data.ubigeo_origin_id
          ? Number(data.ubigeo_origin_id)
          : 0,
        destination_address: data.destination_address,
        ubigeo_destination_id: data.ubigeo_destination_id
          ? Number(data.ubigeo_destination_id)
          : 0,
        unit_measurement: data.unit_measurement,
        total_weight: Number(data.total_weight),
        total_packages: Number(data.total_packages),
        observations: data.observations || "",
      };

      await storeGuide(request);
      set({ isSubmitting: false });
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "create"), isSubmitting: false });
      throw error;
    }
  },

  // Update guide
  updateGuide: async (id: number, data: Partial<GuideSchema>) => {
    set({ isSubmitting: true, error: null });
    try {
      const request: UpdateGuideRequest = {
        ...(data.branch_id && { branch_id: Number(data.branch_id) }),
        ...(data.warehouse_id && { warehouse_id: Number(data.warehouse_id) }),
        ...(data.sale_ids !== undefined && { sale_ids: data.sale_ids }),
        ...(data.customer_id && { customer_id: Number(data.customer_id) }),
        ...(data.issue_date && { issue_date: data.issue_date }),
        ...(data.transfer_date && { transfer_date: data.transfer_date }),
        ...(data.modality && { modality: data.modality }),
        ...(data.motive_id && { motive_id: Number(data.motive_id) }),
        ...(data.sale_document_number && {
          sale_document_number: data.sale_document_number,
        }),
        ...(data.carrier_document_type && {
          carrier_document_type: data.carrier_document_type,
        }),
        ...(data.carrier_document_number && {
          carrier_document_number: data.carrier_document_number,
        }),
        ...(data.carrier_name && { carrier_name: data.carrier_name }),
        ...(data.carrier_ruc && { carrier_ruc: data.carrier_ruc || "" }),
        ...(data.carrier_mtc_number && {
          carrier_mtc_number: data.carrier_mtc_number,
        }),
        ...(data.vehicle_id !== undefined && {
          vehicle_id: data.vehicle_id ? Number(data.vehicle_id) : null,
        }),
        ...(data.driver_document_type !== undefined && {
          driver_document_type: data.driver_document_type || null,
        }),
        ...(data.driver_document_number !== undefined && {
          driver_document_number: data.driver_document_number || null,
        }),
        ...(data.driver_name !== undefined && {
          driver_name: data.driver_name || null,
        }),
        ...(data.driver_license !== undefined && {
          driver_license: data.driver_license || null,
        }),
        ...(data.origin_address && { origin_address: data.origin_address }),
        ...(data.ubigeo_origin_id && {
          ubigeo_origin_id: Number(data.ubigeo_origin_id),
        }),
        ...(data.destination_address && {
          destination_address: data.destination_address,
        }),
        ...(data.ubigeo_destination_id && {
          ubigeo_destination_id: Number(data.ubigeo_destination_id),
        }),
        ...(data.unit_measurement && {
          unit_measurement: data.unit_measurement,
        }),
        ...(data.total_weight && { total_weight: Number(data.total_weight) }),
        ...(data.total_packages && {
          total_packages: Number(data.total_packages),
        }),
        ...(data.observations !== undefined && {
          observations: data.observations,
        }),
      };

      await updateGuide(id, request);
      set({ isSubmitting: false });
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "update"), isSubmitting: false });
      throw error;
    }
  },

  // Delete guide
  removeGuide: async (id: number) => {
    set({ isSubmitting: true, error: null });
    try {
      await deleteGuide(id);
      set({ isSubmitting: false });
    } catch (error) {
      set({ error: ERROR_MESSAGE(MODEL, "delete"), isSubmitting: false });
      throw error;
    }
  },

  // Reset guide state
  resetGuide: () => {
    set({ guide: null, error: null });
  },
}));
