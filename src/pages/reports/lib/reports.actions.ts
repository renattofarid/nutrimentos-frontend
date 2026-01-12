import { api } from "@/lib/config";
import type { AxiosRequestConfig } from "axios";
import type {
  CustomerAccountStatementParams,
  CustomerAccountStatementResponse,
} from "./reports.interface";

const REPORTS_ENDPOINT = "/reports";

export async function getCustomerAccountStatement(
  params: CustomerAccountStatementParams
): Promise<CustomerAccountStatementResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };

  const { data } = await api.get<CustomerAccountStatementResponse>(
    `${REPORTS_ENDPOINT}/customer-account-statement`,
    config
  );

  return data;
}

export async function exportCustomerAccountStatement(
  params: CustomerAccountStatementParams,
  exportType: "excel" | "pdf"
): Promise<Blob> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      export: exportType,
    },
    responseType: "blob",
  };

  const { data } = await api.get<Blob>(
    `${REPORTS_ENDPOINT}/customer-account-statement`,
    config
  );

  return data;
}
