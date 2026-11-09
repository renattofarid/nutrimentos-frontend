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

// Búsqueda por documento: "B001-00067904" se envía como serie + numero;
// sin guion se envía solo como numero (igual que el buscador de ventas).
export function useSaleByDocument(
  params: GetSalesParams & { search?: string },
) {
  const { search, ...rest } = params;
  const doc = (search ?? "").trim();
  const dashIndex = doc.indexOf("-");
  const serie = dashIndex > 0 ? doc.slice(0, dashIndex) : undefined;
  const numero =
    dashIndex > 0 ? doc.slice(dashIndex + 1) || undefined : doc || undefined;
  return useSale({ ...rest, serie, numero });
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
