import { api } from "@/lib/config";
import {
  PAYMENT_CONCEPT,
  type getPaymentConceptProps,
  type PaymentConceptResource,
  type PaymentConceptResourceById,
  type PaymentConceptResponse,
} from "./payment-concept.interface";
import type { PaymentConceptSchema } from "./payment-concept.schema";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = PAYMENT_CONCEPT;

export async function getPaymentConcept({
  params,
}: getPaymentConceptProps): Promise<PaymentConceptResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<PaymentConceptResponse>(ENDPOINT, config);
  return data;
}

export async function getAllPaymentConcepts(): Promise<PaymentConceptResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<PaymentConceptResource[]>(ENDPOINT, config);
  return data;
}

export async function findPaymentConceptById(
  id: number
): Promise<PaymentConceptResourceById> {
  const response = await api.get<PaymentConceptResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storePaymentConcept(
  data: PaymentConceptSchema
): Promise<PaymentConceptResponse> {
  const response = await api.post<PaymentConceptResponse>(ENDPOINT, data);
  return response.data;
}

export async function updatePaymentConcept(
  id: number,
  data: PaymentConceptSchema
): Promise<PaymentConceptResponse> {
  const response = await api.put<PaymentConceptResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deletePaymentConcept(
  id: number
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`${ENDPOINT}/${id}`);
  return data;
}
