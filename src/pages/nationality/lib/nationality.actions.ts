import { api } from "@/lib/config";
import {
  NATIONALITY,
  type getNationalityProps,
  type NationalityResource,
  type NationalityResourceById,
  type NationalityResponse,
} from "./nationality.interface";
import type { NationalitySchema } from "./nationality.schema";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = NATIONALITY;

export async function getNationality({
  params,
}: getNationalityProps): Promise<NationalityResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<NationalityResponse>(ENDPOINT, config);
  return data;
}

export async function getAllNationalities(): Promise<NationalityResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<NationalityResource[]>(ENDPOINT, config);
  return data;
}

export async function findNationalityById(
  id: number
): Promise<NationalityResourceById> {
  const response = await api.get<NationalityResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeNationality(
  data: NationalitySchema
): Promise<NationalityResponse> {
  const response = await api.post<NationalityResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateNationality(
  id: number,
  data: NationalitySchema
): Promise<NationalityResponse> {
  const response = await api.put<NationalityResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteNationality(
  id: number
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`${ENDPOINT}/${id}`);
  return data;
}
