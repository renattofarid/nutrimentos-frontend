import { api } from "@/lib/config";

export interface DynamicPriceRequest {
  product_id: string;
  person_id: string;
  quantity_sacks: number;
  quantity_kg: number;
}

export interface DynamicPriceResponse {
  product: {
    id: number;
    name: string;
    codigo: string;
    is_kg: number;
    weight: string;
    price_per_kg: string;
    unit: string;
  };
  client_category: {
    id: number;
    name: string;
  };
  weight_range: {
    id: number;
    name: string;
    formatted_range: string;
  };
  quantities: {
    sacks: number;
    kg: number;
    total_weight_kg: number;
  };
  pricing: {
    unit_price: string;
    price_per_kg: string;
    subtotal: string;
    currency: string;
  };
}

export async function getDynamicPrice(
  request: DynamicPriceRequest
): Promise<DynamicPriceResponse> {
  console.log("Enviando request a API:", JSON.stringify(request, null, 2));
  const { data } = await api.post<DynamicPriceResponse>(
    "/price-lists/dynamic-price",
    request
  );
  console.log("Respuesta de API:", JSON.stringify(data, null, 2));
  return data;
}
