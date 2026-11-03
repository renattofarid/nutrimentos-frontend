import { api } from "@/lib/config";

export interface DNISearchRequest {
  search: string;
}

export interface DNISearchResponse {
  message: string;
  data: {
    number_document: string | null;
    names: string | null;
    father_surname: string | null;
    mother_surname: string | null;
    birthday: string | null;
    ubigeo: string | null;
  };
}

export interface RUCSearchRequest {
  search: string;
}

export interface RUCSearchResponse {
  message: string;
  data: {
    number_document: string;
    business_name: string;
    address: string | null;
  };
}

export async function searchDNI(request: DNISearchRequest): Promise<DNISearchResponse> {
  const { data } = await api.post<DNISearchResponse>("/search-dni", request);
  return data;
}

export async function searchRUC(request: RUCSearchRequest): Promise<RUCSearchResponse> {
  const { data } = await api.post<RUCSearchResponse>("/search-ruc", request);
  return data;
}

export function isValidData(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.trim() !== "";
}