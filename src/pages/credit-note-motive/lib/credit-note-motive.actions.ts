import { api } from "@/lib/config";
import {
  CREDIT_NOTE_MOTIVE_ENDPOINT,
  type getCreditNoteMotiveProps,
  type CreditNoteMotiveResource,
  type CreditNoteMotiveResourceById,
  type CreditNoteMotiveResponse,
} from "./credit-note-motive.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

// Obtener registros paginados
export async function getCreditNoteMotive({
  params,
}: getCreditNoteMotiveProps): Promise<CreditNoteMotiveResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<CreditNoteMotiveResponse>(
    CREDIT_NOTE_MOTIVE_ENDPOINT,
    config
  );
  return data;
}

// Obtener todos los registros (sin paginación)
export async function getAllCreditNoteMotives(): Promise<
  CreditNoteMotiveResource[]
> {
  const config: AxiosRequestConfig = {
    params: { all: true },
  };
  const { data } = await api.get<CreditNoteMotiveResource[]>(
    CREDIT_NOTE_MOTIVE_ENDPOINT,
    config
  );
  return data;
}

// Buscar por ID
export async function findCreditNoteMotiveById(
  id: number
): Promise<CreditNoteMotiveResourceById> {
  const response = await api.get<CreditNoteMotiveResourceById>(
    `${CREDIT_NOTE_MOTIVE_ENDPOINT}/${id}`
  );
  return response.data;
}
