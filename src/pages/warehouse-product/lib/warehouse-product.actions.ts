import { api } from "@/lib/config";
import {
  WAREHOUSE_PRODUCT,
  type getWarehouseProductProps,
  type WarehouseProductResponse,
} from "./warehouse-product.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = WAREHOUSE_PRODUCT;

export async function getWarehouseProduct({
  params,
}: getWarehouseProductProps): Promise<WarehouseProductResponse> {
  const config: AxiosRequestConfig = {
    params: {
      per_page: DEFAULT_PER_PAGE,
      ...params,
    },
  };
  const { data } = await api.get<WarehouseProductResponse>(ENDPOINT, config);
  return data;
}
