import { api } from "@/lib/api";
import { SETTING, SettingResource } from "./setting.interface";
import { SettingSchemaCreate, SettingSchemaEdit } from "./setting.schema";

const { ENDPOINT } = SETTING;

export const getSettings = async (): Promise<SettingResource[]> => {
  const response = await api.get(`${ENDPOINT}?all=true`);
  return response.data.data;
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
