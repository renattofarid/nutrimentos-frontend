import { useEffect } from "react";
import { usePriceListStore } from "./pricelist.store";

/**
 * Hook para obtener listas de precio con paginación
 */
export function usePriceList(params?: Record<string, unknown>) {
  const { priceLists, meta, isLoading, error, fetchPriceLists } =
    usePriceListStore();

  useEffect(() => {
    if (!priceLists) {
      fetchPriceLists(params);
    }
  }, [priceLists, fetchPriceLists]);

  return {
    data: priceLists,
    meta,
    isLoading,
    error,
    refetch: fetchPriceLists,
  };
}

export function useAllPriceList() {
  const { allPriceLists, isLoadingAll, error, fetchAllPriceLists } =
    usePriceListStore();

  useEffect(() => {
    if (!allPriceLists) fetchAllPriceLists();
  }, [allPriceLists, fetchAllPriceLists]);
  return {
    data: allPriceLists,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllPriceLists,
  };
}

/**
 * Hook para obtener una lista de precio por ID
 */
export function usePriceListById(id: number) {
  const { priceList, isFinding, error, fetchPriceList } = usePriceListStore();

  useEffect(() => {
    fetchPriceList(id);
  }, [id, fetchPriceList]);

  return {
    data: priceList,
    isFinding,
    error,
    refetch: () => fetchPriceList(id),
  };
}
