import { useReportsStore } from "./reports.store";
import type {
  CustomerAccountStatementParams,
  InventoryReportParams,
  KardexReportParams,
} from "./reports.interface";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  downloadReport,
  fetchSelectOptions,
  fetchSearchEndpoint,
} from "./reports.actions";
import { errorToast, successToast } from "@/lib/core.function";

export function useCustomerAccountStatement(
  params?: CustomerAccountStatementParams,
) {
  const {
    customerAccountStatement,
    isLoading,
    error,
    fetchCustomerAccountStatement,
  } = useReportsStore();

  return {
    data: customerAccountStatement,
    isLoading,
    error,
    refetch: () => fetchCustomerAccountStatement(params || {}),
    fetch: fetchCustomerAccountStatement,
  };
}

export function useInventoryReport() {
  const {
    inventoryReport,
    inventoryLoading,
    inventoryError,
    fetchInventoryReport,
  } = useReportsStore();

  return {
    data: inventoryReport,
    isLoading: inventoryLoading,
    error: inventoryError,
    fetch: fetchInventoryReport,
  };
}

export function useKardexReport(params?: KardexReportParams) {
  const {
    kardexReport,
    kardexLoading,
    kardexError,
    fetchKardexReport,
  } = useReportsStore();

  return {
    data: kardexReport,
    isLoading: kardexLoading,
    error: kardexError,
    refetch: () => fetchKardexReport(params || {}),
    fetch: fetchKardexReport,
  };
}

export const useDownloadReport = () => {
  return useMutation({
    mutationFn: ({
      endpoint,
      params,
      method,
    }: {
      endpoint: string;
      params: Record<string, any>;
      method?: "get" | "post";
    }) => downloadReport(endpoint, params, method),
    onSuccess: () => {
      successToast("El reporte se ha descargado correctamente");
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ||
          "Ocurrió un error al descargar el reporte",
      );
    },
  });
};

export const useSelectOptions = (endpoint?: string) => {
  return useQuery({
    queryKey: ["select-options", endpoint],
    queryFn: () => fetchSelectOptions(endpoint!),
    enabled: !!endpoint,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};

export const useProductAsyncSearch = (params: {
  search?: string;
  page?: number;
  per_page?: number;
  [key: string]: any;
}) => {
  return useQuery({
    queryKey: ["products-async-search", params],
    queryFn: () => fetchSearchEndpoint("/product", params),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useWarehouseAsyncSearch = (params: {
  search?: string;
  page?: number;
  per_page?: number;
  [key: string]: any;
}) => {
  return useQuery({
    queryKey: ["warehouses-async-search", params],
    queryFn: () => fetchSearchEndpoint("/warehouse", params),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
};
