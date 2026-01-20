import { api } from "@/lib/config";
import type {
  PersonZoneResource,
  PersonZoneCreateRequest,
  PersonZoneUpdateRequest,
  PersonZoneResponse,
  PersonZonesResponse,
} from "./personzone.interface";

/**
 * Obtiene todas las direcciones de una persona
 */
export const getPersonZones = async (
  personId: number
): Promise<PersonZoneResource[]> => {
  const response = await api.get<PersonZonesResponse>(
    `/personzone/person/${personId}`
  );
  return response.data.data;
};

/**
 * Obtiene la dirección primaria de una persona
 */
export const getPrimaryPersonZone = async (
  personId: number
): Promise<PersonZoneResource | null> => {
  const response = await api.get<PersonZoneResponse>(
    `/personzone/person/${personId}/primary`
  );
  return response.data.data;
};

/**
 * Obtiene una dirección por su ID
 */
export const getPersonZoneById = async (
  id: number
): Promise<PersonZoneResource> => {
  const response = await api.get<PersonZoneResponse>(`/personzone/${id}`);
  return response.data.data;
};

/**
 * Crea una nueva dirección
 */
export const createPersonZone = async (
  data: PersonZoneCreateRequest
): Promise<PersonZoneResource> => {
  const response = await api.post<PersonZoneResponse>("/personzone", data);
  return response.data.data;
};

/**
 * Actualiza una dirección existente
 */
export const updatePersonZone = async (
  id: number,
  data: PersonZoneUpdateRequest
): Promise<PersonZoneResource> => {
  const response = await api.put<PersonZoneResponse>(`/personzone/${id}`, data);
  return response.data.data;
};

/**
 * Establece una dirección como primaria
 */
export const setPersonZonePrimary = async (
  id: number
): Promise<PersonZoneResource> => {
  const response = await api.patch<PersonZoneResponse>(
    `/personzone/${id}/set-primary`
  );
  return response.data.data;
};

/**
 * Elimina una dirección
 */
export const deletePersonZone = async (id: number): Promise<void> => {
  await api.delete(`/personzone/${id}`);
};
