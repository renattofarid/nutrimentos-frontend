import { useEffect } from "react";
import { useSupplierStore } from "./supplier.store";
import { SUPPLIER, SUPPLIER_ROLE_CODE } from "./supplier.interface";
import { useQuery } from "@tanstack/react-query";
import { getPersons } from "@/pages/person/lib/person.actions";

const { QUERY_KEY } = SUPPLIER;

export function useSuppliers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () =>
      getPersons({
        params: {
          ...params,
          role_names: [SUPPLIER_ROLE_CODE],
        },
      }),
  });
}

export function useAllSuppliers() {
  const { allSuppliers, isLoadingAll, error, fetchAllSuppliers } =
    useSupplierStore();

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
