import { api } from "@/lib/config";
import type { AxiosRequestConfig } from "axios";
import {
  PERMISSION,
  type getPermissionProps,
  type PermissionMutationResponse,
  type PermissionResource,
} from "./permission.interface";

const { ENDPOINT } = PERMISSION;

export async function getAllPermissions({
  params,
}: getPermissionProps = {}): Promise<PermissionResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
    },
  };
  const { data } = await api.get<PermissionResource[]>(ENDPOINT, config);
  return data;
}

export async function storePermission(
  data: any
): Promise<PermissionMutationResponse> {
  const response = await api.post<PermissionMutationResponse>(ENDPOINT, data);
  return response.data;
}

export async function updatePermission(
  id: number,
  data: any
): Promise<PermissionMutationResponse> {
  const response = await api.put<PermissionMutationResponse>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deletePermission(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}
