import { api } from "@/lib/config";
import {
  JOBPOSITION,
  type getJobPositionProps,
  type JobPositionResource,
  type JobPositionResourceById,
  type JobPositionResponse,
} from "./jobposition.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = JOBPOSITION;

export async function getJobPosition({
  params,
}: getJobPositionProps): Promise<JobPositionResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<JobPositionResponse>(ENDPOINT, config);
  return data;
}

export async function getAllJobPositions(): Promise<JobPositionResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<JobPositionResource[]>(ENDPOINT, config);
  return data;
}

export async function findJobPositionById(
  id: number
): Promise<JobPositionResourceById> {
  const response = await api.get<JobPositionResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeJobPosition(data: any): Promise<JobPositionResponse> {
  const response = await api.post<JobPositionResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateJobPosition(
  id: number,
  data: any
): Promise<JobPositionResponse> {
  const response = await api.put<JobPositionResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteJobPosition(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}
