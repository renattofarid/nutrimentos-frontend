import { useEffect } from "react";
import { usePurchaseStore } from "./purchase.store";

export function usePurchase(params?: Record<string, unknown>) {
  const { purchases, meta, isLoading, error, fetchPurchases } =
    usePurchaseStore();

  useEffect(() => {
    if (!purchases) fetchPurchases(params);
  }, [purchases, fetchPurchases]);

  return {
    data: purchases,
    meta,
    isLoading,
    error,
    refetch: fetchPurchases,
  };
}

export function useAllPurchases() {
  const { allPurchases, isLoadingAll, error, fetchAllPurchases } =
    usePurchaseStore();

  useEffect(() => {
    if (!allPurchases) fetchAllPurchases();
  }, [allPurchases, fetchAllPurchases]);

  return {
    data: allPurchases,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllPurchases,
  };
}

export function usePurchaseById(id: number) {
  const { purchase, isFinding, error, fetchPurchase } = usePurchaseStore();

  useEffect(() => {
    fetchPurchase(id);
  }, [id]);

  return {
    data: purchase,
    isFinding,
    error,
    refetch: () => fetchPurchase(id),
  };
}
