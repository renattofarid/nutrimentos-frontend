import { api } from "@/lib/config";
import type { AxiosRequestConfig } from "axios";
import type {
  PriceListResponse,
  PriceListByIdResponse,
  PriceListRequest,
  AssignClientRequest,
  GetPriceRequest,
  GetPriceResponse,
  PriceList,
} from "./pricelist.interface";
import { PRICELIST } from "./pricelist.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const ENDPOINT = PRICELIST.ENDPOINT;

// Obtener todas las listas de precio con paginación
export async function getPriceLists({
  params,
}: {
  params?: Record<string, any>;
}): Promise<PriceListResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: params?.per_page || DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<PriceListResponse>(ENDPOINT, config);
  return data;
}

// Obtener todas las listas de precio con paginación
export async function getAllPriceLists({
  params,
}: {
  params?: Record<string, any>;
}): Promise<PriceList[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
    },
  };
  const { data } = await api.get<PriceList[]>(ENDPOINT, config);
  return data;
}

// Obtener una lista de precio por ID
export async function findPriceListById(
  id: number
): Promise<PriceListByIdResponse> {
  const response = await api.get<PriceListByIdResponse>(`${ENDPOINT}/${id}`);
  return response.data;
}

// Crear una nueva lista de precio
export async function storePriceList(
  data: PriceListRequest
): Promise<PriceListByIdResponse> {
  return (await api.post<PriceListByIdResponse>(ENDPOINT, data)).data;
}

// Actualizar una lista de precio
export async function updatePriceList(
  id: number,
  data: PriceListRequest
): Promise<PriceListByIdResponse> {
  return (await api.put<PriceListByIdResponse>(`${ENDPOINT}/${id}`, data)).data;
}

// Eliminar una lista de precio
export async function deletePriceList(id: number): Promise<any> {
  return (await api.delete<any>(`${ENDPOINT}/${id}`)).data;
}

// Asignar cliente a una lista de precio
export async function assignClientToPriceList(
  id: number,
  data: AssignClientRequest
): Promise<any> {
  return (await api.post<any>(`${ENDPOINT}/${id}/assign-client`, data)).data;
}

// Consultar precio para un cliente, producto y peso específico
export async function getPrice(
  data: GetPriceRequest
): Promise<GetPriceResponse> {
  return (await api.post<GetPriceResponse>(`${ENDPOINT}/get-price`, data)).data;
}
