import { api } from "@/lib/config";
import type { ClientPriceListResponse } from "./client.interface";

/**
 * Obtiene la lista de precios de un cliente
 * @param person_id - ID de la persona (cliente)
 * @returns Promise con la respuesta de la lista de precios
 */
export const getClientPriceList = async (
  person_id: number
): Promise<ClientPriceListResponse> => {
  const response = await api.post<ClientPriceListResponse>(
    "/pricelist/get-price",
    { person_id }
  );
  return response.data;
};
