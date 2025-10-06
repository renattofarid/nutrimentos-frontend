import { api } from "@/lib/config";
import { SETTING, type SettingResource } from "./setting.interface";
import type { SettingSchemaCreate, SettingSchemaEdit } from "./setting.schema";

const { ENDPOINT } = SETTING;

export interface SettingResourceById {
  data: SettingResource;
}

export const getSettings = async (): Promise<SettingResource[]> => {
  const response = await api.get(`${ENDPOINT}`);
  return response.data.data;
};

export const findSettingById = async (
  id: number
): Promise<SettingResourceById> => {
  const response = await api.get<SettingResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
};

export const createSetting = async (
  data: SettingSchemaCreate
): Promise<SettingResource> => {
  const response = await api.post(ENDPOINT, data);
  return response.data;
};

export const updateSetting = async (
  id: number,
  data: SettingSchemaEdit
): Promise<SettingResource> => {
  const response = await api.put(`${ENDPOINT}/${id}`, data);
  return response.data;
};

export const deleteSetting = async (id: number): Promise<void> => {
  await api.delete(`${ENDPOINT}/${id}`);
};
