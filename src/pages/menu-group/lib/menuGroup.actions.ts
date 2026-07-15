import { api } from "@/lib/config";
import type { AxiosRequestConfig } from "axios";
import {
  MENU_GROUP,
  type getMenuGroupProps,
  type MenuGroupResource,
} from "./menuGroup.interface";

const { ENDPOINT } = MENU_GROUP;

export async function getAllMenuGroups({
  params,
}: getMenuGroupProps = {}): Promise<MenuGroupResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
    },
  };
  const { data } = await api.get<MenuGroupResource[]>(ENDPOINT, config);
  return data;
}

export async function storeMenuGroup(data: any): Promise<MenuGroupResource> {
  const response = await api.post<{ message: string; data: MenuGroupResource }>(
    ENDPOINT,
    data
  );
  return response.data.data;
}

export async function updateMenuGroup(
  id: number,
  data: any
): Promise<MenuGroupResource> {
  const response = await api.put<{ message: string; data: MenuGroupResource }>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data.data;
}

export async function deleteMenuGroup(id: number): Promise<any> {
  const { data } = await api.delete<any>(`${ENDPOINT}/${id}`);
  return data;
}
