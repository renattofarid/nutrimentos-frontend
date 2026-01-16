import { useState } from "react";
import { getDynamicPrice, type DynamicPriceRequest, type DynamicPriceResponse } from "./dynamic-price.actions";

export const useDynamicPrice = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDynamicPrice = async (
    request: DynamicPriceRequest
  ): Promise<DynamicPriceResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getDynamicPrice(request);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Error al obtener el precio dinámico");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchDynamicPrice,
    isLoading,
    error,
  };
};
