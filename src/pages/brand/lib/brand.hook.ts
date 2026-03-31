import { useEffect } from "react";
import { useBrandStore } from "./brand.store";
import { useQuery } from "@tanstack/react-query";
import { getBrand } from "./brand.actions";
import { BRAND } from "./brand.interface";

const { QUERY_KEY } = BRAND;

export function useBrand(params?: Record<string, unknown>) {
  const { brands, meta, isLoading, error, fetchBrands } = useBrandStore();

  useEffect(() => {
    if (!brands) fetchBrands(params);
  }, [brands, fetchBrands]);

  return {
    data: brands,
    meta,
    isLoading,
    error,
    refetch: fetchBrands,
  };
}
export function useBrandSearch(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () =>
      getBrand({
        params: { params },
      }),
  });
}

export function useAllBrands() {
  const { allBrands, isLoadingAll, error, fetchAllBrands } = useBrandStore();

  useEffect(() => {
    if (!allBrands) fetchAllBrands();
  }, [allBrands, fetchAllBrands]);

  return {
    data: allBrands,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllBrands,
  };
}

export function useBrandById(id: number) {
  const { brand, isFinding, error, fetchBrand } = useBrandStore();

  useEffect(() => {
    fetchBrand(id);
  }, [id]);

  return {
    data: brand,
    isFinding,
    error,
    refetch: () => fetchBrand(id),
  };
}
