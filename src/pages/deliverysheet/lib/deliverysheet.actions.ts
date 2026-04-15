import { api } from "@/lib/config";
import type {
  DeliverySheetResponse,
  DeliverySheetResource,
  DeliverySheetResourceById,
  CreateDeliverySheetRequest,
  UpdateDeliverySheetRequest,
  AvailableSalesResponse,
  UpdateDeliverySheetStatusRequest,
  CreateSettlementRequest,
  CreateDeliverySheetPaymentRequest,
  DeliverySheetCreateResponse,
} from "./deliverysheet.interface";
import { DELIVERY_SHEET_ENDPOINT } from "./deliverysheet.interface";

// ============================================
// EXPORT
// ============================================

export interface ExportDeliverySheetsParams {
  branch_id?: number | null;
  company_id?: number | null;
  customer_id?: number | null;
  delivery_date_from?: string | null;
  delivery_date_to?: string | null;
  driver_id?: number | null;
  issue_date_from?: string | null;
  issue_date_to?: string | null;
  status?:
    | "PENDIENTE"
    | "EN_REPARTO"
    | "RENDIDA"
    | "CERRADA"
    | "ANULADA"
    | null;
  type?: "CONTADO" | "CREDITO" | null;
  zone_id?: number | null;
}

export const exportDeliverySheets = async (
  params: ExportDeliverySheetsParams,
): Promise<Blob> => {
  const response = await api.get<Blob>(`${DELIVERY_SHEET_ENDPOINT}/export`, {
    params,
    responseType: "blob",
  });
  return response.data;
};

export const exportDeliverySheetById = async (id: number): Promise<Blob> => {
  const response = await api.get<Blob>(`${DELIVERY_SHEET_ENDPOINT}/export`, {
    params: { sheet_id: id, format: "pdf" },
    responseType: "blob",
  });
  return response.data;
};

export interface PreviewDeliverySheetParams {
  sale_ids: number[];
  type: "CONTADO" | "CREDITO";
  zone_id?: number;
  branch_id?: number;
  driver_id?: number;
}

export const previewDeliverySheet = async (
  params: PreviewDeliverySheetParams,
): Promise<Blob> => {
  const response = await api.post<Blob>(
    `${DELIVERY_SHEET_ENDPOINT}/preview-pdf`,
    params,
    { responseType: "blob" },
  );
  return response.data;
};

// ============================================
// DELIVERY SHEET - Main CRUD Actions
// ============================================

export interface GetDeliverySheetsParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  type?: string;
  zone_id?: number;
  driver_id?: number;
  customer_id?: number;
  date_from?: string;
  date_to?: string;
}

export const getDeliverySheets = async (
  params?: GetDeliverySheetsParams,
): Promise<DeliverySheetResponse> => {
  const response = await api.get<DeliverySheetResponse>(
    DELIVERY_SHEET_ENDPOINT,
    { params },
  );
  return response.data;
};

export const getAllDeliverySheets = async (): Promise<
  DeliverySheetResource[]
> => {
  const response = await api.get<DeliverySheetResource[]>(
    DELIVERY_SHEET_ENDPOINT,
    {
      params: { all: true },
    },
  );
  return response.data;
};

export const findDeliverySheetById = async (
  id: number,
): Promise<DeliverySheetResourceById> => {
  const response = await api.get<DeliverySheetResourceById>(
    `${DELIVERY_SHEET_ENDPOINT}/${id}`,
  );
  return response.data;
};

export const storeDeliverySheet = async (
  data: CreateDeliverySheetRequest,
): Promise<DeliverySheetCreateResponse> => {
  const response = await api.post<DeliverySheetCreateResponse>(
    DELIVERY_SHEET_ENDPOINT,
    data,
  );
  return response.data;
};

export const updateDeliverySheet = async (
  id: number,
  data: UpdateDeliverySheetRequest,
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(
    `${DELIVERY_SHEET_ENDPOINT}/${id}`,
    data,
  );
  return response.data;
};

export const deleteDeliverySheet = async (
  id: number,
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `${DELIVERY_SHEET_ENDPOINT}/${id}`,
  );
  return response.data;
};

// ============================================
// AVAILABLE SALES
// ============================================

export interface GetAvailableSalesParams {
  payment_type: "CONTADO" | "CREDITO";
  zone_id?: number;
  customer_id?: number;
  person_zone_id?: number;
  date_from?: string;
  date_to?: string;
}

export const getAvailableSales = async (
  params: GetAvailableSalesParams,
): Promise<AvailableSalesResponse> => {
  const response = await api.get<AvailableSalesResponse>(
    `${DELIVERY_SHEET_ENDPOINT}/available-sales/list`,
    { params },
  );
  return response.data;
};

// ============================================
// STATUS UPDATE
// ============================================

export const updateDeliverySheetStatus = async (
  id: number,
  data: UpdateDeliverySheetStatusRequest,
): Promise<{ message: string }> => {
  const response = await api.patch<{ message: string }>(
    `${DELIVERY_SHEET_ENDPOINT}/${id}/status`,
    data,
  );
  return response.data;
};

// ============================================
// SETTLEMENT
// ============================================

export const createSettlement = async (
  id: number,
  data: CreateSettlementRequest,
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    `${DELIVERY_SHEET_ENDPOINT}/${id}/settlement`,
    data,
  );
  return response.data;
};

// ============================================
// PAYMENT
// ============================================

export const createDeliverySheetPayment = async (
  id: number,
  data: CreateDeliverySheetPaymentRequest,
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    `${DELIVERY_SHEET_ENDPOINT}/${id}/payment`,
    data,
  );
  return response.data;
};
