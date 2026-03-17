import { useEffect } from "react";
import { useWarehouseProductStore } from "./warehouse-product.store";

export function useWarehouseProduct(params?: Record<string, unknown>) {
  const { warehouseProducts, meta, isLoading, error, fetchWarehouseProducts } =
    useWarehouseProductStore();

  useEffect(() => {
    if (!warehouseProducts) fetchWarehouseProducts(params);
  }, [warehouseProducts, fetchWarehouseProducts]);

  return {
    data: warehouseProducts,
    meta,
    isLoading,
    error,
    refetch: fetchWarehouseProducts,
  };
}
