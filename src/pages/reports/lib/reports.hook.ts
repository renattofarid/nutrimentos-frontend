import { useReportsStore } from "./reports.store";
import type {
  CommissionsReportParams,
  CustomerAccountStatementParams,
  DeliverySheetReportParams,
  KardexReportParams,
  SaleBySellerReportParams,
} from "./reports.interface";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  downloadReport,
  fetchSelectOptions,
  fetchSearchEndpoint,
} from "./reports.actions";
import { errorToast, successToast } from "@/lib/core.function";
import { VEHICLE } from "@/pages/vehicle/lib/vehicle.interface";
import { CLIENT } from "@/pages/client/lib/client.interface";

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
  const { kardexReport, kardexLoading, kardexError, fetchKardexReport } =
    useReportsStore();

  return {
    data: kardexReport,
    isLoading: kardexLoading,
    error: kardexError,
    refetch: () => fetchKardexReport(params || {}),
    fetch: fetchKardexReport,
  };
}

export function useSaleBySellerReport(params?: SaleBySellerReportParams) {
  const {
    saleBySellerReport,
    saleBySellerLoading,
    saleBySellerError,
    fetchSaleBySellerReport,
  } = useReportsStore();

  return {
    data: saleBySellerReport,
    isLoading: saleBySellerLoading,
    error: saleBySellerError,
    refetch: () => fetchSaleBySellerReport(params || {}),
    fetch: fetchSaleBySellerReport,
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

export const useCustomerAsyncSearch = (params: {
  search?: string;
  page?: number;
  per_page?: number;
  [key: string]: any;
}) => {
  return useQuery({
    queryKey: ["customers-async-search", params],
    queryFn: () => fetchSearchEndpoint(CLIENT.ENDPOINT, params),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useVehicleAsyncSearch = (params: {
  search?: string;
  page?: number;
  per_page?: number;
  [key: string]: any;
}) => {
  return useQuery({
    queryKey: ["vehicles-async-search", params],
    queryFn: () => fetchSearchEndpoint(VEHICLE.ENDPOINT, params),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useUserAsyncSearch = (params: {
  search?: string;
  page?: number;
  per_page?: number;
  [key: string]: any;
}) => {
  return useQuery({
    queryKey: ["users-async-search", params],
    queryFn: () => fetchSearchEndpoint("/users", params),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
};

export function useDeliverySheetReport(params?: DeliverySheetReportParams) {
  const {
    deliverySheetReport,
    deliverySheetLoading,
    deliverySheetError,
    fetchDeliverySheetReport,
  } = useReportsStore();

  return {
    data: deliverySheetReport,
    isLoading: deliverySheetLoading,
    error: deliverySheetError,
    refetch: () => fetchDeliverySheetReport(params || {}),
    fetch: fetchDeliverySheetReport,
  };
}

export function useCommissionsReport(params?: CommissionsReportParams) {
  const {
    commissionsReport,
    commissionsLoading,
    commissionsError,
    fetchCommissionsReport,
  } = useReportsStore();

  return {
    data: commissionsReport,
    isLoading: commissionsLoading,
    error: commissionsError,
    refetch: () => fetchCommissionsReport(params || {}),
    fetch: fetchCommissionsReport,
  };
}
