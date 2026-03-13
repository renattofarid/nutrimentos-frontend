import { useQuery } from "@tanstack/react-query";
import { getDeliverySheets, getAllDeliverySheets } from "./deliverysheet.actions";
import { DELIVERY_SHEET_QUERY_KEY } from "./deliverysheet.interface";

export function useDeliverySheets(params?: Record<string, any>) {
  return useQuery({
    queryKey: [DELIVERY_SHEET_QUERY_KEY, params],
    queryFn: () => getDeliverySheets(params),
  });
}

export function useAllDeliverySheets() {
  return useQuery({
    queryKey: [DELIVERY_SHEET_QUERY_KEY, "all"],
    queryFn: getAllDeliverySheets,
  });
}
