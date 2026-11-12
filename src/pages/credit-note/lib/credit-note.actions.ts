import { api, DEFAULT_COMPANY_ID } from "@/lib/config";
import {
  CREDIT_NOTE,
  type getCreditNoteProps,
  type CreditNoteResource,
  type CreditNoteResourceById,
  type CreditNoteResponse,
  type CreateCreditNoteRequest,
  type UpdateCreditNoteRequest,
  type UpdateCreditNoteResponse,
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
): Promise<CreditNoteResourceById> {
  const response = await api.post<CreditNoteResourceById>(ENDPOINT, data);
  return response.data;
}

// Ticket de impresión
export async function getCreditNoteTicket(id: number): Promise<Blob> {
  const response = await api.get(`${ENDPOINT}/${id}/ticket`, {
    responseType: "blob",
  });
  return response.data;
}

// Siguiente correlativo de nota de crédito
export interface NextCreditNoteSeriesData {
  exists: boolean;
  serie: string;
  current_number: number;
  next_number: number;
  next_formatted: string;
  full_number: string;
  branch_id: number;
  branch_name: string;
}

export async function getNextCreditNoteSeries(
  branch_id: number,
): Promise<NextCreditNoteSeriesData> {
  const response = await api.post<{ data: NextCreditNoteSeriesData }>(
    `${ENDPOINT}/view-next-series`,
    {
      branch_id,
      document_type: "NOTA_CREDITO",
      company_id: DEFAULT_COMPANY_ID,
    },
  );
  return response.data.data;
}

// Tickets en bulk
export interface BulkCreditNoteTicketsRequest {
  ids: number[];
}

export async function exportBulkCreditNoteTickets(
  params: BulkCreditNoteTicketsRequest
): Promise<Blob> {
  const response = await api.post(
    `/credit-notes/bulk-ticket`,
    params,
    { responseType: "blob" }
  );
  return response.data;
}

// Buscar por rango de números
export interface GetCreditNotesByRangeParams {
  numero_inicio: number;
  numero_fin: number;
  company_id?: number | null;
  customer_id?: number | null;
  status?: string | null;
  warehouse_id?: number | null;
}

export interface CreditNotesByRangeResponse {
  message: string;
  data: CreditNoteResource[];
  meta: {
    total: number;
    total_amount?: number;
    rango_solicitado: {
      numero_inicio: number;
      numero_fin: number;
      cantidad_total?: number;
    };
    series_encontradas?: string[];
    numeros_encontrados?: number[];
    numeros_faltantes?: number[];
    tiene_faltantes?: boolean;
  };
}

export async function getCreditNotesByRange(
  params: GetCreditNotesByRangeParams
): Promise<CreditNotesByRangeResponse> {
  const response = await api.get<CreditNotesByRangeResponse>(
    `${ENDPOINT}/by-range`,
    { params }
  );
  return response.data;
}

// Actualizar
export async function updateCreditNote(
  id: number,
  data: UpdateCreditNoteRequest
): Promise<UpdateCreditNoteResponse> {
  const response = await api.put<UpdateCreditNoteResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

// Eliminar
export async function deleteCreditNote(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}

// Anular
export async function voidCreditNote(id: number): Promise<any> {
  const { data } = await api.patch<any>(`${ENDPOINT}/${id}/void`);
  return data;
}

// Exportar (excel | pdf)
export async function exportCreditNotes(
  params: Record<string, any>
): Promise<Blob> {
  const response = await api.get(`${ENDPOINT}/export`, {
    params,
    responseType: "blob",
  });
  return response.data;
}
