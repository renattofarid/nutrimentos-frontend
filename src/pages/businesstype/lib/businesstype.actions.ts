import { api } from "@/lib/config";
import {
  BUSINESSTYPE,
  type getBusinessTypeProps,
  type BusinessTypeResource,
  type BusinessTypeResourceById,
  type BusinessTypeResponse,
} from "./businesstype.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = BUSINESSTYPE;

export async function getBusinessType({
  params,
}: getBusinessTypeProps): Promise<BusinessTypeResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<BusinessTypeResponse>(ENDPOINT, config);
  return data;
}

export async function getAllBusinessTypes(): Promise<BusinessTypeResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<BusinessTypeResource[]>(ENDPOINT, config);
  return data;
}

export async function findBusinessTypeById(
  id: number
): Promise<BusinessTypeResourceById> {
  const response = await api.get<BusinessTypeResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeBusinessType(data: any): Promise<BusinessTypeResponse> {
  const response = await api.post<BusinessTypeResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateBusinessType(
  id: number,
  data: any
): Promise<BusinessTypeResponse> {
  const response = await api.put<BusinessTypeResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteBusinessType(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}
