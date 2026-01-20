import { useState } from "react";
import {
  getDynamicPrice,
  type DynamicPriceRequest,
  type DynamicPriceResponse,
} from "./dynamic-price.actions";

export const useDynamicPrice = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDynamicPrice = async (
    request: DynamicPriceRequest,
  ): Promise<DynamicPriceResponse | null> => {
    setIsLoading(true);
    setError(null);
    const response = await getDynamicPrice(request);
    setIsLoading(false);
    return response;
  };

  return {
    fetchDynamicPrice,
    isLoading,
    error,
  };
};
