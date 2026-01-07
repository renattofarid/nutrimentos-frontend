import { api } from "@/lib/config";
import {
  VEHICLE,
  type getVehicleProps,
  type VehicleResource,
  type VehicleResourceById,
  type VehicleResponse,
} from "./vehicle.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = VEHICLE;

export async function getVehicle({
  params,
}: getVehicleProps): Promise<VehicleResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<VehicleResponse>(ENDPOINT, config);
  return data;
}

export async function getAllVehicles(): Promise<VehicleResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<VehicleResource[]>(ENDPOINT, config);
  return data;
}

export async function findVehicleById(
  id: number
): Promise<VehicleResourceById> {
  const response = await api.get<VehicleResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeVehicle(data: any): Promise<VehicleResponse> {
  const response = await api.post<VehicleResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateVehicle(
  id: number,
  data: any
): Promise<VehicleResponse> {
  const response = await api.put<VehicleResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteVehicle(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}
