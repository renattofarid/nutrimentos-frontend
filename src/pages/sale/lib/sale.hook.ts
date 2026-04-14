import { useQuery } from "@tanstack/react-query";
import { getSales, getAllSales, findSaleById } from "./sale.actions";
import type { GetSalesParams } from "./sale.actions";
import { SALE_QUERY_KEY } from "./sale.interface";

export function useSale(params?: GetSalesParams) {
  return useQuery({
    queryKey: [SALE_QUERY_KEY, params],
    queryFn: () => getSales(params),
  });
}

export function useAllSales() {
  return useQuery({
    queryKey: [SALE_QUERY_KEY, "all"],
    queryFn: getAllSales,
  });
}

export function useSaleById(id: number) {
  return useQuery({
    queryKey: [SALE_QUERY_KEY, id],
    queryFn: () => findSaleById(id),
    enabled: !!id,
  });
}
