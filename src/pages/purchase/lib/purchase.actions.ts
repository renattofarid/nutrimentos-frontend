import { api } from "@/lib/config";
import {
  PURCHASE,
  type getPurchaseProps,
  type PurchaseResource,
  type PurchaseResourceById,
  type PurchaseResponse,
  type CreatePurchaseRequest,
  type CreatePurchaseResponse,
} from "./purchase.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = PURCHASE;

export async function getPurchase({
  params,
}: getPurchaseProps): Promise<PurchaseResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<PurchaseResponse>(ENDPOINT, config);
  return data;
}

export async function getAllPurchases(): Promise<PurchaseResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<PurchaseResource[]>(ENDPOINT, config);
  return data;
}

export async function findPurchaseById(
  id: number
): Promise<PurchaseResourceById> {
  const response = await api.get<PurchaseResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storePurchase(
  data: CreatePurchaseRequest
): Promise<CreatePurchaseResponse> {
  const response = await api.post<CreatePurchaseResponse>(ENDPOINT, data);
  return response.data;
}

export async function updatePurchase(
  id: number,
  data: CreatePurchaseRequest
): Promise<CreatePurchaseResponse> {
  const response = await api.put<CreatePurchaseResponse>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deletePurchase(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}
