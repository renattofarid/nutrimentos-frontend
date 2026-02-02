import { api } from "@/lib/config";
import {
  PURCHASE_CREDIT_NOTE_ENDPOINT,
  PURCHASE_CREDIT_NOTE_TYPES_ENDPOINT,
  type getPurchaseCreditNoteProps,
  type PurchaseCreditNoteResource,
  type PurchaseCreditNoteResourceById,
  type PurchaseCreditNoteResponse,
  type PurchaseCreditNoteTypeResource,
  type CreatePurchaseCreditNoteRequest,
  type UpdatePurchaseCreditNoteRequest,
} from "./purchase-credit-note.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const ENDPOINT = PURCHASE_CREDIT_NOTE_ENDPOINT;

// Obtener registros paginados
export async function getPurchaseCreditNote({
  params,
}: getPurchaseCreditNoteProps): Promise<PurchaseCreditNoteResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<PurchaseCreditNoteResponse>(ENDPOINT, config);
  return data;
}

// Obtener todos los registros (sin paginación)
export async function getAllPurchaseCreditNotes(): Promise<
  PurchaseCreditNoteResource[]
> {
  const config: AxiosRequestConfig = {
    params: { all: true },
  };
  const { data } = await api.get<PurchaseCreditNoteResource[]>(
    ENDPOINT,
    config,
  );
  return data;
}

// Buscar por ID
export async function findPurchaseCreditNoteById(
  id: number,
): Promise<PurchaseCreditNoteResourceById> {
  const response = await api.get<PurchaseCreditNoteResourceById>(
    `${ENDPOINT}/${id}`,
  );
  return response.data;
}

// Crear
export async function storePurchaseCreditNote(
  data: CreatePurchaseCreditNoteRequest,
): Promise<PurchaseCreditNoteResourceById> {
  const response = await api.post<PurchaseCreditNoteResourceById>(
    ENDPOINT,
    data,
  );
  return response.data;
}

// Actualizar
export async function updatePurchaseCreditNote(
  id: number,
  data: UpdatePurchaseCreditNoteRequest,
): Promise<PurchaseCreditNoteResourceById> {
  const response = await api.put<PurchaseCreditNoteResourceById>(
    `${ENDPOINT}/${id}`,
    data,
  );
  return response.data;
}

// Eliminar
export async function deletePurchaseCreditNote(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}

// Obtener tipos de nota de crédito de compra
export async function getPurchaseCreditNoteTypes(): Promise<
  PurchaseCreditNoteTypeResource[]
> {
  const { data } = await api.get<{ data: PurchaseCreditNoteTypeResource[] }>(
    PURCHASE_CREDIT_NOTE_TYPES_ENDPOINT,
  );
  return data.data;
}

// Obtener compras afectadas por una NC consolidada
export async function getAffectedPurchases(id: number): Promise<any> {
  const { data } = await api.get(`${ENDPOINT}/${id}/affected-purchases`);
  return data;
}
