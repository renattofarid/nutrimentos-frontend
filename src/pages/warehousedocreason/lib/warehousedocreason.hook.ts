import { useEffect } from "react";
import { useWarehouseDocReasonStore } from "./warehousedocreason.store";

export function useWarehouseDocReason(params?: Record<string, unknown>) {
  const { warehouseDocReasons, meta, isLoading, error, fetchWarehouseDocReasons } =
    useWarehouseDocReasonStore();

  useEffect(() => {
    if (!warehouseDocReasons) fetchWarehouseDocReasons(params);
  }, [warehouseDocReasons, fetchWarehouseDocReasons]);

  return {
    data: warehouseDocReasons,
    meta,
    isLoading,
    error,
    refetch: fetchWarehouseDocReasons,
  };
}

export function useAllWarehouseDocReasons() {
  const { allWarehouseDocReasons, isLoadingAll, error, fetchAllWarehouseDocReasons } =
    useWarehouseDocReasonStore();

  useEffect(() => {
    if (!allWarehouseDocReasons) fetchAllWarehouseDocReasons();
  }, [allWarehouseDocReasons, fetchAllWarehouseDocReasons]);

  return {
    data: allWarehouseDocReasons,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllWarehouseDocReasons,
  };
}

export function useWarehouseDocReasonById(id: number) {
  const { warehouseDocReason, isFinding, error, fetchWarehouseDocReason } = useWarehouseDocReasonStore();

  useEffect(() => {
    fetchWarehouseDocReason(id);
  }, [id]);

  return {
    data: warehouseDocReason,
    isFinding,
    error,
    refetch: () => fetchWarehouseDocReason(id),
  };
}
