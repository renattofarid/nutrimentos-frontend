import { useEffect } from "react";
import { useSupplierStore } from "./supplier.store";

export function useSuppliers(params?: Record<string, unknown>) {
  const { suppliers, meta, isLoading, error, fetchSuppliers } = useSupplierStore();

  useEffect(() => {
    if (!suppliers) {
      fetchSuppliers({ params });
    }
  }, [suppliers, fetchSuppliers]);

  return {
    data: suppliers,
    meta,
    isLoading,
    error,
    refetch: (refetchParams?: Record<string, unknown>) => {
      return fetchSuppliers({ params: refetchParams });
    },
  };
}

export function useAllSuppliers() {
  const { allSuppliers, isLoadingAll, error, fetchAllSuppliers } = useSupplierStore();

  useEffect(() => {
    if (!allSuppliers) {
      fetchAllSuppliers({ params: {} });
    }
  }, [allSuppliers, fetchAllSuppliers]);

  return {
    data: allSuppliers,
    isLoading: isLoadingAll,
    error,
    refetch: (refetchParams?: Record<string, unknown>) => {
      return fetchAllSuppliers({ params: refetchParams });
    },
  };
}
