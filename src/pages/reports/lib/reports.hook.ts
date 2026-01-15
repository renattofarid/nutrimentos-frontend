import { useReportsStore } from "./reports.store";
import type { CustomerAccountStatementParams } from "./reports.interface";

export function useCustomerAccountStatement(
  params?: CustomerAccountStatementParams
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
