import { api } from "@/lib/config";
import type { AxiosRequestConfig } from "axios";
import type { getDocumentTypeProps, DocumentTypeResponse, DocumentTypeResourceById, DocumentTypeResource } from "./document-type.interface";
import type { DocumentTypeSchema } from "./document-type.schema";

const ENDPOINT = "/document-type";

export const getDocumentTypes = async ({ params }: getDocumentTypeProps = {}): Promise<DocumentTypeResponse> => {
  const response = await api.get(ENDPOINT, { params });
  return response.data;
};

export const getAllDocumentTypes = async (): Promise<DocumentTypeResource[]> => {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<DocumentTypeResource[]>(ENDPOINT, config);
  return data;
};

export const getDocumentTypeById = async (id: number): Promise<DocumentTypeResourceById> => {
  const response = await api.get(`${ENDPOINT}/${id}`);
  return response.data;
};

export const createDocumentType = async (data: DocumentTypeSchema): Promise<DocumentTypeResourceById> => {
  const response = await api.post(ENDPOINT, data);
  return response.data;
};

export const updateDocumentType = async (id: number, data: DocumentTypeSchema): Promise<DocumentTypeResourceById> => {
  const response = await api.put(`${ENDPOINT}/${id}`, data);
  return response.data;
};

export const deleteDocumentType = async (id: number): Promise<void> => {
  await api.delete(`${ENDPOINT}/${id}`);
};

