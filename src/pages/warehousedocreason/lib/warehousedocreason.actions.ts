import { api } from "@/lib/config";
import {
  WAREHOUSEDOCREASON,
  type getWarehouseDocReasonProps,
  type WarehouseDocReasonResource,
  type WarehouseDocReasonResourceById,
  type WarehouseDocReasonResponse,
} from "./warehousedocreason.interface";
import type { WarehouseDocReasonSchema } from "./warehousedocreason.schema";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = WAREHOUSEDOCREASON;

export async function getWarehouseDocReason({
  params,
}: getWarehouseDocReasonProps): Promise<WarehouseDocReasonResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<WarehouseDocReasonResponse>(ENDPOINT, config);
  return data;
}

export async function getAllWarehouseDocReasons(): Promise<WarehouseDocReasonResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<WarehouseDocReasonResource[]>(ENDPOINT, config);
  return data;
}

export async function findWarehouseDocReasonById(
  id: number
): Promise<WarehouseDocReasonResourceById> {
  const response = await api.get<WarehouseDocReasonResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeWarehouseDocReason(
  data: WarehouseDocReasonSchema
): Promise<WarehouseDocReasonResponse> {
  const response = await api.post<WarehouseDocReasonResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateWarehouseDocReason(
  id: number,
  data: WarehouseDocReasonSchema
): Promise<WarehouseDocReasonResponse> {
  const response = await api.put<WarehouseDocReasonResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteWarehouseDocReason(
  id: number
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`${ENDPOINT}/${id}`);
  return data;
}
