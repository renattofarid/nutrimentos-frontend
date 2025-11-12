import { api } from "@/lib/config";
import {
  PURCHASE_INSTALLMENT,
  type getPurchaseInstallmentProps,
  type PurchaseInstallmentResource,
  type PurchaseInstallmentResourceById,
  type PurchaseInstallmentResponse,
  type ExpiringAlertsResponse,
} from "./purchaseinstallment.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = PURCHASE_INSTALLMENT;

export async function getPurchaseInstallment({
  params,
}: getPurchaseInstallmentProps): Promise<PurchaseInstallmentResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<PurchaseInstallmentResponse>(ENDPOINT, config);
  return data;
}

export async function getAllPurchaseInstallments(): Promise<
  PurchaseInstallmentResource[]
> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<PurchaseInstallmentResource[]>(
    ENDPOINT,
    config
  );
  return data;
}

export async function findPurchaseInstallmentById(
  id: number
): Promise<PurchaseInstallmentResourceById> {
  const response = await api.get<PurchaseInstallmentResourceById>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function getExpiringAlerts(): Promise<ExpiringAlertsResponse> {
  const response = await api.get<ExpiringAlertsResponse>(
    "/purchase-installments/expiring-alert"
  );
  return response.data;
}

export async function deletePurchaseInstallment(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}
