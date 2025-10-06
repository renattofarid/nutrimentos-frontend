import { api } from "@/lib/config";
import {
  ZONE,
  type getZoneProps,
  type ZoneResource,
  type ZoneResourceById,
  type ZoneResponse,
} from "./zone.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = ZONE;

export async function getZone({
  params,
}: getZoneProps): Promise<ZoneResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<ZoneResponse>(ENDPOINT, config);
  return data;
}

export async function getAllZones(): Promise<ZoneResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<ZoneResource[]>(ENDPOINT, config);
  return data;
}

export async function findZoneById(
  id: number
): Promise<ZoneResourceById> {
  const response = await api.get<ZoneResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeZone(data: any): Promise<ZoneResponse> {
  const response = await api.post<ZoneResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateZone(
  id: number,
  data: any
): Promise<ZoneResponse> {
  const response = await api.put<ZoneResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteZone(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}
