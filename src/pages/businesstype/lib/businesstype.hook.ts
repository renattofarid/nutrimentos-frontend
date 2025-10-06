import { useEffect } from "react";
import { useBusinessTypeStore } from "./businesstype.store";

export function useBusinessType(params?: Record<string, unknown>) {
  const { businessTypes, meta, isLoading, error, fetchBusinessTypes } =
    useBusinessTypeStore();

  useEffect(() => {
    if (!businessTypes) fetchBusinessTypes(params);
  }, [businessTypes, fetchBusinessTypes]);

  return {
    data: businessTypes,
    meta,
    isLoading,
    error,
    refetch: fetchBusinessTypes,
  };
}

export function useAllBusinessTypes() {
  const { allBusinessTypes, isLoadingAll, error, fetchAllBusinessTypes } =
    useBusinessTypeStore();

  useEffect(() => {
    if (!allBusinessTypes) fetchAllBusinessTypes();
  }, [allBusinessTypes, fetchAllBusinessTypes]);

  return {
    data: allBusinessTypes,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllBusinessTypes,
  };
}

export function useBusinessTypeById(id: number) {
  const { businessType, isFinding, error, fetchBusinessType } = useBusinessTypeStore();

  useEffect(() => {
    fetchBusinessType(id);
  }, [id]);

  return {
    data: businessType,
    isFinding,
    error,
    refetch: () => fetchBusinessType(id),
  };
}
