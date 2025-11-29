import { api } from "@/lib/config";
import type {
  GuideResponse,
  GuideResource,
  GuideResourceById,
  CreateGuideRequest,
  UpdateGuideRequest,
  GuideMotiveResponse,
} from "./guide.interface";
import { GUIDE_ENDPOINT, GUIDE_MOTIVE_ENDPOINT } from "./guide.interface";

// ============================================
// GUIDE - Main CRUD Actions
// ============================================

export interface GetGuidesParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  warehouse_id?: number;
  customer_id?: number;
  date_from?: string;
  date_to?: string;
}

export const getGuides = async (
  params?: GetGuidesParams
): Promise<GuideResponse> => {
  const response = await api.get<GuideResponse>(GUIDE_ENDPOINT, {
    params,
  });
  return response.data;
};

export const getAllGuides = async (): Promise<GuideResource[]> => {
  const response = await api.get<GuideResource[]>(GUIDE_ENDPOINT, {
    params: { all: true },
  });
  return response.data;
};

export const findGuideById = async (
  id: number
): Promise<GuideResourceById> => {
  const response = await api.get<GuideResourceById>(`${GUIDE_ENDPOINT}/${id}`);
  return response.data;
};

export const storeGuide = async (
  data: CreateGuideRequest
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(GUIDE_ENDPOINT, data);
  return response.data;
};

export const updateGuide = async (
  id: number,
  data: UpdateGuideRequest
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(
    `${GUIDE_ENDPOINT}/${id}`,
    data
  );
  return response.data;
};

export const deleteGuide = async (
  id: number
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `${GUIDE_ENDPOINT}/${id}`
  );
  return response.data;
};

// ============================================
// GUIDE MOTIVES - Read Only Actions
// ============================================

export const getGuideMotives = async (): Promise<GuideMotiveResponse> => {
  const response = await api.get<GuideMotiveResponse>(GUIDE_MOTIVE_ENDPOINT);
  return response.data;
};
