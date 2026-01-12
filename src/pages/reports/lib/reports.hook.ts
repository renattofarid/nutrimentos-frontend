import { useReportsStore } from "./reports.store";
import type { CustomerAccountStatementParams } from "./reports.interface";

export function useCustomerAccountStatement(
  params?: CustomerAccountStatementParams
) {
  const {
    customerAccountStatement,
    meta,
    isLoading,
    error,
    fetchCustomerAccountStatement,
  } = useReportsStore();

  return {
    data: customerAccountStatement,
    meta,
    isLoading,
    error,
    refetch: () => fetchCustomerAccountStatement(params || {}),
    fetch: fetchCustomerAccountStatement,
  };
}
