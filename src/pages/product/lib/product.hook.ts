import { useEffect } from "react";
import { useProductStore } from "./product.store";
import { useQuery } from "@tanstack/react-query";
import { getProduct } from "./product.actions";
import { PRODUCT } from "./product.interface";

const { QUERY_KEY } = PRODUCT;

export function useProduct(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getProduct({ params }),
    enabled: !!params,
  });
}

export function useHomeProducts() {
  const { allProducts, isLoadingAll, error, fetchAllProducts } =
    useProductStore();

  useEffect(() => {
    if (!allProducts) fetchAllProducts();
  }, [allProducts, fetchAllProducts]);

  return {
    data: allProducts,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllProducts,
  };
}

export function useProductById(id: number) {
  const { product, isFinding, error, fetchProduct } = useProductStore();

  useEffect(() => {
    fetchProduct(id);
  }, [id, fetchProduct]);

  return {
    data: product,
    isFinding,
    error,
    refetch: () => fetchProduct(id),
  };
}
