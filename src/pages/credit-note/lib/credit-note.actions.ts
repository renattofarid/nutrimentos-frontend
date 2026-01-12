import { api } from "@/lib/config";
import {
  CREDIT_NOTE,
  type getCreditNoteProps,
  type CreditNoteResource,
  type CreditNoteResourceById,
  type CreditNoteResponse,
  type CreateCreditNoteRequest,
  type UpdateCreditNoteRequest,
} from "./credit-note.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = CREDIT_NOTE;

// Obtener registros paginados
export async function getCreditNote({
  params,
}: getCreditNoteProps): Promise<CreditNoteResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<CreditNoteResponse>(ENDPOINT, config);
  return data;
}

// Obtener todos los registros (sin paginación)
export async function getAllCreditNotes(): Promise<CreditNoteResource[]> {
  const config: AxiosRequestConfig = {
    params: { all: true },
  };
  const { data } = await api.get<CreditNoteResource[]>(ENDPOINT, config);
  return data;
}

// Buscar por ID
export async function findCreditNoteById(
  id: number
): Promise<CreditNoteResourceById> {
  const response = await api.get<CreditNoteResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

// Crear
export async function storeCreditNote(
  data: CreateCreditNoteRequest
): Promise<CreditNoteResponse> {
  const response = await api.post<CreditNoteResponse>(ENDPOINT, data);
  return response.data;
}

// Actualizar
export async function updateCreditNote(
  id: number,
  data: UpdateCreditNoteRequest
): Promise<CreditNoteResponse> {
  const response = await api.put<CreditNoteResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

// Eliminar
export async function deleteCreditNote(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}
